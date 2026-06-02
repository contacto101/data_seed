const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) initializeApp();

const ALLOWED_DOMAIN = 'dataseed.cl';
const ALLOWED_PROVIDER = 'google.com';
const DEFAULT_ALLOWED_EMAILS = 'contacto@dataseed.cl';
const REPORT_DOC = 'privateReports/demeterDailyLatest';

function sendJson(res, status, payload) {
  res
    .status(status)
    .set('Cache-Control', 'no-store')
    .set('X-Content-Type-Options', 'nosniff')
    .json(payload);
}

function publicError(status) {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 405) return 'method_not_allowed';
  return 'internal_error';
}

function extractToken(req) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

function allowedEmails() {
  return String(process.env.REPORT_ALLOWED_EMAILS || DEFAULT_ALLOWED_EMAILS)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function authenticate(req) {
  const token = extractToken(req);
  if (!token) {
    const error = new Error('missing_bearer_token');
    error.status = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(token, true);
  } catch (authError) {
    const error = new Error('invalid_or_revoked_token');
    error.status = 401;
    error.code = authError.code;
    throw error;
  }

  const email = String(decoded.email || '').trim().toLowerCase();
  const domain = email.split('@').pop() || '';
  const provider = decoded.firebase?.sign_in_provider || '';

  if (!decoded.email_verified) {
    const error = new Error('email_not_verified');
    error.status = 403;
    throw error;
  }
  if (domain !== ALLOWED_DOMAIN) {
    const error = new Error('domain_not_allowed');
    error.status = 403;
    throw error;
  }
  const emailAllowlist = allowedEmails();
  if (emailAllowlist.length && !emailAllowlist.includes(email)) {
    const error = new Error('email_not_allowed');
    error.status = 403;
    throw error;
  }
  if (provider !== ALLOWED_PROVIDER) {
    const error = new Error('provider_not_allowed');
    error.status = 403;
    throw error;
  }

  return { uid: decoded.uid, email, domain };
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function sanitizeReport(input) {
  const report = asObject(input);
  const changedFiles = Array.isArray(report.changedFiles)
    ? report.changedFiles.map((item) => safeString(item)).filter(Boolean).slice(0, 80)
    : [];

  return {
    schemaVersion: Number(report.schemaVersion || 1),
    generatedAt: safeString(report.generatedAt),
    title: safeString(report.title, 'Reporte diario Demeter'),
    date: safeString(report.date),
    system: asObject(report.system),
    activity: asObject(report.activity),
    changedFiles,
    executiveSummary: Array.isArray(report.executiveSummary)
      ? report.executiveSummary.map((item) => safeString(item)).filter(Boolean).slice(0, 20)
      : [],
    health: asObject(report.health),
    technicalSummary: Array.isArray(report.technicalSummary)
      ? report.technicalSummary.map((item) => safeString(item)).filter(Boolean).slice(0, 40)
      : []
  };
}

exports.getDemeterDailyReport = onRequest(
  {
    region: 'us-central1',
    cors: false,
    invoker: 'public'
  },
  async (req, res) => {
    if (req.method !== 'GET') return sendJson(res, 405, { error: publicError(405) });

    try {
      const viewer = await authenticate(req);
      const snapshot = await getFirestore().doc(REPORT_DOC).get();
      if (!snapshot.exists) return sendJson(res, 404, { error: publicError(404) });

      const data = snapshot.data() || {};
      const report = sanitizeReport(data.report || data);
      return sendJson(res, 200, {
        ...report,
        servedAt: new Date().toISOString(),
        viewer: { domain: viewer.domain }
      });
    } catch (error) {
      const status = error.status || 500;
      logger.error('[getDemeterDailyReport]', {
        status,
        code: error.code || '',
        message: error.message || 'unknown_error'
      });
      return sendJson(res, status, { error: publicError(status) });
    }
  }
);
