const { buildAgentAnswer, getTenderById } = require('./data');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const { tenderId, question = '' } = await readBody(req);
    const tender = getTenderById(tenderId);
    const reply = buildAgentAnswer(tender, question);

    return sendJson(res, 200, {
      connected: true,
      mode: process.env.ANTHROPIC_API_KEY ? 'llm_ready' : 'deterministic_demo_agent',
      tenderId: tender.id,
      question,
      ...reply
    });
  } catch (error) {
    return sendJson(res, 400, { error: 'bad_request', message: 'JSON inválido o demasiado grande.' });
  }
};
