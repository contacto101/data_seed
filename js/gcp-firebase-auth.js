import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const config = window.DS_FIREBASE_CONFIG;
const options = Object.assign({
  redirectAfterLogin: 'dashboard.html',
  redirectAfterLogout: 'login.html',
  requireEmailVerification: false
}, window.DS_AUTH_OPTIONS || {});

function track(event, payload = {}) {
  if (window.DataseedTrack) window.DataseedTrack(event, payload);
  else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event }, payload));
  }
}

function status(message, type = 'warn') {
  const box = document.getElementById('auth-status') || document.getElementById('dashboard-status');
  if (!box) return;
  box.textContent = message;
  box.className = 'status ' + type;
}

function hasValidConfig() {
  return config && config.apiKey && !String(config.apiKey).startsWith('REPLACE_') && config.projectId && !String(config.projectId).startsWith('REPLACE_');
}

if (!hasValidConfig()) {
  window.DataseedAuth = {
    ready: false,
    mode: 'missing-config',
    message: 'Firebase config no encontrada. Crear js/firebase-config.js a partir de js/firebase-config.example.js.'
  };
  track('auth_gcp_config_missing');
  status('Modo preview: falta js/firebase-config.js con la configuración Firebase/GCP.', 'warn');
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  window.DataseedAuth = { ready: true, app, auth };
  track('auth_gcp_ready', { project_id: config.projectId });

  const form = document.getElementById('auth-form');
  const recover = document.querySelector('[data-auth-action="recover"]');
  const google = document.querySelector('[data-auth-oauth="google"]');
  const microsoft = document.querySelector('[data-auth-oauth="microsoft"]');
  const logout = document.querySelector('[data-auth-action="logout"]');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const name = String(fd.get('name') || '').trim();
    const remember = Boolean(fd.get('remember'));
    const mode = form.dataset.authMode || 'login';

    if (!email || !email.includes('@')) return status('Ingresa un email válido.', 'warn');
    if (password.length < 8) return status('La contraseña debe tener al menos 8 caracteres.', 'warn');

    const submit = form.querySelector('[type="submit"]');
    const previous = submit?.textContent;
    if (submit) { submit.disabled = true; submit.textContent = mode === 'register' ? 'Creando acceso…' : 'Ingresando…'; }

    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      let result;
      if (mode === 'register') {
        result = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(result.user, { displayName: name });
        track('auth_register_success', { method: 'password', email_domain: email.split('@')[1] || '' });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        track('auth_login_success', { method: 'password', email_domain: email.split('@')[1] || '' });
      }
      status('Acceso correcto. Redirigiendo…', 'ok');
      window.location.href = options.redirectAfterLogin;
    } catch (error) {
      console.warn('[Dataseed Auth]', error);
      track('auth_error', { code: error.code || 'unknown', auth_mode: mode });
      const friendly = {
        'auth/invalid-credential': 'Credenciales inválidas. Revisa email y contraseña.',
        'auth/email-already-in-use': 'Ese email ya tiene acceso. Prueba ingresar o recuperar contraseña.',
        'auth/weak-password': 'La contraseña es muy débil. Usa mínimo 8 caracteres.',
        'auth/popup-closed-by-user': 'El popup se cerró antes de completar el acceso.',
        'auth/unauthorized-domain': 'Dominio no autorizado en Firebase Auth. Agregar dataseed.cl en Authorized domains.'
      }[error.code] || 'No se pudo completar el acceso. Revisa configuración o intenta nuevamente.';
      status(friendly, 'warn');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = previous; }
    }
  });

  recover?.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = String(document.getElementById('email')?.value || '').trim();
    if (!email || !email.includes('@')) return status('Escribe tu email para enviar recuperación.', 'warn');
    try {
      await sendPasswordResetEmail(auth, email);
      track('auth_recover_sent', { email_domain: email.split('@')[1] || '' });
      status('Enviamos instrucciones de recuperación a tu email.', 'ok');
    } catch (error) {
      track('auth_recover_error', { code: error.code || 'unknown' });
      status('No se pudo enviar recuperación. Revisa el email o configuración Firebase.', 'warn');
    }
  });

  google?.addEventListener('click', () => signInProvider(new GoogleAuthProvider(), 'google'));
  microsoft?.addEventListener('click', () => signInProvider(new OAuthProvider('microsoft.com'), 'microsoft'));

  async function signInProvider(provider, providerName) {
    try {
      const result = await signInWithPopup(auth, provider);
      track('auth_login_success', { method: providerName, email_domain: result.user.email?.split('@')[1] || '' });
      status('Acceso correcto. Redirigiendo…', 'ok');
      window.location.href = options.redirectAfterLogin;
    } catch (error) {
      console.warn('[Dataseed OAuth]', error);
      track('auth_error', { code: error.code || 'unknown', method: providerName });
      status('No se pudo iniciar sesión con ' + providerName + '.', 'warn');
    }
  }

  logout?.addEventListener('click', async () => {
    await signOut(auth);
    track('auth_logout');
    window.location.href = options.redirectAfterLogout;
  });

  if (document.body.dataset.requireAuth === 'true') {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        track('auth_guard_redirect', { from: location.pathname });
        window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname);
        return;
      }
      document.documentElement.classList.add('auth-ready');
      document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email || 'Usuario');
      document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.displayName || user.email || 'Usuario');
      track('auth_guard_ok', { email_domain: user.email?.split('@')[1] || '' });
    });
  }
}
