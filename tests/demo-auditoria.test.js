import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

import { AuthorizationError } from '../api/auth/_lib/authorization.js';
import { createDemoAuditoriaHandler } from '../api/demo-auditoria.js';
import { createPortalHandler } from '../api/portal.js';

const ORIGEN = 'https://maqueta.example.test';
const SECRETO = 'bypass-de-prueba';
const env = { DEMO_AC_ORGS: 'org-demo, org-interna', DEMO_AC_ORIGIN: ORIGEN, DEMO_AC_BYPASS: SECRETO };

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

function audio(bytes) {
  return Object.assign(Readable.from([Buffer.alloc(bytes, 1)]), {
    method: 'POST', url: '/api/voz', headers: {}, query: { recurso: 'voz' },
  });
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
      return fetchImpl ? fetchImpl(url, init) : upstream(200, '<!doctype html><title>Maqueta</title>');
    },
  });
  return { h, llamadas };
}

const sinSesion = async () => { throw new AuthorizationError('Authentication required', { status: 401 }); };

test('sin sesión, la página redirige al login y no toca la maqueta', async () => {
  const { h, llamadas } = handler({ auth: sinSesion });
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 303);
  assert.equal(res.headers.Location, '/site/login.html?reason=session');
  assert.deepEqual(res.headers['Set-Cookie'], ['clear-session']);
  assert.equal(llamadas.length, 0);
});

test('sin sesión, el agente y el dictado responden 401 y no llaman a la maqueta', async () => {
  for (const recurso of ['agente', 'voz']) {
    const { h, llamadas } = handler({ auth: sinSesion });
    const res = response();
    await h(request(recurso), res);
    assert.equal(res.statusCode, 401);
    assert.equal(llamadas.length, 0);
  }
});

test('una organización fuera de la lista recibe 403, y una lista vacía no deja entrar a nadie', async () => {
  for (const [orgId, entorno] of [['org-otra', env], ['org-demo', { ...env, DEMO_AC_ORGS: '' }]]) {
    for (const recurso of ['pagina', 'agente']) {
      const { h, llamadas } = handler({ orgId, entorno });
      const res = response();
      await h(request(recurso), res);
      assert.equal(res.statusCode, 403);
      assert.equal(llamadas.length, 0);
    }
  }
});

test('con acceso, la página se trae con el secreto y el secreto no vuelve al navegador', async () => {
  const { h, llamadas } = handler();
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<title>Maqueta<\/title>/);
  assert.match(res.headers['Content-Type'], /text\/html/);
  assert.match(res.headers['Cache-Control'], /no-store/);
  assert.deepEqual(res.headers['Set-Cookie'], ['sesion-renovada']);
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, `${ORIGEN}/`);
  assert.equal(llamadas[0].init.headers['x-vercel-protection-bypass'], SECRETO);
  assert.equal(llamadas[0].init.redirect, 'manual');
  assert.doesNotMatch(JSON.stringify(res.headers) + res.body, new RegExp(SECRETO));
});

test('si Vercel rechaza el secreto, la página no redirige al login de Vercel', async () => {
  const { h } = handler({ fetchImpl: async () => upstream(302) });
  const res = response();
  await h(request('pagina'), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers.Location, undefined);
});

test('sin origen o sin secreto configurados, la demo responde 503', async () => {
  for (const entorno of [{ ...env, DEMO_AC_ORIGIN: '' }, { ...env, DEMO_AC_BYPASS: '' }, { ...env, DEMO_AC_ORIGIN: 'http://inseguro.test' }]) {
    const { h, llamadas } = handler({ entorno });
    const res = response();
    await h(request('pagina'), res);
    assert.equal(res.statusCode, 503);
    assert.equal(llamadas.length, 0);
  }
});

test('el agente reenvía la conversación y devuelve el estado de la maqueta', async () => {
  const { h, llamadas } = handler({ fetchImpl: async () => upstream(502, '{"error":"no se pudo llegar al servicio"}') });
  const res = response();
  const body = { model: 'hermes-agent', messages: [{ role: 'user', content: 'hola' }] };
  await h(request('agente', { method: 'POST', body }), res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body, '{"error":"no se pudo llegar al servicio"}');
  assert.equal(llamadas[0].url, `${ORIGEN}/api/agente`);
  assert.equal(llamadas[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(llamadas[0].init.body), body);
});

test('una conversación sobre el tope se corta acá con 413', async () => {
  const { h, llamadas } = handler();
  const res = response();
  const body = { messages: [{ role: 'user', content: 'x'.repeat(300 * 1024) }] };
  await h(request('agente', { method: 'POST', body }), res);
  assert.equal(res.statusCode, 413);
  assert.equal(llamadas.length, 0);
});

test('el dictado reenvía el audio tal cual y corta sobre 4 MB', async () => {
  const chico = handler();
  const res = response();
  await chico.h(audio(1000), res);
  assert.equal(res.statusCode, 200);
  assert.equal(chico.llamadas[0].url, `${ORIGEN}/api/voz`);
  assert.equal(chico.llamadas[0].init.body.length, 1000);

  const grande = handler();
  const res2 = response();
  await grande.h(audio(4 * 1024 * 1024 + 1), res2);
  assert.equal(res2.statusCode, 413);
  assert.equal(grande.llamadas.length, 0);
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
