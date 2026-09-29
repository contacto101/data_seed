// Demo de auditoría continua para clientes del portal.
//
// La maqueta vive en un proyecto privado de Vercel con la protección activada.
// Esta función la trae con un secreto de bypass propio y la sirve sólo a quien
// tenga sesión del portal (__Host-ds_*) en una organización habilitada
// (api/_lib/demo-auditoria.js). La página llama a /api/agente y /api/voz; esas
// rutas llegan acá por vercel.json y se reenvían a las funciones de la maqueta
// con el mismo secreto, así que tampoco se usan sin sesión.
//
// Ni el artefacto ni la dirección del proyecto entran a este repositorio, que
// es público: DEMO_AC_ORIGIN y DEMO_AC_BYPASS viven en el proyecto de Vercel.
import { AuthorizationError } from './auth/_lib/authorization.js';
import { clearSessionCookies } from './auth/_lib/cookies.js';
import { authenticateRequest } from './auth/_lib/session.js';
import { tieneDemo } from './_lib/demo-auditoria.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

const RECURSOS = {
  pagina: { ruta: '/', metodos: ['GET'], plazoMs: 20000 },
  agente: { ruta: '/api/agente', metodos: ['GET', 'POST'], plazoMs: 58000 },
  voz: { ruta: '/api/voz', metodos: ['GET', 'POST'], plazoMs: 58000 },
};

// Los mismos topes que aplican las funciones de la maqueta; acá cortan antes
// de mandar el cuerpo a otra función.
const MAX_AGENTE_BYTES = 256 * 1024;
const MAX_VOZ_BYTES = 4 * 1024 * 1024;

function conEstado(status, message) {
  return Object.assign(new Error(message), { status });
}

function aviso(res, status, titulo, texto) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${titulo}</title><body><main><h1>${titulo}</h1><p>${texto}</p><a href="/portal">Volver al portal</a></main></body></html>`);
}

function noDisponible(res, esPagina) {
  if (esPagina) {
    return aviso(res, 503, 'Demo no disponible', 'La demo no responde en este momento. Intenta nuevamente en unos minutos.');
  }
  return res.status(503).json({ error: 'La demo no responde en este momento.' });
}

function cuerpoAgente(req) {
  const cuerpo = req.body;
  if (!cuerpo || typeof cuerpo !== 'object') throw conEstado(400, 'Se esperaba un cuerpo JSON.');
  const texto = JSON.stringify(cuerpo);
  if (Buffer.byteLength(texto) > MAX_AGENTE_BYTES) throw conEstado(413, 'La conversación es demasiado larga.');
  return texto;
}

// El audio se lee del stream sin tocar req.body, para que Vercel no intente
// interpretarlo. Pasado el tope se sigue leyendo sin guardar: cortar la
// conexión a mitad puede impedir que el 413 llegue al navegador.
async function leerAudio(req) {
  const partes = [];
  let bytes = 0;
  for await (const parte of req) {
    bytes += parte.length;
    if (bytes <= MAX_VOZ_BYTES) partes.push(parte);
  }
  if (bytes > MAX_VOZ_BYTES) throw conEstado(413, 'El audio pesa más de 4 MB.');
  if (!bytes) throw conEstado(400, 'No llegó audio.');
  return Buffer.concat(partes);
}

export function createDemoAuditoriaHandler({
  authenticate = authenticateRequest,
  clearCookies = clearSessionCookies,
  fetchImpl = globalThis.fetch,
  env = process.env,
} = {}) {
  return async function demoAuditoriaHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

    const nombre = String(req.query?.recurso || '');
    const recurso = Object.hasOwn(RECURSOS, nombre) ? RECURSOS[nombre] : null;
    if (!recurso) return res.status(404).json({ error: 'No encontrado.' });
    if (!recurso.metodos.includes(req.method)) {
      res.setHeader('Allow', recurso.metodos.join(', '));
      return res.status(405).json({ error: 'Método no permitido.' });
    }
    const esPagina = nombre === 'pagina';

    let session;
    try {
      session = await authenticate(req, { env });
    } catch (error) {
      if (!(error instanceof AuthorizationError || error?.status === 401 || error?.status === 403)) {
        return noDisponible(res, esPagina);
      }
      if (esPagina) {
        res.setHeader('Set-Cookie', clearCookies());
        res.setHeader('Location', '/site/login.html?reason=session');
        return res.status(303).end();
      }
      return res.status(401).json({ error: 'Inicia sesión en el portal para usar la demo.' });
    }
    if (session.setCookies) res.setHeader('Set-Cookie', session.setCookies);

    if (!tieneDemo(session.identity, env)) {
      if (esPagina) return aviso(res, 403, 'Sin acceso a la demo', 'Tu organización no tiene habilitada esta demo.');
      return res.status(403).json({ error: 'Tu organización no tiene habilitada esta demo.' });
    }

    const origen = String(env.DEMO_AC_ORIGIN || '');
    const secreto = env.DEMO_AC_BYPASS;
    if (!origen.startsWith('https://') || !secreto) return noDisponible(res, esPagina);

    const headers = { 'x-vercel-protection-bypass': secreto };
    let body;
    if (req.method === 'POST') {
      try {
        if (nombre === 'voz') {
          body = await leerAudio(req);
          headers['Content-Type'] = 'application/octet-stream';
        } else {
          body = cuerpoAgente(req);
          headers['Content-Type'] = 'application/json';
        }
      } catch (error) {
        return res.status(error.status || 400).json({ error: error.message });
      }
    }

    let upstream;
    try {
      upstream = await fetchImpl(new URL(recurso.ruta, origen), {
        method: req.method,
        headers,
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(recurso.plazoMs),
      });
    } catch (_error) {
      return noDisponible(res, esPagina);
    }

    // Una redirección es la protección de Vercel rechazando el secreto: no se
    // reenvía, porque llevaría al navegador al login de Vercel.
    if (upstream.status >= 300 && upstream.status < 400) return noDisponible(res, esPagina);
    if (esPagina && upstream.status !== 200) return noDisponible(res, true);

    let texto;
    try {
      texto = await upstream.text();
    } catch (_error) {
      return noDisponible(res, esPagina);
    }
    res.setHeader('Content-Type', esPagina ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8');
    if (esPagina) res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    return res.status(upstream.status).send(texto);
  };
}

export default createDemoAuditoriaHandler();
