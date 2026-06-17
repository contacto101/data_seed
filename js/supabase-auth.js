/**
 * DataSeed Supabase Auth — Production v2
 *
 * Mejoras vs v1:
 * - Manejo robusto de errores con mensajes amigables
 * - Detección y recuperación de sesión expirada
 * - Onboarding post-registro (organización por defecto)
 * - Rate limiting client-side (protección brute-force)
 * - Timeout en requests para evitar colgados
 * - Logging estructurado para debugging
 * - Soporte Magic Link como alternativa
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0';

// ============================================================
// CONFIGURACIÓN
// ============================================================
let config = window.DS_SUPABASE_CONFIG;
const options = Object.assign({
  redirectAfterLogin: 'dashboard.html',
  redirectAfterLogout: 'login.html',
  requireEmailVerification: true,
  allowedEmailDomains: [],
  enabledProviders: ['password', 'google'],
  maxLoginAttempts: 5,
  lockoutDurationMs: 300_000, // 5 minutos
  sessionCheckIntervalMs: 60_000, // 1 minuto
  requestTimeoutMs: 15_000,
  enableMagicLink: false
}, window.DS_AUTH_OPTIONS || {});

// ============================================================
// RATE LIMITING CLIENT-SIDE
// ============================================================
const RateLimiter = {
  _data: JSON.parse(localStorage.getItem('ds_auth_attempts') || '{}'),

  _save() {
    localStorage.setItem('ds_auth_attempts', JSON.stringify(this._data));
  },

  isLocked(email) {
    const entry = this._data[email.toLowerCase()];
    if (!entry) return false;
    if (entry.count >= options.maxLoginAttempts) {
      const elapsed = Date.now() - entry.lastAttempt;
      if (elapsed < options.lockoutDurationMs) {
        return true;
      }
      // Reset después del lockout
      delete this._data[email.toLowerCase()];
      this._save();
    }
    return false;
  },

  recordAttempt(email) {
    const key = email.toLowerCase();
    const entry = this._data[key] || { count: 0, lastAttempt: 0 };
    entry.count++;
    entry.lastAttempt = Date.now();
    this._data[key] = entry;
    this._save();
  },

  reset(email) {
    delete this._data[email.toLowerCase()];
    this._save();
  },

  getRemainingLockoutMs(email) {
    const entry = this._data[email.toLowerCase()];
    if (!entry) return 0;
    const elapsed = Date.now() - entry.lastAttempt;
    return Math.max(0, options.lockoutDurationMs - elapsed);
  }
};

// ============================================================
// HELPERS
// ============================================================
function getRedirectTarget() {
  const fallback = options.redirectAfterLogin || 'dashboard.html';
  try {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next) return fallback;
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return url.pathname.replace(/^\//, '') + url.search + url.hash;
  } catch (_) {
    return fallback;
  }
}

function track(event, payload = {}) {
  if (window.DataseedTrack) {
    window.DataseedTrack(event, payload);
  } else {
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
  return config &&
    config.url && !String(config.url).startsWith('REPLACE_') &&
    config.anonKey && !String(config.anonKey).startsWith('REPLACE_');
}

function emailDomain(email) {
  return String(email || '').split('@')[1] || '';
}

function formatLockoutTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
}

// Timeout wrapper para requests de Supabase
function withTimeout(promise, ms = options.requestTimeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms))
  ]);
}

// ============================================================
// VALIDACIÓN DE DOMINIO
// ============================================================
async function enforceAllowedDomain(client, user) {
  if (options.requireEmailVerification && !user.email_confirmed_at) {
    await client.auth.signOut();
    track('auth_email_unverified', { email_domain: emailDomain(user.email) });
    status('Verifica tu correo antes de entrar. Revisa tu bandeja de entrada.', 'warn');
    return false;
  }

  const allowed = Array.isArray(options.allowedEmailDomains) ? options.allowedEmailDomains.filter(Boolean) : [];
  if (!allowed.length) return true;

  const domain = emailDomain(user.email);
  if (allowed.includes(domain)) return true;

  await client.auth.signOut();
  track('auth_domain_rejected', { email_domain: domain, allowed_domains: allowed.join(',') });
  status('Acceso restringido a correos autorizados: ' + allowed.join(', '), 'warn');
  return false;
}

// ============================================================
// UI HELPERS
// ============================================================
function applyUser(user, profile) {
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuario';
  document.documentElement.classList.add('auth-ready');
  document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = user.email || 'Usuario'; });
  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = displayName; });
  document.documentElement.dataset.userRole = profile?.role || 'client';
  window.dispatchEvent(new CustomEvent('dataseed:auth-ready', {
    detail: { email: user.email || '', name: displayName, role: profile?.role || 'client', profile }
  }));
}

function setLoading(form, isLoading) {
  const submit = form?.querySelector('[type="submit"]');
  if (!submit) return;
  submit.disabled = isLoading;
  submit.dataset.originalText = submit.dataset.originalText || submit.textContent;
  submit.textContent = isLoading ? 'Procesando…' : submit.dataset.originalText;
}

// ============================================================
// BOOT
// ============================================================
(async function bootDataseedAuth() {
  // Modo preview sin config
  if (!hasValidConfig()) {
    window.DataseedAuth = {
      ready: false,
      mode: 'missing-config',
      message: 'Supabase config no encontrada. Crear js/supabase-config.js con Project URL y anon key.'
    };
    track('auth_supabase_config_missing');
    status('Modo preview: falta configuración Supabase.', 'warn');
    return;
  }

  const client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: { 'x-application-name': 'dataseed-portal' }
    }
  });

  window.DataseedAuth = { ready: true, provider: 'supabase', client };
  track('auth_supabase_ready');

  // ==========================================================
  // ELEMENTOS DEL DOM
  // ==========================================================
  const form = document.getElementById('auth-form');
  const recover = document.querySelector('[data-auth-action="recover"]');
  const google = document.querySelector('[data-auth-oauth="google"]');
  const microsoft = document.querySelector('[data-auth-oauth="microsoft"]');
  const logout = document.querySelector('[data-auth-action="logout"]');
  const magicLink = document.querySelector('[data-auth-action="magic-link"]');

  // ==========================================================
  // TOGGLE DE PROVIDERS
  // ==========================================================
  const enabledProviders = Array.isArray(options.enabledProviders) ? options.enabledProviders : ['password', 'google'];
  document.querySelectorAll('[data-auth-oauth]').forEach((button) => {
    const provider = button.dataset.authOauth;
    const enabled = enabledProviders.includes(provider);
    button.hidden = !enabled;
    button.disabled = !enabled;
  });

  const emailPanelToggle = document.querySelector('[data-toggle-email-auth]');
  const emailPanel = document.getElementById('email-auth-panel');
  if (!enabledProviders.includes('password')) {
    if (emailPanelToggle) emailPanelToggle.hidden = true;
    if (emailPanel) emailPanel.hidden = true;
  }

  if (magicLink) {
    magicLink.hidden = !options.enableMagicLink;
  }

  // ==========================================================
  // FORM SUBMIT: Login / Registro
  // ==========================================================
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const name = String(fd.get('name') || '').trim();
    const mode = form.dataset.authMode || 'login';

    // Validación
    if (!email || !email.includes('@')) {
      status('Ingresa un email válido.', 'warn');
      return;
    }

    // Rate limiting
    if (RateLimiter.isLocked(email)) {
      const remaining = RateLimiter.getRemainingLockoutMs(email);
      status(`Demasiados intentos. Espera ${formatLockoutTime(remaining)} antes de reintentar.`, 'warn');
      track('auth_rate_limited', { email_domain: emailDomain(email) });
      return;
    }

    if (password.length < 8) {
      status('La contraseña debe tener al menos 8 caracteres.', 'warn');
      return;
    }

    setLoading(form, true);

    try {
      let result;

      if (mode === 'register') {
        // REGISTRO
        result = await withTimeout(client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: new URL(getRedirectTarget(), window.location.origin).href
          }
        }));

        if (result.error) throw result.error;

        track('auth_register_success', { method: 'password', email_domain: emailDomain(email) });

        if (!result.data.session) {
          // Email confirmation requerida
          status('Cuenta creada. Revisa tu correo para confirmar antes de ingresar.', 'ok');
          return;
        }

        // Auto-login después de registro (si no requiere confirmación)
        const user = result.data.user;
        if (!user || !(await enforceAllowedDomain(client, user))) return;

        RateLimiter.reset(email);
        status('Cuenta creada. Redirigiendo…', 'ok');
        window.location.href = getRedirectTarget();

      } else {
        // LOGIN
        result = await withTimeout(client.auth.signInWithPassword({ email, password }));

        if (result.error) throw result.error;

        const user = result.data.user;
        if (!user || !(await enforceAllowedDomain(client, user))) return;

        RateLimiter.reset(email);
        track('auth_login_success', { method: 'password', email_domain: emailDomain(email) });
        status('Acceso correcto. Redirigiendo…', 'ok');
        window.location.href = getRedirectTarget();
      }

    } catch (error) {
      console.warn('[Dataseed Supabase Auth]', error);
      RateLimiter.recordAttempt(email);
      track('auth_error', { code: error.message || 'unknown', auth_mode: mode });

      // Mensajes amigables
      const messages = {
        'Invalid login credentials': 'Credenciales inválidas. Revisa email y contraseña.',
        'User already registered': 'Ese email ya tiene acceso. Intenta ingresar o recuperar contraseña.',
        'Password should be at least 6 characters.': 'La contraseña es muy débil. Usa mínimo 8 caracteres.',
        'Email not confirmed': 'Confirma tu correo antes de ingresar. Revisa tu bandeja.',
        'Request timeout': 'La conexión tardó demasiado. Verifica tu internet e intenta de nuevo.',
        'Auth session missing': 'Tu sesión expiró. Ingresa de nuevo.',
        'rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
        'user_banned': 'Esta cuenta fue suspendida. Contacta soporte.'
      };

      const friendly = messages[error.message] ||
        (error.message?.includes('fetch') ? 'Error de conexión. Verifica tu internet.' :
          'No se pudo completar. Intenta de nuevo.');

      status(friendly, 'warn');

      // Si quedan pocos intentos, avisar
      const attempts = RateLimiter._data[email.toLowerCase()]?.count || 0;
      if (attempts >= options.maxLoginAttempts - 2 && attempts < options.maxLoginAttempts) {
        status(friendly + ` (${options.maxLoginAttempts - attempts} intentos restantes)`, 'warn');
      }

    } finally {
      setLoading(form, false);
    }
  });

  // ==========================================================
  // RECUPERAR CONTRASEÑA
  // ==========================================================
  recover?.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = String(document.getElementById('email')?.value || '').trim();
    if (!email || !email.includes('@')) {
      status('Escribe tu email para enviar recuperación.', 'warn');
      return;
    }

    try {
      const { error } = await withTimeout(client.auth.resetPasswordForEmail(email, {
        redirectTo: new URL('login.html', window.location.origin).href
      }));

      if (error) throw error;

      track('auth_recover_sent', { email_domain: emailDomain(email) });
      status('Enviamos instrucciones de recuperación a tu email.', 'ok');
    } catch (error) {
      track('auth_recover_error', { code: error.message || 'unknown' });
      status('No se pudo enviar recuperación. Verifica el email.', 'warn');
    }
  });

  // ==========================================================
  // MAGIC LINK (passwordless)
  // ==========================================================
  magicLink?.addEventListener('click', async () => {
    const email = String(document.getElementById('email')?.value || '').trim();
    if (!email || !email.includes('@')) {
      status('Escribe tu email para recibir un enlace mágico.', 'warn');
      return;
    }

    try {
      const { error } = await withTimeout(client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: new URL(getRedirectTarget(), window.location.origin).href }
      }));

      if (error) throw error;

      track('auth_magic_link_sent', { email_domain: emailDomain(email) });
      status('Enlace mágico enviado. Revisa tu correo.', 'ok');
    } catch (error) {
      track('auth_magic_link_error', { code: error.message || 'unknown' });
      status('No se pudo enviar el enlace. Intenta de nuevo.', 'warn');
    }
  });

  // ==========================================================
  // GOOGLE OAUTH
  // ==========================================================
  google?.addEventListener('click', async () => {
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: new URL(getRedirectTarget(), window.location.origin).href,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
    } catch (error) {
      track('auth_error', { code: error.message || 'unknown', method: 'google' });
      status('No se pudo iniciar sesión con Google.', 'warn');
    }
  });

  // ==========================================================
  // MICROSOFT (placeholder)
  // ==========================================================
  microsoft?.addEventListener('click', () => {
    status('Microsoft no configurado aún. Contacta al administrador.', 'warn');
  });

  // ==========================================================
  // LOGOUT
  // ==========================================================
  logout?.addEventListener('click', async () => {
    try {
      await client.auth.signOut();
      track('auth_logout');
      window.location.href = options.redirectAfterLogout;
    } catch (error) {
      console.warn('[Dataseed Logout]', error);
      // Forzar limpieza local
      window.location.href = options.redirectAfterLogout;
    }
  });

  // ==========================================================
  // PROTECCIÓN DE RUTAS (dashboard y páginas privadas)
  // ==========================================================
  if (document.body.dataset.requireAuth === 'true') {
    try {
      const { data, error } = await client.auth.getSession();

      if (error) throw error;

      const user = data.session?.user;

      if (!user) {
        track('auth_guard_redirect', { from: location.pathname });
        window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname);
        return;
      }

      if (!(await enforceAllowedDomain(client, user))) return;

      // Cargar perfil
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('[Dataseed Profile]', profileError);
        track('auth_profile_error', { code: profileError.message || 'unknown' });
        status('Sesión válida, pero no se pudo cargar el perfil.', 'warn');
      }

      // Verificar que el usuario esté activo
      if (profile && !profile.is_active) {
        await client.auth.signOut();
        status('Tu cuenta está suspendida. Contacta soporte.', 'warn');
        track('auth_user_inactive', { email_domain: emailDomain(user.email) });
        return;
      }

      applyUser(user, profile);
      track('auth_guard_ok', { email_domain: emailDomain(user.email), role: profile?.role });

      // Listener de cambios de auth (token refresh, sign out en otra pestaña)
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          track('auth_token_refreshed');
        }
        if (event === 'SIGNED_OUT' || !session) {
          track('auth_session_lost');
          window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname);
        }
      });

    } catch (error) {
      console.warn('[Dataseed Auth Guard]', error);
      track('auth_guard_error', { code: error.message || 'unknown' });
      window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname);
    }
  }
})();
