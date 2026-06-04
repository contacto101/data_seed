function sendJson(response, statusCode, body) {
  response.status(statusCode).setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.end(JSON.stringify(body));
}

module.exports = async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'method_not_allowed' });
    return;
  }

  const hermesBaseUrl = process.env.DEMETER_API_SERVER_URL || process.env.HERMES_API_SERVER_URL;
  const apiKey = process.env.DEMETER_API_KEY || process.env.API_SERVER_KEY || process.env.HERMES_API_KEY;

  if (!hermesBaseUrl || !apiKey) {
    sendJson(response, 500, { error: 'missing_hermes_environment' });
    return;
  }

  const payload = request.body || {};
  const messages = Array.isArray(payload.messages)
    ? payload.messages.filter((message) => ['user', 'assistant'].includes(message.role))
    : [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.DEMETER_REQUEST_TIMEOUT_MS || 12000));

  try {
    const upstream = await fetch(`${hermesBaseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.DEMETER_MODEL || 'hermes-agent',
        messages,
        max_tokens: Number(process.env.DEMETER_MAX_TOKENS || 1200),
        metadata: {
          source: 'dataseed-internal-agent-console',
          sessionId: payload.sessionId || ''
        }
      })
    });

    const text = await upstream.text();
    response.status(upstream.status).setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.end(text);
  } catch (error) {
    const code = error.name === 'AbortError' ? 'hermes_upstream_timeout' : 'hermes_upstream_unreachable';
    sendJson(response, 502, { error: code });
  } finally {
    clearTimeout(timeout);
  }
};
