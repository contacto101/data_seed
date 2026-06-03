const { filterOpportunities } = require('./data');

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        reject(new Error('body_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function classifyAlert(tender, threshold = 80) {
  const score = Number(tender.score || 0);
  if (score >= Math.max(threshold, 90)) return 'alta';
  if (score >= threshold) return 'media';
  return 'baja';
}

function buildAlerts({ industry = 'ti', region = 'all', keyword = '', minScore = 80 } = {}) {
  const opportunities = filterOpportunities({ industry, region, keyword });
  return opportunities
    .filter((tender) => tender.score >= Number(minScore || 0))
    .map((tender) => ({
      id: `alert-${tender.id}`,
      tenderId: tender.id,
      priority: classifyAlert(tender, minScore),
      title: tender.title,
      organization: tender.organization,
      region: tender.region,
      score: tender.score,
      budget: tender.budget,
      close: tender.close,
      reason: `Coincide con perfil ${industry}, score ${tender.score}% y cierre ${tender.close}.`,
      channels: ['dashboard'],
      status: 'ready'
    }));
}

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const payload = req.method === 'POST' ? await readBody(req) : (req.query || {});
    const alerts = buildAlerts(payload);

    return sendJson(res, 200, {
      connected: true,
      mode: 'dry_run_until_notification_channel',
      count: alerts.length,
      alerts,
      meta: {
        source: 'Motor de alertas demo. En producción se ejecuta contra ChileCompra y entrega por email/webhook/WhatsApp según configuración.',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return sendJson(res, 400, { error: 'bad_request', message: 'JSON inválido o demasiado grande.' });
  }
};

module.exports.buildAlerts = buildAlerts;
