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
import { esFalloDeSesion } from './auth/_lib/authorization.js';
import { clearSessionCookies } from './auth/_lib/cookies.js';
import { logAuthFailure } from './auth/_lib/diagnostics.js';
import { isSameOriginRequest, methodNotAllowed, sendJson, setNoStore } from './auth/_lib/http.js';
import { authenticateRequest } from './auth/_lib/session.js';
import { tieneDemo } from './_lib/demo-auditoria.js';
import { configuracionPuente, MotorNoDisponible, pedirAlMotor } from './_lib/puente-demo.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

const HTML = 'text/html; charset=utf-8';
const JSON_UTF8 = 'application/json; charset=utf-8';
const MB = 1024 * 1024;
// los plazos quedan bajo maxDuration: el 503 propio tiene que llegar antes que el corte de Vercel
const RECURSOS = {
  pagina: { ruta: '/', metodo: 'GET', plazoMs: 20000, salida: HTML, pagina: true },
  cascara: { ruta: '/cascara.js', metodo: 'GET', plazoMs: 10000, salida: 'text/javascript; charset=utf-8' },
  inicio: { ruta: '/inicio', metodo: 'POST', plazoMs: 30000, tope: 3 * MB, entrada: 'application/json', salida: JSON_UTF8 },
  evento: { ruta: '/evento', metodo: 'POST', plazoMs: 50000, tope: 3 * MB, entrada: 'application/json', salida: JSON_UTF8 },
  voz: { ruta: '/voz', metodo: 'POST', plazoMs: 50000, tope: 4 * MB, entrada: 'application/octet-stream', salida: JSON_UTF8 },
};

// La pantalla del motor trae scripts en línea, así que script-src no se puede
// cerrar; sí se corta a dónde puede hablar y desde dónde se la puede enmarcar.
const CSP_DEMO = "connect-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'";

function aviso(res, status, titulo, texto) {
  res.setHeader('Content-Type', HTML);
  return res.status(status).send(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${titulo}</title><body><main><h1>${titulo}</h1><p>${texto}</p><a href="/portal">Volver al portal</a></main></body></html>`);
}

// Cómo responde cada fallo: la página habla con una persona, la API con la cáscara.
const COMO_PAGINA = {
  noDisponible: (res) => aviso(res, 503, 'Demo no disponible', 'La demo no responde en este momento. Intenta nuevamente en unos minutos.'),
  sinSesion: (res, clearCookies) => {
    res.setHeader('Set-Cookie', clearCookies());
    res.setHeader('Location', '/site/login.html?reason=session');
    return res.status(303).end();
  },
  sinAcceso: (res) => aviso(res, 403, 'Sin acceso a la demo', 'Tu organización no tiene habilitada esta demo.'),
};
const COMO_API = {
  noDisponible: (res) => sendJson(res, 503, { error: 'La demo no responde en este momento.' }),
  sinSesion: (res) => sendJson(res, 401, { error: 'Inicia sesión en el portal para usar la demo.' }),
  sinAcceso: (res) => sendJson(res, 403, { error: 'Tu organización no tiene habilitada esta demo.' }),
};

// El cuerpo se lee del stream sin tocar req.body: lo que se firma son los mismos
// bytes que llegan al motor. Pasado el tope devuelve null, pero sigue leyendo sin
// guardar: si se respondiera antes, el navegador vería la conexión cortada y no el 413.
async function leerCuerpo(req, tope) {
  const partes = [];
  let bytes = 0;
  for await (const parte of req) {
    bytes += parte.length;
    if (bytes <= tope) partes.push(parte);
  }
  return bytes > tope ? null : Buffer.concat(partes);
}

export function createDemoAuditoriaHandler({
  authenticate = authenticateRequest,
  clearCookies = clearSessionCookies,
  fetchImpl = globalThis.fetch,
  env = process.env,
} = {}) {
  return async function demoAuditoriaHandler(req, res) {
    setNoStore(res);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

    const nombre = String(req.query?.recurso || '');
    const recurso = Object.hasOwn(RECURSOS, nombre) ? RECURSOS[nombre] : null;
    if (!recurso) return sendJson(res, 404, { error: 'No encontrado.' });
    if (req.method !== recurso.metodo) return methodNotAllowed(res, [recurso.metodo]);
    // un POST desde otro subdominio de dataseed.cl llevaría la cookie (SameSite=Lax es por sitio)
    if (recurso.metodo === 'POST' && !isSameOriginRequest(req, env)) return sendJson(res, 403, { error: 'Origen no permitido.' });
    const responder = recurso.pagina ? COMO_PAGINA : COMO_API;

    let session;
    try {
      session = await authenticate(req, { env });
    } catch (error) {
      logAuthFailure('demo_authenticate', error);
      return esFalloDeSesion(error) ? responder.sinSesion(res, clearCookies) : responder.noDisponible(res);
    }
    if (session.setCookies) res.setHeader('Set-Cookie', session.setCookies);
    if (!tieneDemo(session.identity, env)) return responder.sinAcceso(res);

    const puente = configuracionPuente(env);
    if (!puente) return responder.noDisponible(res);

    let cuerpo = Buffer.alloc(0);
    if (recurso.metodo === 'POST') {
      try {
        cuerpo = await leerCuerpo(req, recurso.tope);
      } catch {
        return sendJson(res, 400, { error: 'No se pudo leer el pedido.' });
      }
      if (!cuerpo) return sendJson(res, 413, { error: 'El pedido es demasiado grande.' });
    }

    let respuesta;
    try {
      respuesta = await pedirAlMotor({ puente, fetchImpl, recurso, identity: session.identity, cuerpo });
    } catch (error) {
      if (error instanceof MotorNoDisponible) return responder.noDisponible(res);
      throw error;
    }
    res.setHeader('Content-Type', recurso.salida);
    if (recurso.pagina) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Content-Security-Policy', CSP_DEMO);
    }
    return res.status(respuesta.status).send(respuesta.texto);
  };
}

export default createDemoAuditoriaHandler();
