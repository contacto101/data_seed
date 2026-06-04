import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0';

let config = window.DS_SUPABASE_CONFIG;
const options = Object.assign({
  redirectAfterLogin: 'dashboard.html',
  redirectAfterLogout: 'login.html',
  requireEmailVerification: false,
  allowedEmailDomains: [],
  enabledProviders: ['password', 'google']
}, window.DS_AUTH_OPTIONS || {});

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
  return config &&
    config.url && !String(config.url).startsWith('REPLACE_') &&
    config.anonKey && !String(config.anonKey).startsWith('REPLACE_');
}

function emailDomain(email) {
  return String(email || '').split('@')[1] || '';
}

async function enforceAllowedDomain(client, user) {
  if (options.requireEmailVerification && !user.email_confirmed_at) {
    await client.auth.signOut();
    track('auth_email_unverified', { email_domain: emailDomain(user.email) });
    status('Verifica tu correo corporativo antes de entrar al portal privado.', 'warn');
    return false;
  }

  const allowed = Array.isArray(options.allowedEmailDomains) ? options.allowedEmailDomains.filter(Boolean) : [];
  if (!allowed.length) return true;

  const domain = emailDomain(user.email);
  if (allowed.includes(domain)) return true;

  await client.auth.signOut();
  track('auth_domain_rejected', { email_domain: domain, allowed_domains: allowed.join(',') });
  status('Este acceso está restringido a correos corporativos autorizados: ' + allowed.join(', '), 'warn');
  return false;
}

function applyUser(user, profile) {
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuario';
  document.documentElement.classList.add('auth-ready');
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email || 'Usuario');
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = displayName);
  window.dispatchEvent(new CustomEvent('dataseed:auth-ready', { detail: { email: user.email || '', name: displayName, profile } }));
}

(async function bootDataseedAuth() {
  if (!hasValidConfig()) {
    window.DataseedAuth = {
      ready: false,
      mode: 'missing-config',
      message: 'Supabase config no encontrada. Crear js/supabase-config.js desde js/supabase-config.example.js.'
    };
    track('auth_supabase_config_missing');
    status('Modo preview: falta configuración Supabase. Crear js/supabase-config.js con Project URL y anon key.', 'warn');
    return;
  }

  const client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  window.DataseedAuth = { ready: true, provider: 'supabase', client };
  track('auth_supabase_ready');

  const form = document.getElementById('auth-form');
  const recover = document.querySelector('[data-auth-action="recover"]');
  const google = document.querySelector('[data-auth-oauth="google"]');
  const microsoft = document.querySelector('[data-auth-oauth="microsoft"]');
  const logout = document.querySelector('[data-auth-action="logout"]');

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

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const name = String(fd.get('name') || '').trim();
    const mode = form.dataset.authMode || 'login';

    if (!email || !email.includes('@')) return status('Ingresa un email válido.', 'warn');
    if (password.length < 8) return status('La contraseña debe tener al menos 8 caracteres.', 'warn');

    const submit = form.querySelector('[type="submit"]');
    const previous = submit?.textContent;
    if (submit) { submit.disabled = true; submit.textContent = mode === 'register' ? 'Creando acceso…' : 'Ingresando…'; }

    try {
      let result;
      if (mode === 'register') {
        result = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: new URL(getRedirectTarget(), window.location.origin).href
          }
        });
        if (result.error) throw result.error;
        track('auth_register_success', { method: 'password', email_domain: emailDomain(email) });
        if (!result.data.session) {
          status('Acceso creado. Revisa tu correo si Supabase exige confirmación antes de entrar.', 'ok');
          return;
        }
      } else {
        result = await client.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        track('auth_login_success', { method: 'password', email_domain: emailDomain(email) });
      }

      const user = result.data.user;
      if (!user || !(await enforceAllowedDomain(client, user))) return;
      status('Acceso correcto. Redirigiendo…', 'ok');
      window.location.href = getRedirectTarget();
    } catch (error) {
      console.warn('[Dataseed Supabase Auth]', error);
      track('auth_error', { code: error.message || 'unknown', auth_mode: mode });
      const friendly = {
        'Invalid login credentials': 'Credenciales inválidas. Revisa email y contraseña.',
        'User already registered': 'Ese email ya tiene acceso. Prueba ingresar o recuperar contraseña.',
        'Password should be at least 6 characters.': 'La contraseña es muy débil. Usa mínimo 8 caracteres.'
      }[error.message] || 'No se pudo completar el acceso. Revisa configuración Supabase o intenta nuevamente.';
      status(friendly, 'warn');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = previous; }
    }
  });

  recover?.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = String(document.getElementById('email')?.value || '').trim();
    if (!email || !email.includes('@')) return status('Escribe tu email para enviar recuperación.', 'warn');
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('login.html', window.location.origin).href
    });
    if (error) {
      track('auth_recover_error', { code: error.message || 'unknown' });
      return status('No se pudo enviar recuperación. Revisa el email o configuración Supabase.', 'warn');
    }
    track('auth_recover_sent', { email_domain: emailDomain(email) });
    status('Enviamos instrucciones de recuperación a tu email.', 'ok');
  });

  google?.addEventListener('click', async () => {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: new URL(getRedirectTarget(), window.location.origin).href }
    });
    if (error) {
      track('auth_error', { code: error.message || 'unknown', method: 'google' });
      status('No se pudo iniciar sesión con Google.', 'warn');
    }
  });

  microsoft?.addEventListener('click', () => {
    status('Microsoft queda oculto/desactivado hasta configurar el proveedor en Supabase.', 'warn');
  });

  logout?.addEventListener('click', async () => {
    await client.auth.signOut();
    track('auth_logout');
    window.location.href = options.redirectAfterLogout;
  });

  if (document.body.dataset.requireAuth === 'true') {
    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      track('auth_guard_redirect', { from: location.pathname });
      window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname);
      return;
    }
    if (!(await enforceAllowedDomain(client, user))) return;

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id,email,full_name,role,company_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('[Dataseed Supabase Profile]', profileError);
      track('auth_profile_error', { code: profileError.message || 'unknown' });
      status('Sesión válida, pero no se pudo cargar el perfil. Revisar tabla profiles/RLS.', 'warn');
    }

    applyUser(user, profile);
    track('auth_guard_ok', { email_domain: emailDomain(user.email) });
  }
})();
