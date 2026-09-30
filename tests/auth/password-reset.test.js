import test from 'node:test';
import assert from 'node:assert/strict';

import { SupabaseRequestError } from '../../api/auth/_lib/supabase.js';
import { createResetPasswordHandler } from '../../api/auth/reset-password.js';
import { createPublicaResetPasswordHandler } from '../../api/auth/_lib/publica-handlers/reset-password.js';

// Forma de JWT, no uno real: el handler solo filtra basura; la firma la
// verifica Supabase en PUT /auth/v1/user.
const RECOVERY_TOKEN = ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiJ1MSJ9', 'c2lnbmF0dXJh'].join('.');

function request(body = {}, overrides = {}) {
  return {
    method: 'POST',
    body,
    headers: {
      origin: 'https://dataseed.cl',
      host: 'dataseed.cl',
      'x-forwarded-host': 'dataseed.cl',
      ...overrides.headers,
    },
    ...overrides,
  };
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

const env = { APP_ORIGIN: 'https://dataseed.cl' };
const quiet = () => {};

function handlerWith(overrides = {}) {
  const calls = { update: [], revoke: [] };
  const handler = createResetPasswordHandler({
    env,
    onFailure: quiet,
    update: async (...args) => { calls.update.push(args); return { id: 'u1', email: 'cliente@example.com' }; },
    revoke: async (...args) => { calls.revoke.push(args); },
    ...overrides,
  });
  return { handler, calls };
}

test('reset-password: cambia la contraseña con el token de recuperación, cierra esa sesión y no abre otra', async () => {
  const { handler, calls } = handlerWith();
  const res = response();
  await handler(request({ access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(calls.update.length, 1);
  assert.equal(calls.update[0][0], RECOVERY_TOKEN);
  assert.equal(calls.update[0][1], 'clave-nueva-1');
  assert.equal(calls.revoke[0][0], RECOVERY_TOKEN);
  assert.deepEqual(res.body, {
    ok: true,
    email: 'cliente@example.com',
    message: 'Tu contraseña quedó actualizada. Ya puedes iniciar sesión con ella.',
  });

  const cookies = res.headers['Set-Cookie'];
  assert.ok(Array.isArray(cookies) && cookies.length > 0);
  for (const cookie of cookies) {
    assert.match(cookie, /^__Host-ds_/);
    assert.match(cookie, /Max-Age=0/);
  }
  assert.doesNotMatch(JSON.stringify(res.body), new RegExp(RECOVERY_TOKEN));
  assert.equal(res.headers['Cache-Control'], 'no-store, max-age=0');
});

test('reset-password: exige POST y mismo origen antes de tocar Supabase', async () => {
  const { handler, calls } = handlerWith();

  const getRes = response();
  await handler(request({}, { method: 'GET' }), getRes);
  assert.equal(getRes.statusCode, 405);
  assert.equal(getRes.headers.Allow, 'POST');

  const crossRes = response();
  await handler(request(
    { access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' },
    { headers: { origin: 'https://evil.example' } },
  ), crossRes);
  assert.equal(crossRes.statusCode, 403);
  assert.equal(calls.update.length, 0);
});

test('reset-password: sin token con forma de JWT responde 401 sin llamar a Supabase', async () => {
  const { handler, calls } = handlerWith();
  for (const accessToken of [undefined, '', 'no-es-un-jwt', 42, `${'a'.repeat(9000)}.b.c`]) {
    const res = response();
    await handler(request({ access_token: accessToken, password: 'clave-nueva-1' }), res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.error, /expiró o ya se usó/);
  }
  assert.equal(calls.update.length, 0);
});

test('reset-password: contraseña de menos de 8 caracteres responde 400 sin llamar a Supabase', async () => {
  const { handler, calls } = handlerWith();
  const res = response();
  await handler(request({ access_token: RECOVERY_TOKEN, password: 'corta' }), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /al menos 8 caracteres/);
  assert.equal(calls.update.length, 0);
});

test('reset-password: token vencido o usado responde 401, no revoca ni borra cookies', async () => {
  for (const status of [401, 403]) {
    const { handler, calls } = handlerWith({
      update: async () => { throw new SupabaseRequestError('invalid JWT', { status, code: 'bad_jwt' }); },
    });
    const res = response();
    await handler(request({ access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' }), res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.error, /expiró o ya se usó/);
    assert.doesNotMatch(res.body.error, /JWT/);
    assert.equal(calls.revoke.length, 0);
    assert.equal(res.headers['Set-Cookie'], undefined);
  }
});

test('reset-password: traduce los rechazos de Supabase sin exponer su texto', async () => {
  const cases = [
    [new SupabaseRequestError('New password should be different', { status: 422, code: 'same_password' }), 400, /distinta de la anterior/],
    [new SupabaseRequestError('Password is known to be weak', { status: 422, code: 'weak_password' }), 400, /demasiado débil/],
    [new SupabaseRequestError('Rate limit', { status: 429, code: 'over_request_rate_limit' }), 429, /Demasiados intentos/],
    [new SupabaseRequestError('Supabase is unavailable', { status: 502, code: 'network_error' }), 503, /Intenta nuevamente/],
    [new Error('boom'), 503, /Intenta nuevamente/],
  ];
  for (const [error, status, message] of cases) {
    const failures = [];
    const { handler } = handlerWith({
      update: async () => { throw error; },
      onFailure: (stage, failure) => { failures.push([stage, failure]); },
    });
    const res = response();
    await handler(request({ access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' }), res);
    assert.equal(res.statusCode, status);
    assert.match(res.body.error, message);
    assert.doesNotMatch(res.body.error, /should|known|Rate limit|unavailable|boom/);
    assert.deepEqual(failures, [['password_reset', error]]);
  }
});

test('reset-password: si revocar la sesión falla, la contraseña ya cambió y responde 200', async () => {
  const failures = [];
  const { handler } = handlerWith({
    revoke: async () => { throw new SupabaseRequestError('Supabase is unavailable', { status: 502 }); },
    onFailure: (stage) => { failures.push(stage); },
  });
  const res = response();
  await handler(request({ access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(failures, ['password_reset_revoke']);
});

test('publica reset-password: borra las cookies de Pública, nunca las del portal', async () => {
  const handler = createPublicaResetPasswordHandler({
    env,
    onFailure: quiet,
    update: async () => ({ id: 'u1', email: 'cliente@example.com' }),
    revoke: async () => {},
  });
  const res = response();
  await handler(request({ access_token: RECOVERY_TOKEN, password: 'clave-nueva-1' }), res);

  assert.equal(res.statusCode, 200);
  const cookies = res.headers['Set-Cookie'];
  assert.ok(cookies.length > 0);
  for (const cookie of cookies) {
    assert.match(cookie, /^__Host-pub_/);
    assert.match(cookie, /Max-Age=0/);
  }
});
