import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHash, createHmac } from 'node:crypto';

import { AuthorizationError } from '../api/auth/_lib/authorization.js';
import { createDemoAuditoriaHandler } from '../api/demo-auditoria.js';
import { createPortalHandler } from '../api/portal.js';

const ORIGEN = 'https://motor.example.test/demo-ac';
const CLAVE = 'clave-del-puente-de-prueba-0123456789abcdef';
const env = { DEMO_AC_ORGS: 'org-demo, org-interna', DEMO_AC_ORIGIN: ORIGEN, DEMO_PUENTE_CLAVE: CLAVE };

function identidad(orgId) {
  return {
    user: { id: 'user-1', email: 'cliente@example.com' },
    profile: { full_name: 'Cliente', role: 'client' },
    membership: { role: 'member' },
    organization: { id: orgId, name: 'Cliente', type: 'client', plan: 'pro' },
  };
}

function request(recurso, overrides = {}) {
  return { method: 'GET', url: '/', headers: {}, query: { recurso }, ...overrides };
}

// un POST como lo manda la cáscara: el cuerpo llega por el stream, desde el mismo origen
const MISMO_ORIGEN = { origin: 'https://dataseed.cl', host: 'dataseed.cl' };
function post(recurso, cuerpo, headers = MISMO_ORIGEN) {
  const datos = Buffer.isBuffer(cuerpo) ? cuerpo : Buffer.from(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo));
  return Object.assign(Readable.from([datos]), { method: 'POST', url: '/', headers, query: { recurso } });
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(payload) { this.body = payload; return this; },
    json(payload) { this.body = payload; return this; },
    end(payload = '') { this.body = payload; return this; },
  };
}

function upstream(status, body = '') {
  return { status, text: async () => body };
}

function handler({ orgId = 'org-demo', auth, fetchImpl, entorno = env } = {}) {
  const llamadas = [];
  const h = createDemoAuditoriaHandler({
    env: entorno,
    authenticate: auth || (async () => ({ identity: identidad(orgId), setCookies: ['sesion-renovada'] })),
    clearCookies: () => ['clear-session'],
    fetchImpl: async (url, init) => {
      llamadas.push({ url: String(url), init });
      return fetchImpl ? fetchImpl(url, init) : upstream(200, '<!doctype html><title>Demo</title>');
    },
  });
  return { h, llamadas };
}

// la firma que el motor verifica, calculada acá sin pasar por el código del sitio
function firmaEsperada({ metodo, ruta, momento, usuario, org, cuerpo }) {
  const huella = createHash('sha256').update(cuerpo || Buffer.alloc(0)).digest('hex');
  return createHmac('sha256', CLAVE).update([metodo, ruta, momento, usuario, org, huella].join('\n')).digest('base64url');
}

const sinSesion = async () => { throw new AuthorizationError('Authentication required', { status: 401 }); };

test('sin sesión, la página redirige al login y no toca el motor', async () => {
  const { h, llamadas } = handler({ auth: sinSesion });
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 303);
  assert.equal(res.headers.Location, '/site/login.html?reason=session');
  assert.deepEqual(res.headers['Set-Cookie'], ['clear-session']);
  assert.equal(llamadas.length, 0);
});

test('sin sesión, las rutas de la demo responden 401 y no llaman al motor', async () => {
  for (const [recurso, req] of [['cascara', request('cascara')], ['evento', post('evento', {})], ['voz', post('voz', Buffer.alloc(10))]]) {
    const { h, llamadas } = handler({ auth: sinSesion });
    const res = response();
    await h(req, res);
    assert.equal(res.statusCode, 401, recurso);
    assert.equal(llamadas.length, 0, recurso);
  }
});

test('una organización fuera de la lista recibe 403, y una lista vacía no deja entrar a nadie', async () => {
  for (const [orgId, entorno] of [['org-otra', env], ['org-demo', { ...env, DEMO_AC_ORGS: '' }]]) {
    for (const req of [request('pagina'), post('evento', {})]) {
      const { h, llamadas } = handler({ orgId, entorno });
      const res = response();
      await h(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(llamadas.length, 0);
    }
  }
});

test('con acceso, la página se pide al motor firmada con la identidad y la clave no vuelve al navegador', async () => {
  const { h, llamadas } = handler();
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<title>Demo<\/title>/);
  assert.match(res.headers['Content-Type'], /text\/html/);
  assert.match(res.headers['Cache-Control'], /no-store/);
  assert.deepEqual(res.headers['Set-Cookie'], ['sesion-renovada']);
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, `${ORIGEN}/`);
  const cab = llamadas[0].init.headers;
  assert.equal(cab['X-Demo-Usuario'], 'user-1');
  assert.equal(cab['X-Demo-Org'], 'org-demo');
  assert.equal(cab['X-Demo-Firma'], firmaEsperada({ metodo: 'GET', ruta: '/', momento: cab['X-Demo-Momento'], usuario: 'user-1', org: 'org-demo' }));
  assert.ok(Math.abs(Number(cab['X-Demo-Momento']) - Date.now() / 1000) < 5);
  assert.equal(llamadas[0].init.redirect, 'manual');
  assert.doesNotMatch(JSON.stringify(res.headers) + res.body, new RegExp(CLAVE));
  assert.match(res.headers['Content-Security-Policy'], /connect-src 'self'/);
  assert.match(res.headers['Content-Security-Policy'], /frame-ancestors 'self'/);
});

