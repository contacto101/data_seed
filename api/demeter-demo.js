const MAX_MESSAGE_CHARS = 1200;
const MAX_HISTORY_ITEMS = 12;
const ALLOWED_PROBLEMS = new Set(['reportes', 'hubspot', 'automatizacion', 'datos']);

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function safeString(value, max = MAX_MESSAGE_CHARS) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY_ITEMS).map((item) => ({
    role: item && item.role === 'assistant' ? 'assistant' : 'user',
    content: safeString(item && item.content, MAX_MESSAGE_CHARS)
  })).filter((item) => item.content);
}

function buildSystemPrompt() {
  return `Eres Demeter, agente AI de DataSeed. Atiendes una demo interactiva guiada desde la landing.

Objetivo comercial:
- Entender el problema del visitante: reportes, HubSpot, automatización o datos.
- Hacer preguntas breves para diagnosticar madurez, sistemas, fricción y urgencia.
- Generar un mini diagnóstico ejecutivo cuando haya contexto suficiente.
- Pedir datos mínimos para agendar o dejar lead calificado: nombre, empresa, email corporativo y objetivo.

Límites:
- No prometas precios finales, contratos, SLA ni capacidades no confirmadas.
- No solicites contraseñas, tokens, datos personales sensibles ni datos confidenciales de clientes.
- Si piden integrar sistemas reales, explica que se revisa con acceso seguro y aprobación humana.
- Habla como DataSeed/Demeter, en español, tono consultivo y conciso.

Formato de respuesta para web:
- Máximo 130 palabras.
- Usa HTML simple permitido: <b>, <ul>, <li>, <br>.
- Si corresponde, termina con una pregunta concreta para avanzar.
- Si ya hay suficiente información, incluye un bloque: <b>Mini diagnóstico:</b> ... y <b>Siguiente paso:</b> ...`;
}

function fallbackReply(problem, message, history) {
  const hasLeadIntent = /agenda|reuni[oó]n|contact|correo|email|llamar|hablar/i.test(message);
  const asked = history.filter((item) => item.role === 'assistant').length;
  const labels = {
    reportes: 'reportes y tableros',
    hubspot: 'HubSpot y CRM',
    automatizacion: 'automatización operativa',
    datos: 'datos, integración y gobierno'
  };

  if (hasLeadIntent || asked >= 3) {
    return `<b>Mini diagnóstico:</b> El caso apunta a ${labels[problem] || 'una mejora de datos'} con potencial de automatizar diagnóstico, priorización y reporting.<br><br><b>Siguiente paso:</b> dejemos nombre, empresa y email corporativo para agendar una revisión corta con el equipo DataSeed.`;
  }

  if (problem === 'reportes') {
    return 'Perfecto. Para diagnosticar reportes necesito entender 3 cosas:<ul><li>¿Qué reportes se hacen manualmente hoy?</li><li>¿De qué sistemas salen los datos?</li><li>¿Cada cuánto se actualizan?</li></ul>¿Cuál es el reporte que más tiempo consume?';
  }
  if (problem === 'hubspot') {
    return 'Bien. En HubSpot normalmente revisamos calidad de datos, lifecycle stages, automatizaciones y reporting comercial.<br><br>¿El dolor principal es carga manual, datos duplicados, falta de visibilidad del pipeline o automatizaciones que no funcionan?';
  }
  if (problem === 'automatizacion') {
    return 'Entendido. Para una demo de automatización conviene partir por un flujo repetitivo y medible.<br><br>¿Qué proceso se repite todas las semanas y hoy depende de copiar/pegar, planillas, correos o aprobaciones manuales?';
  }
  return 'Perfecto. Para diagnosticar datos necesito ubicar fuentes, calidad y uso de negocio.<br><br>¿Los datos están principalmente en ERP/CRM, planillas, bases SQL, APIs o mezclados entre varios sistemas?';
}

async function callDemeterApi(payload) {
  const apiBase = String(process.env.HERMES_API_BASE_URL || '').replace(/\/$/, '');
  const apiKey = process.env.HERMES_API_KEY || '';
  if (!apiBase || !apiKey) return null;

  const messages = [
    { role: 'system', content: payload.system },
    ...payload.history,
    { role: 'user', content: payload.message }
  ];

  const response = await fetch(`${apiBase}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.HERMES_API_MODEL || 'hermes-agent',
      messages,
      temperature: 0.2,
      stream: false
    })
  });

  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text); } catch (_) { data = {}; }

  if (!response.ok) {
    const error = new Error('demeter_api_error');
    error.status = response.status;
    throw error;
  }

  return safeString(data.choices?.[0]?.message?.content || data.reply || data.response || text, 4000);
}

async function callDemeterWebhook(payload) {
  const webhookUrl = process.env.HERMES_DEMO_WEBHOOK_URL || '';
  if (!webhookUrl) return null;

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.HERMES_DEMO_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.HERMES_DEMO_WEBHOOK_SECRET}`;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text); } catch (_) { data = { reply: text }; }

  if (!response.ok) {
    const error = new Error('demeter_webhook_error');
    error.status = response.status;
    throw error;
  }

  return safeString(data.reply || data.response || data.message || data.text || text, 4000);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });

  try {
    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
    const sessionId = safeString(body.sessionId, 80) || `demo_${Date.now()}`;
    const problem = ALLOWED_PROBLEMS.has(body.problem) ? body.problem : 'datos';
    const message = safeString(body.message);
    const history = normalizeHistory(body.history);

    if (!message) return sendJson(res, 400, { error: 'empty_message' });

    const payload = {
      source: 'dataseed_landing_demo',
      sessionId,
      problem,
      message,
      history,
      system: buildSystemPrompt(),
      leadPolicy: {
        collect: ['nombre', 'empresa', 'email corporativo', 'objetivo'],
        avoid: ['passwords', 'tokens', 'datos sensibles', 'informacion confidencial de terceros']
      }
    };

    const demeterReply = await callDemeterApi(payload) || await callDemeterWebhook(payload);
    const reply = demeterReply || fallbackReply(problem, message, history);

    return sendJson(res, 200, {
      ok: true,
      sessionId,
      connected: Boolean(demeterReply),
      reply
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: 'demo_unavailable',
      reply: 'La demo no está disponible en este momento. Deja tu nombre, empresa y email corporativo para que el equipo DataSeed coordine una revisión.'
    });
  }
};
