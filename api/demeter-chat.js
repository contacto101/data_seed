function jsonResponse(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  const hermesBaseUrl = process.env.DEMETER_API_SERVER_URL || process.env.HERMES_API_SERVER_URL;
  const apiKey = process.env.DEMETER_API_KEY || process.env.API_SERVER_KEY || process.env.HERMES_API_KEY;

  if (!hermesBaseUrl || !apiKey) {
    return jsonResponse(500, { error: 'missing_hermes_environment' });
  }

  const payload = await request.json();
  const messages = Array.isArray(payload.messages)
    ? payload.messages.filter((message) => ['user', 'assistant'].includes(message.role))
    : [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.DEMETER_REQUEST_TIMEOUT_MS || 12000));

  let upstream;
  try {
    upstream = await fetch(`${hermesBaseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
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
  } catch (error) {
    const code = error.name === 'AbortError' ? 'hermes_upstream_timeout' : 'hermes_upstream_unreachable';
    return jsonResponse(502, { error: code });
  } finally {
    clearTimeout(timeout);
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
