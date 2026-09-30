import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const rootUrl = new URL('../../', import.meta.url);
const read = (relative) => readFile(new URL(relative, rootUrl), 'utf8');

// Corre site/login.js y site/publica-login.js contra un DOM mínimo armado con
// los id de su HTML: solo existen los elementos que la página declara, con su
// atributo `hidden` y el texto de título e intro. Alcanza para comprobar el
// flujo de recuperación sin navegador.
function fakeElement(id, { hidden = false, textContent = '' } = {}) {
  const listeners = {};
  const element = {
    id,
    hidden,
    textContent,
    value: '',
    type: 'password',
    checked: false,
    disabled: false,
    dataset: {},
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = String(value); },
    removeAttribute(name) { delete this.attributes[name]; },
    addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
    async dispatch(type) {
      for (const handler of listeners[type] || []) await handler({ preventDefault() {} });
    },
    focus() {},
    querySelector() { return this.child; },
  };
  element.child = { textContent: '' };
  return element;
}

function buildDom(html) {
  const elements = new Map();
  for (const match of html.matchAll(/<(\w+)([^>]*)\sid="([^"]+)"([^>]*)>([^<]*)/g)) {
    const [, , before, id, after, text] = match;
    const hidden = /\shidden(\s|$|>)/.test(`${before} ${after} `);
    elements.set(id, fakeElement(id, { hidden, textContent: text.trim() }));
  }
  return elements;
}

async function loadPage({ html, script, pathname, search = '', hash = '', responses = {} }) {
  const elements = buildDom(await read(html));
  const fetchCalls = [];
  const replacedUrls = [];
  const stored = [];
  const location = {
    pathname,
    search,
    hash,
    assign() {},
    replace(url) { this.replacedTo = url; },
  };
  const window = {
    location,
    history: {
      replaceState(_state, _title, url) {
        replacedUrls.push(url);
        location.search = '';
        location.hash = '';
      },
    },
    setTimeout() {},
  };
  const fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    const { status = 200, body = {} } = responses[url] || { status: 401, body: {} };
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  const context = {
    window,
    document: {
      getElementById: (id) => elements.get(id) || null,
      documentElement: { dataset: {} },
    },
    localStorage: {
      getItem: () => null,
      setItem: (key, value) => { stored.push([key, value]); },
    },
    fetch,
    URLSearchParams,
  };
  vm.runInNewContext(await read(script), context);
  await new Promise((resolve) => setImmediate(resolve));
  return { elements, fetchCalls, replacedUrls, stored, location };
}

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSJ9.c2lnbmF0dXJh';
const recoveryHash = `#access_token=${TOKEN}&expires_in=3600&refresh_token=r1&token_type=bearer&type=recovery`;

const pages = [
  {
    name: 'portal',
    html: 'site/login.html',
    script: 'site/login.js',
    pathname: '/site/login.html',
    endpoint: '/api/auth/reset-password',
    sessionUrl: '/api/auth/session',
    emailId: 'email',
    hiddenDuringReset: ['login-form'],
  },
  {
    name: 'Pública',
    html: 'site/publica-login.html',
    script: 'site/publica-login.js',
    pathname: '/publica-login',
    endpoint: '/api/auth/publica/reset-password',
    sessionUrl: '/api/auth/publica/session',
    emailId: 'login-email',
    hiddenDuringReset: ['login-form', 'signup-form', 'auth-tabs', 'google-button', 'auth-divider'],
  },
];

for (const page of pages) {
  test(`${page.name}: el enlace del correo abre el formulario de contraseña nueva y borra el token de la URL`, async () => {
    const { elements, fetchCalls, replacedUrls } = await loadPage({
      ...page,
      search: '?recovery=1',
      hash: recoveryHash,
    });

    assert.deepEqual(replacedUrls, [page.pathname]);
    assert.equal(elements.get('reset-form').hidden, false);
    for (const id of page.hiddenDuringReset) assert.equal(elements.get(id).hidden, true, id);
    assert.equal(elements.get('login-title').textContent, 'Define tu contraseña nueva');
    // Con una sesión abierta, la verificación de sesión mandaría fuera de la
    // página antes de definir la contraseña.
    assert.equal(fetchCalls.some((call) => call.url === page.sessionUrl), false);
  });

  test(`${page.name}: guarda la contraseña nueva por POST same-origin y vuelve al login con el correo`, async () => {
    const { elements, fetchCalls, stored } = await loadPage({
      ...page,
      search: '?recovery=1',
      hash: recoveryHash,
      responses: {
        [page.endpoint]: { status: 200, body: { ok: true, email: 'cliente@example.com', message: 'Tu contraseña quedó actualizada.' } },
      },
    });

    elements.get('reset-password').value = 'nueva-clave-segura';
    elements.get('reset-confirm').value = 'nueva-clave-segura';
    await elements.get('reset-form').dispatch('submit');

    const call = fetchCalls.find((entry) => entry.url === page.endpoint);
    assert.ok(call, 'debe llamar al endpoint de restablecimiento');
    assert.equal(call.options.method, 'POST');
    assert.equal(call.options.credentials, 'same-origin');
    assert.deepEqual(JSON.parse(call.options.body), { access_token: TOKEN, password: 'nueva-clave-segura' });

    assert.equal(elements.get('reset-form').hidden, true);
    assert.equal(elements.get('login-form').hidden, false);
    assert.equal(elements.get(page.emailId).value, 'cliente@example.com');
    assert.equal(elements.get('reset-password').value, '');
    assert.equal(elements.get('login-status').dataset.state, 'success');
    assert.equal(stored.some(([, value]) => String(value).includes(TOKEN)), false);
  });

  test(`${page.name}: contraseñas distintas no llegan al servidor`, async () => {
    const { elements, fetchCalls } = await loadPage({ ...page, search: '?recovery=1', hash: recoveryHash });
    elements.get('reset-password').value = 'nueva-clave-segura';
    elements.get('reset-confirm').value = 'otra-clave-distinta';
    await elements.get('reset-form').dispatch('submit');

    assert.equal(fetchCalls.some((call) => call.url === page.endpoint), false);
    assert.equal(elements.get('reset-confirm-error').textContent, 'Las contraseñas no coinciden.');
  });

  test(`${page.name}: un enlace vencido avisa que hay que pedir uno nuevo`, async () => {
    const { elements, replacedUrls } = await loadPage({
      ...page,
      search: '?recovery=1',
      hash: '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
    });

    assert.deepEqual(replacedUrls, [page.pathname]);
    assert.equal(elements.get('reset-form').hidden, true);
    assert.equal(elements.get('login-form').hidden, false);
    assert.equal(elements.get('login-status').dataset.state, 'error');
    assert.match(elements.get('login-status').textContent, /Pide uno nuevo/);
  });

  test(`${page.name}: sin enlace de recuperación la página queda como login normal`, async () => {
    const { elements, fetchCalls, replacedUrls } = await loadPage(page);
    assert.deepEqual(replacedUrls, []);
    assert.equal(elements.get('reset-form').hidden, true);
    assert.equal(elements.get('login-form').hidden, false);
    assert.ok(fetchCalls.some((call) => call.url === page.sessionUrl));
  });
}

test('Pública ya no promete definir la contraseña «iniciando sesión»', async () => {
  const js = await read('site/publica-login.js');
  assert.doesNotMatch(js, /definir tu nueva contraseña iniciando sesión/);
});
