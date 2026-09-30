(() => {
  'use strict';

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberInput = document.getElementById('remember');
  const submitButton = document.getElementById('submit-button');
  const buttonLabel = submitButton?.querySelector('.button-label');
  const statusBox = document.getElementById('login-status');
  const passwordToggle = document.getElementById('password-toggle');
  const forgotButton = document.getElementById('forgot-password');
  const themeToggle = document.getElementById('theme-toggle');
  const loginTitle = document.getElementById('login-title');
  const loginIntro = document.getElementById('login-intro');
  const resetForm = document.getElementById('reset-form');
  const resetPasswordInput = document.getElementById('reset-password');
  const resetConfirmInput = document.getElementById('reset-confirm');
  const resetSubmit = document.getElementById('reset-submit');
  const resetButtonLabel = resetSubmit?.querySelector('.button-label');
  const LOGIN_TITLE = loginTitle?.textContent || 'Portal de clientes';
  const LOGIN_INTRO = loginIntro?.textContent || '';
  const MIN_PASSWORD_LENGTH = 8;
  const INVALID_LINK = 'El enlace de recuperación no es válido o ya se usó. Pide uno nuevo con «¿Olvidaste tu contraseña?».';

  // El enlace del correo vuelve a esta página con la sesión de recuperación en el
  // fragmento (#access_token=…&type=recovery), o con #error=… si el enlace ya
  // no sirve. El token vive solo en esta variable: se borra de la barra de
  // direcciones al leerlo y no se guarda en el navegador.
  let recoveryToken = null;

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
      // Theme persistence is optional.
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

  function validateEmail() {
    const email = String(emailInput?.value || '').trim();
    if (!email) {
      setFieldError('email', 'Ingresa tu correo electrónico.');
      return null;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('email', 'Ingresa un correo electrónico válido.');
      return null;
    }
    setFieldError('email');
    return email.toLowerCase();
  }

  function validateForm() {
    const email = validateEmail();
    const password = String(passwordInput?.value || '');
    if (!password) setFieldError('password', 'Ingresa tu contraseña.');
    else setFieldError('password');

    if (!email) emailInput?.focus();
    else if (!password) passwordInput?.focus();
    return email && password ? { email, password } : null;
  }

  function setLoading(isLoading, label = 'Iniciando sesión…') {
    if (!submitButton || !buttonLabel) return;
    submitButton.disabled = isLoading;
    submitButton.dataset.loading = String(isLoading);
    buttonLabel.textContent = isLoading ? label : 'Iniciar sesión';
    form?.setAttribute('aria-busy', String(isLoading));
  }

  async function parseResponse(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  function publicLoginError(response, payload) {
    if (response.status === 400) return payload.error || 'Completa todos los campos requeridos.';
    if (response.status === 401) return 'No pudimos iniciar sesión. Revisa tus credenciales.';
    if (response.status === 403 || response.status === 409) return 'Tu cuenta no tiene un entorno habilitado. Contacta a soporte.';
    return 'Ocurrió un error del servidor. Intenta nuevamente.';
  }

  async function submitLogin(event) {
    event.preventDefault();
    setStatus();
    const credentials = validateForm();
    if (!credentials) {
      setStatus('Revisa los campos indicados para continuar.', 'error');
      return;
    }

    setLoading(true);
    setStatus('Iniciando sesión…', 'loading');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          remember: Boolean(rememberInput?.checked),
        }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setStatus(publicLoginError(response, payload), 'error');
        return;
      }

      setStatus('Acceso correcto. Abriendo tu entorno…', 'success');
      setLoading(true, 'Acceso correcto');
      const destination = payload.redirectTo === '/portal' ? '/portal' : '/portal';
      window.setTimeout(() => window.location.assign(destination), 350);
    } catch {
      setStatus('No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      if (statusBox?.dataset.state !== 'success') setLoading(false);
    }
  }

  async function requestRecovery() {
    setStatus();
    const email = validateEmail();
    if (!email) {
      emailInput?.focus();
      setStatus('Escribe tu correo para recuperar el acceso.', 'error');
      return;
    }

    forgotButton.disabled = true;
    setStatus('Enviando instrucciones de recuperación…', 'loading');
    try {
      const response = await fetch('/api/auth/forgot-password', {
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

  function showResetForm() {
    if (form) form.hidden = true;
    if (resetForm) resetForm.hidden = false;
    if (loginTitle) loginTitle.textContent = 'Define tu contraseña nueva';
    if (loginIntro) loginIntro.textContent = 'Elige la contraseña con la que vas a entrar al portal.';
    resetPasswordInput?.focus();
  }

  function showLoginForm(email) {
    if (resetForm) resetForm.hidden = true;
    if (form) form.hidden = false;
    if (loginTitle) loginTitle.textContent = LOGIN_TITLE;
    if (loginIntro) loginIntro.textContent = LOGIN_INTRO;
    if (email && emailInput) emailInput.value = email;
    (email ? passwordInput : emailInput)?.focus();
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
    resetForm?.setAttribute('aria-busy', String(isLoading));
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
      const response = await fetch('/api/auth/reset-password', {
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

  function togglePassword() {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(show));
    passwordToggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    passwordInput.focus();
  }

  async function redirectExistingSession() {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return;
      const payload = await parseResponse(response);
      if (payload.authenticated === true) window.location.replace('/portal');
    } catch {
      // The login form remains available when the session check is unavailable.
    }
  }

  emailInput?.addEventListener('blur', validateEmail);
  emailInput?.addEventListener('input', () => setFieldError('email'));
  passwordInput?.addEventListener('input', () => setFieldError('password'));
  form?.addEventListener('submit', submitLogin);
  forgotButton?.addEventListener('click', requestRecovery);
  passwordToggle?.addEventListener('click', togglePassword);
  themeToggle?.addEventListener('click', toggleTheme);
  resetForm?.addEventListener('submit', submitReset);
  resetPasswordInput?.addEventListener('input', () => setFieldError('reset-password'));
  resetConfirmInput?.addEventListener('input', () => setFieldError('reset-confirm'));

  applySavedTheme();
  const recoveryLink = readRecoveryLink();
  if (recoveryLink?.token) {
    // Sin redirectExistingSession: con una sesión abierta en este navegador,
    // mandaría a /portal antes de que el usuario defina la contraseña.
    recoveryToken = recoveryLink.token;
    showResetForm();
  } else {
    if (recoveryLink?.invalid) setStatus(INVALID_LINK, 'error');
    redirectExistingSession();
  }
})();
