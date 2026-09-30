(() => {
  'use strict';

  // Lógica propia de /publica-login. Habla con /api/auth/publica/* — nunca
  // con /api/auth/login ni /api/auth/session (esos son del portal general,
  // ver site/login.js, que esta página ya no usa).

  const statusBox = document.getElementById('login-status');
  const themeToggle = document.getElementById('theme-toggle');

  function applySavedTheme() {
    let theme = 'dark';
    try {
      theme = localStorage.getItem('dataseed-theme') || 'dark';
    } catch {
      theme = 'dark';
    }
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    syncThemeButton();
  }

  function syncThemeButton() {
    if (!themeToggle) return;
    const isLight = document.documentElement.dataset.theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('dataseed-theme', next);
    } catch {
      // La persistencia del tema es opcional.
    }
    syncThemeButton();
  }

  function setStatus(message = '', state = '') {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.hidden = !message;
    if (state) statusBox.dataset.state = state;
    else statusBox.removeAttribute('data-state');
  }

  function setFieldError(name, message = '') {
    const field = document.getElementById(`${name}-field`);
    const error = document.getElementById(`${name}-error`);
    const input = document.getElementById(name);
    if (field) field.dataset.invalid = String(Boolean(message));
    if (error) error.textContent = message;
    if (input) input.setAttribute('aria-invalid', String(Boolean(message)));
  }

  async function parseResponse(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  // --- Tabs ---
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  function selectTab(tab) {
    const isLogin = tab === 'login';
    tabLogin?.setAttribute('aria-selected', String(isLogin));
    tabSignup?.setAttribute('aria-selected', String(!isLogin));
    if (loginForm) loginForm.hidden = !isLogin;
    if (signupForm) signupForm.hidden = isLogin;
    setStatus();
  }

  tabLogin?.addEventListener('click', () => selectTab('login'));
  tabSignup?.addEventListener('click', () => selectTab('signup'));

  // --- Password toggles (uno por formulario) ---
  function wirePasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      input.focus();
    });
  }
  wirePasswordToggle('login-password-toggle', 'login-password');
  wirePasswordToggle('signup-password-toggle', 'signup-password');

  // --- Login ---
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginRemember = document.getElementById('login-remember');
  const loginSubmit = document.getElementById('login-submit');
  const loginButtonLabel = loginSubmit?.querySelector('.button-label');
  const forgotButton = document.getElementById('forgot-password');

  function validateEmailField(inputId, errorPrefix) {
    const input = document.getElementById(inputId);
    const email = String(input?.value || '').trim();
    if (!email) {
      setFieldError(errorPrefix, 'Ingresa tu correo electrónico.');
      return null;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(errorPrefix, 'Ingresa un correo electrónico válido.');
      return null;
    }
    setFieldError(errorPrefix);
    return email.toLowerCase();
  }

  function setLoginLoading(isLoading, label = 'Iniciando sesión…') {
    if (!loginSubmit || !loginButtonLabel) return;
    loginSubmit.disabled = isLoading;
    loginSubmit.dataset.loading = String(isLoading);
    loginButtonLabel.textContent = isLoading ? label : 'Iniciar sesión';
  }

  function loginErrorMessage(response, payload) {
    if (response.status === 400) return payload.error || 'Completa todos los campos requeridos.';
    if (response.status === 401) return 'No pudimos iniciar sesión. Revisa tus credenciales.';
    if (response.status === 403 || response.status === 409) return 'Tu cuenta no tiene un entorno habilitado en Pública. Contacta a soporte.';
    return 'Ocurrió un error del servidor. Intenta nuevamente.';
  }

  async function submitLogin(event) {
    event.preventDefault();
    setStatus();
    const email = validateEmailField('login-email', 'login-email');
    const password = String(loginPassword?.value || '');
    if (!password) setFieldError('login-password', 'Ingresa tu contraseña.');
    else setFieldError('login-password');

    if (!email || !password) {
      setStatus('Revisa los campos indicados para continuar.', 'error');
      if (!email) loginEmail?.focus();
      else loginPassword?.focus();
      return;
    }

    setLoginLoading(true);
    setStatus('Iniciando sesión…', 'loading');
    try {
      const response = await fetch('/api/auth/publica/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, remember: Boolean(loginRemember?.checked) }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setStatus(loginErrorMessage(response, payload), 'error');
        return;
      }
      setStatus('Acceso correcto. Abriendo Pública…', 'success');
      setLoginLoading(true, 'Acceso correcto');
      window.setTimeout(() => window.location.assign(payload.redirectTo || '/publica-buscador'), 350);
    } catch {
      setStatus('No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      if (statusBox?.dataset.state !== 'success') setLoginLoading(false);
    }
  }

  async function requestRecovery() {
    setStatus();
    const email = validateEmailField('login-email', 'login-email');
    if (!email) {
      loginEmail?.focus();
      setStatus('Escribe tu correo para recuperar el acceso.', 'error');
      return;
    }

    forgotButton.disabled = true;
    setStatus('Enviando instrucciones de recuperación…', 'loading');
    try {
      const response = await fetch('/api/auth/publica/forgot-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setStatus(payload.error || 'No pudimos procesar la solicitud. Intenta nuevamente.', 'error');
        return;
      }
      setStatus(payload.message || 'Si la cuenta existe, recibirás instrucciones por correo.', 'success');
    } catch {
      setStatus('No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      forgotButton.disabled = false;
    }
  }

  // --- Signup ---
  const signupEmpresa = document.getElementById('signup-empresa');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const signupSubmit = document.getElementById('signup-submit');
  const signupButtonLabel = signupSubmit?.querySelector('.button-label');

  function setSignupLoading(isLoading, label = 'Creando cuenta…') {
    if (!signupSubmit || !signupButtonLabel) return;
    signupSubmit.disabled = isLoading;
    signupSubmit.dataset.loading = String(isLoading);
    signupButtonLabel.textContent = isLoading ? label : 'Crear cuenta';
  }

  async function submitSignup(event) {
    event.preventDefault();
    setStatus();
    const empresa = String(signupEmpresa?.value || '').trim();
    const email = validateEmailField('signup-email', 'signup-email');
    const password = String(signupPassword?.value || '');

    if (!empresa) setFieldError('signup-empresa', 'Indica el nombre de tu empresa.');
    else setFieldError('signup-empresa');

    if (password.length < 8) setFieldError('signup-password', 'Usa al menos 8 caracteres.');
    else setFieldError('signup-password');

    if (!empresa || !email || password.length < 8) {
      setStatus('Revisa los campos indicados para continuar.', 'error');
      return;
    }

    setSignupLoading(true);
    setStatus('Creando tu cuenta…', 'loading');
    try {
      const response = await fetch('/api/auth/publica/signup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ empresa, email, password }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setStatus(payload.error || 'No pudimos crear tu cuenta. Intenta nuevamente.', 'error');
        if (payload.accountExists) {
          selectTab('login');
          setStatus(payload.error, 'error');
          if (loginEmail) loginEmail.value = email;
          loginPassword?.focus();
        }
        return;
      }
      if (payload.pendingConfirmation) {
        setStatus(payload.message || 'Revisa tu correo para confirmar tu cuenta.', 'success');
        setSignupLoading(false);
        return;
      }
      setStatus('Cuenta creada. Abriendo Pública…', 'success');
      setSignupLoading(true, 'Listo');
      window.setTimeout(() => window.location.assign(payload.redirectTo || '/publica-buscador'), 350);
    } catch {
      setStatus('No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      if (statusBox?.dataset.state !== 'success') setSignupLoading(false);
    }
  }

  // --- Contraseña nueva, al volver del enlace de recuperación ---
  // El enlace del correo vuelve a esta página con la sesión de recuperación en el
  // fragmento (#access_token=…&type=recovery), o con #error=… si el enlace ya
  // no sirve. El token vive solo en esta variable: se borra de la barra de
  // direcciones al leerlo y no se guarda en el navegador.
  const loginTitle = document.getElementById('login-title');
  const loginIntro = document.getElementById('login-intro');
  const authTabs = document.getElementById('auth-tabs');
  const googleButton = document.getElementById('google-button');
  const authDivider = document.getElementById('auth-divider');
  const resetForm = document.getElementById('reset-form');
  const resetPasswordInput = document.getElementById('reset-password');
  const resetConfirmInput = document.getElementById('reset-confirm');
  const resetSubmit = document.getElementById('reset-submit');
  const resetButtonLabel = resetSubmit?.querySelector('.button-label');
  const LOGIN_TITLE = loginTitle?.textContent || 'Portal de Pública';
  const LOGIN_INTRO = loginIntro?.textContent || '';
  const MIN_PASSWORD_LENGTH = 8;
  const INVALID_LINK = 'El enlace de recuperación no es válido o ya se usó. Pide uno nuevo con «¿Olvidaste tu contraseña?».';
  let recoveryToken = null;

  function readRecoveryLink() {
    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const fromRecoveryEmail = query.get('recovery') === '1';
    const token = fragment.get('type') === 'recovery' ? fragment.get('access_token') : null;
    const failed = fromRecoveryEmail && Boolean(fragment.get('error_code') || fragment.get('error'));
    if (!fromRecoveryEmail && !token) return null;
    window.history.replaceState(null, '', window.location.pathname);
    return token && !failed ? { token } : { invalid: true };
  }

  function setAccessOptionsHidden(hidden) {
    for (const element of [authTabs, googleButton, authDivider, loginForm, signupForm]) {
      if (element) element.hidden = hidden;
    }
  }

  function showResetForm() {
    setAccessOptionsHidden(true);
    if (resetForm) resetForm.hidden = false;
    if (loginTitle) loginTitle.textContent = 'Define tu contraseña nueva';
    if (loginIntro) loginIntro.textContent = 'Elige la contraseña con la que vas a entrar a Pública.';
    resetPasswordInput?.focus();
  }

  function showLoginForm(email) {
    if (resetForm) resetForm.hidden = true;
    setAccessOptionsHidden(false);
    selectTab('login');
    if (loginTitle) loginTitle.textContent = LOGIN_TITLE;
    if (loginIntro) loginIntro.textContent = LOGIN_INTRO;
    if (email && loginEmail) loginEmail.value = email;
    (email ? loginPassword : loginEmail)?.focus();
  }

  function validateReset() {
    const password = String(resetPasswordInput?.value || '');
    const confirm = String(resetConfirmInput?.value || '');
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldError('reset-password', `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    } else {
      setFieldError('reset-password');
    }
    if (confirm !== password) setFieldError('reset-confirm', 'Las contraseñas no coinciden.');
    else setFieldError('reset-confirm');

    if (password.length < MIN_PASSWORD_LENGTH) resetPasswordInput?.focus();
    else if (confirm !== password) resetConfirmInput?.focus();
    return password.length >= MIN_PASSWORD_LENGTH && confirm === password ? password : null;
  }

  function setResetLoading(isLoading) {
    if (!resetSubmit || !resetButtonLabel) return;
    resetSubmit.disabled = isLoading;
    resetSubmit.dataset.loading = String(isLoading);
    resetButtonLabel.textContent = isLoading ? 'Guardando…' : 'Guardar contraseña';
  }

  async function submitReset(event) {
    event.preventDefault();
    setStatus();
    const password = validateReset();
    if (!password) {
      setStatus('Revisa los campos indicados para continuar.', 'error');
      return;
    }
    if (!recoveryToken) {
      showLoginForm();
      setStatus(INVALID_LINK, 'error');
      return;
    }

    setResetLoading(true);
    setStatus('Guardando tu contraseña nueva…', 'loading');
    try {
      const response = await fetch('/api/auth/publica/reset-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_token: recoveryToken, password }),
      });
      const payload = await parseResponse(response);
      if (response.ok || response.status === 401) {
        recoveryToken = null;
        if (resetPasswordInput) resetPasswordInput.value = '';
        if (resetConfirmInput) resetConfirmInput.value = '';
        showLoginForm(response.ok ? payload.email : null);
      }
      if (!response.ok) {
        setStatus(payload.error || 'No pudimos cambiar tu contraseña. Intenta nuevamente.', 'error');
        return;
      }
      setStatus(payload.message || 'Tu contraseña quedó actualizada. Ya puedes iniciar sesión con ella.', 'success');
    } catch {
      setStatus('No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      setResetLoading(false);
    }
  }

  // --- Estado inicial: errores del callback de Google, correo confirmado ---
  function readQueryError() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (params.get('confirmado') === '1') {
      setStatus('Tu correo quedó confirmado. Ya puedes iniciar sesión.', 'success');
      return;
    }
    if (!error) return;
    const messages = {
      google: 'No pudimos completar el acceso con Google. Intenta nuevamente.',
      expirado: 'El enlace de Google expiró. Intenta nuevamente.',
      sin_entorno: 'Tu cuenta de Google no tiene un entorno habilitado en Pública.',
      organizacion: 'Creamos tu acceso, pero no pudimos preparar tu organización. Contacta a soporte.',
      servidor: 'Ocurrió un error del servidor. Intenta nuevamente.',
    };
    setStatus(messages[error] || 'Ocurrió un error. Intenta nuevamente.', 'error');
  }

  async function redirectExistingSession() {
    try {
      const response = await fetch('/api/auth/publica/session', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return;
      const payload = await parseResponse(response);
      if (payload.authenticated === true) window.location.replace('/publica-buscador');
    } catch {
      // El formulario sigue disponible si no se puede validar la sesión.
    }
  }

  loginEmail?.addEventListener('blur', () => validateEmailField('login-email', 'login-email'));
  loginEmail?.addEventListener('input', () => setFieldError('login-email'));
  loginPassword?.addEventListener('input', () => setFieldError('login-password'));
  loginForm?.addEventListener('submit', submitLogin);
  forgotButton?.addEventListener('click', requestRecovery);

  signupEmail?.addEventListener('blur', () => validateEmailField('signup-email', 'signup-email'));
  signupEmail?.addEventListener('input', () => setFieldError('signup-email'));
  signupPassword?.addEventListener('input', () => setFieldError('signup-password'));
  signupEmpresa?.addEventListener('input', () => setFieldError('signup-empresa'));
  signupForm?.addEventListener('submit', submitSignup);

  themeToggle?.addEventListener('click', toggleTheme);
  resetForm?.addEventListener('submit', submitReset);
  resetPasswordInput?.addEventListener('input', () => setFieldError('reset-password'));
  resetConfirmInput?.addEventListener('input', () => setFieldError('reset-confirm'));

  applySavedTheme();
  selectTab('login');
  const recoveryLink = readRecoveryLink();
  if (recoveryLink?.token) {
    // Sin redirectExistingSession: con una sesión abierta en este navegador,
    // mandaría al buscador antes de que el usuario defina la contraseña.
    recoveryToken = recoveryLink.token;
    showResetForm();
  } else {
    if (recoveryLink?.invalid) setStatus(INVALID_LINK, 'error');
    else readQueryError();
    redirectExistingSession();
  }
})();