test('un POST sin Origin o desde otro origen no llega al motor ni autentica', async () => {
  for (const headers of [{}, { origin: 'https://api.dataseed.cl', host: 'dataseed.cl' }]) {
    let autenticado = false;
    const { h, llamadas } = handler({ auth: async () => { autenticado = true; return { identity: identidad('org-demo') }; } });
    const res = response();
    await h(post('evento', '{}', headers), res);
    assert.equal(res.statusCode, 403, JSON.stringify(headers));
    assert.equal(autenticado, false);
    assert.equal(llamadas.length, 0);
  }
});

test('un evento viaja con los mismos bytes que se firmaron, y la respuesta del motor vuelve tal cual', async () => {
  const cuerpo = '{"sobre":"abc","ev":{"h":"x1"}}';
  const { h, llamadas } = handler({ fetchImpl: async () => upstream(409, '{"reiniciar":true}') });
  const res = response();
  await h(post('evento', cuerpo), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body, '{"reiniciar":true}');
  assert.equal(llamadas[0].url, `${ORIGEN}/evento`);
  assert.equal(llamadas[0].init.method, 'POST');
  assert.equal(llamadas[0].init.body.toString('utf8'), cuerpo);
  const cab = llamadas[0].init.headers;
  assert.equal(cab['X-Demo-Firma'], firmaEsperada({ metodo: 'POST', ruta: '/evento', momento: cab['X-Demo-Momento'], usuario: 'user-1', org: 'org-demo', cuerpo: Buffer.from(cuerpo) }));
});

test('si el motor rechaza la firma, el navegador no ve un 401 (recargaría sin fin) sino que la demo no responde', async () => {
  for (const req of [request('pagina'), post('evento', {})]) {
    const { h } = handler({ fetchImpl: async () => upstream(401, '{"error":"pedido sin firma válida"}') });
    const res = response();
    await h(req, res);
    assert.equal(res.statusCode, 503);
    assert.doesNotMatch(String(JSON.stringify(res.body)), /firma/);
  }
});

test('una redirección o un error del motor no se reenvían', async () => {
  for (const status of [302, 500, 502]) {
    const { h } = handler({ fetchImpl: async () => upstream(status) });
    const res = response();
    await h(request('pagina'), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers.Location, undefined);
  }
});

test('sin origen https, sin clave o con una clave corta, la demo responde 503 sin llamar al motor', async () => {
  for (const entorno of [{ ...env, DEMO_AC_ORIGIN: '' }, { ...env, DEMO_PUENTE_CLAVE: '' },
    { ...env, DEMO_PUENTE_CLAVE: 'corta' }, { ...env, DEMO_AC_ORIGIN: 'http://inseguro.test' }]) {
    const { h, llamadas } = handler({ entorno });
    const res = response();
    await h(request('pagina'), res);
    assert.equal(res.statusCode, 503);
    assert.equal(llamadas.length, 0);
  }
});

test('un pedido sobre el tope se corta acá con 413', async () => {
  for (const [recurso, bytes] of [['evento', 3 * 1024 * 1024 + 1], ['voz', 4 * 1024 * 1024 + 1]]) {
    const { h, llamadas } = handler();
    const res = response();
    await h(post(recurso, Buffer.alloc(bytes, 1)), res);
    assert.equal(res.statusCode, 413, recurso);
    assert.equal(llamadas.length, 0, recurso);
  }
});

test('el dictado reenvía el audio tal cual', async () => {
  const { h, llamadas } = handler({ fetchImpl: async () => upstream(200, '{"texto":"hola"}') });
  const res = response();
  await h(post('voz', Buffer.alloc(1000, 2)), res);
  assert.equal(res.statusCode, 200);
  assert.equal(llamadas[0].url, `${ORIGEN}/voz`);
  assert.equal(llamadas[0].init.body.length, 1000);
  assert.equal(llamadas[0].init.headers['Content-Type'], 'application/octet-stream');
});

test('recurso desconocido o método no permitido', async () => {
  const { h } = handler();
  const r404 = response();
  await h(request('otra'), r404);
  assert.equal(r404.statusCode, 404);
  const r405 = response();
  await h(request('pagina', { method: 'POST' }), r405);
  assert.equal(r405.statusCode, 405);
  assert.equal(r405.headers.Allow, 'GET');
  const r405b = response();
  await h(request('evento'), r405b);
  assert.equal(r405b.statusCode, 405);
  assert.equal(r405b.headers.Allow, 'POST');
});

test('una caída del proveedor de sesión no deja pasar ni borra la sesión', async () => {
  const { h, llamadas } = handler({ auth: async () => { throw new Error('provider down'); } });
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers['Set-Cookie'], undefined);
  assert.equal(llamadas.length, 0);
});

test('el portal muestra el acceso a la demo sólo a las organizaciones habilitadas', async () => {
  for (const [orgId, visible] of [['org-demo', true], ['org-otra', false]]) {
    const portal = createPortalHandler({ env, authenticate: async () => ({ identity: identidad(orgId) }) });
    const res = response();
    await portal({ method: 'GET', url: '/portal', headers: {} }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(/href="\/auditoria-continua"/.test(res.body), visible);
    assert.doesNotMatch(res.body, /org-demo|org-otra/);
  }
});
