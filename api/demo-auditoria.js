// Demo de auditoría continua para clientes del portal.
//
// La demo corre en un servidor de Dataseed (el motor, en el VPS): el navegador
// recibe sólo la pantalla y cada clic vuelve al motor, que calcula y responde.
// Esta función exige la sesión del portal (__Host-ds_*) en una organización
// habilitada (api/_lib/demo-auditoria.js) y reenvía al motor firmando cada
// pedido con la identidad de quien entró (api/_lib/puente-demo.js).
//
// Rutas del sitio → rutas del motor:
//   /auditoria-continua              GET  → /
//   /api/demo-auditoria/cascara.js   GET  → /cascara.js
//   /api/demo-auditoria/inicio       POST → /inicio
//   /api/demo-auditoria/evento       POST → /evento
//   /api/demo-auditoria/voz          POST → /voz
//
// Ni la demo ni la dirección del motor ni la clave entran a este repositorio,
// que es público: DEMO_AC_ORIGIN y DEMO_PUENTE_CLAVE viven en el proyecto de Vercel.
import { AuthorizationError } from './auth/_lib/authorization.js';
import { clearSessionCookies } from './auth/_lib/cookies.js';
import { authenticateRequest } from './auth/_lib/session.js';
import { tieneDemo } from './_lib/demo-auditoria.js';
import { firmarPedido } from './_lib/puente-demo.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

const RECURSOS = {
  pagina: { ruta: '/', metodo: 'GET', plazoMs: 20000, tipo: 'text/html; charset=utf-8' },
  cascara: { ruta: '/cascara.js', metodo: 'GET', plazoMs: 10000, tipo: 'text/javascript; charset=utf-8' },
  inicio: { ruta: '/inicio', metodo: 'POST', plazoMs: 30000, tope: 3 * 1024 * 1024, entra: 'application/json' },
  evento: { ruta: '/evento', metodo: 'POST', plazoMs: 58000, tope: 3 * 1024 * 1024, entra: 'application/json' },
  voz: { ruta: '/voz', metodo: 'POST', plazoMs: 58000, tope: 4 * 1024 * 1024, entra: 'application/octet-stream' },
};
// estados del motor que el navegador tiene que ver tal cual: la pantalla reacciona a cada uno
const DEL_MOTOR = new Set([200, 400, 404, 409, 413, 429]);

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

// El cuerpo se lee del stream sin tocar req.body: lo que se firma son los mismos
// bytes que llegan al motor. Pasado el tope se sigue leyendo sin guardar, para
// que el 413 llegue al navegador.
async function leerCuerpo(req, tope) {
  const partes = [];
  let bytes = 0;
  for await (const parte of req) {
    bytes += parte.length;
    if (bytes <= tope) partes.push(parte);
  }
  if (bytes > tope) throw conEstado(413, 'El pedido es demasiado grande.');
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
    if (req.method !== recurso.metodo) {
      res.setHeader('Allow', recurso.metodo);
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

    const origen = String(env.DEMO_AC_ORIGIN || '').replace(/\/+$/, '');
    const clave = String(env.DEMO_PUENTE_CLAVE || '');
    const usuario = String(session.identity?.user?.id || '');
    const org = String(session.identity?.organization?.id || '');
    if (!origen.startsWith('https://') || clave.length < 32 || !usuario || !org) return noDisponible(res, esPagina);

    let cuerpo = Buffer.alloc(0);
    if (recurso.metodo === 'POST') {
      try {
        cuerpo = await leerCuerpo(req, recurso.tope);
      } catch (error) {
        return res.status(error.status || 400).json({ error: error.message });
      }
    }
    const headers = firmarPedido({ clave, metodo: recurso.metodo, ruta: recurso.ruta, usuario, org, cuerpo });
    if (recurso.entra) headers['Content-Type'] = recurso.entra;

    let upstream;
    try {
      upstream = await fetchImpl(origen + recurso.ruta, {
        method: recurso.metodo,
        headers,
        body: recurso.metodo === 'POST' ? cuerpo : undefined,
        redirect: 'manual',
        signal: AbortSignal.timeout(recurso.plazoMs),
      });
    } catch (_error) {
      return noDisponible(res, esPagina);
    }

    // Un 401 del motor es una firma rechazada (clave distinta en los dos lados):
    // no se reenvía, porque la pantalla lo leería como sesión vencida y
    // recargaría sin fin. Tampoco se reenvían redirecciones ni errores del motor.
    if (!DEL_MOTOR.has(upstream.status) || (esPagina && upstream.status !== 200)) return noDisponible(res, esPagina);

    let texto;
    try {
      texto = await upstream.text();
    } catch (_error) {
      return noDisponible(res, esPagina);
    }
    res.setHeader('Content-Type', recurso.tipo || 'application/json; charset=utf-8');
    if (esPagina) res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    return res.status(upstream.status).send(texto);
  };
}

export default createDemoAuditoriaHandler();
