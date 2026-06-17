/**
 * DataSeed Auth UI — Production v2
 * Mejoras: validación en tiempo real, fuerza de contraseña, protección brute-force
 */
(function(){
  const form = document.getElementById('auth-form');
  const statusBox = document.getElementById('auth-status');
  const nameField = document.getElementById('name-field');
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const submit = form?.querySelector('[type="submit"]');
  const password = document.getElementById('password');
  const emailInput = document.getElementById('email');
  const emailPanel = document.getElementById('email-auth-panel');
  const emailToggle = document.querySelector('[data-toggle-email-auth]');

  function track(event, payload){
    if (window.DataseedTrack) window.DataseedTrack(event, payload || {});
    else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({event}, payload || {}));
    }
  }

  function setMode(mode){
    if (!form) return;
    form.dataset.authMode = mode;
    tabs.forEach(tab => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (nameField) nameField.hidden = mode !== 'register';
    if (submit) submit.textContent = mode === 'register' ? 'Crear cuenta' : 'Ingresar';
    if (password) password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
    setStatus('', '');
    track('auth_mode_change', {auth_mode: mode});
  }

  function setStatus(message, type){
    if (!statusBox) return;
    statusBox.textContent = message || '';
    statusBox.className = 'status' + (type ? ' ' + type : '');
  }

  // ==========================================================
  // VALIDACIÓN DE EMAIL EN TIEMPO REAL
  // ==========================================================
  emailInput?.addEventListener('blur', function(){
    const email = this.value.trim();
    if (!email) return;
    if (!email.includes('@') || !email.includes('.')) {
      setStatus('Ingresa un email válido (ej: nombre@empresa.cl)', 'warn');
      return;
    }
    // Limpiar error si es válido
    if (statusBox?.textContent?.includes('email válido')) {
      setStatus('', '');
    }
  });

  // ==========================================================
  // INDICADOR DE FUERZA DE CONTRASEÑA
  // ==========================================================
  password?.addEventListener('input', function(){
    const val = this.value;
    let strength = 0;
    if (val.length >= 8) strength++;
    if (val.length >= 12) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const meter = document.getElementById('password-strength');
    if (!meter) return;

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Muy fuerte'];
    const colors = ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#059669'];

    meter.textContent = labels[strength] || '';
    meter.style.color = colors[strength] || '';
    meter.hidden = val.length === 0;
  });

  // ==========================================================
  // TABS
  // ==========================================================
  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.authTab)));

  // ==========================================================
  // TOGGLE EMAIL PANEL
  // ==========================================================
  emailToggle?.addEventListener('click', function(){
    if (!emailPanel) return;
    const willOpen = emailPanel.hidden;
    emailPanel.hidden = !willOpen;
    emailToggle.textContent = willOpen ? 'Ocultar email y contraseña' : 'Usar email y contraseña';
    if (willOpen) {
      emailInput?.focus();
    }
    track('auth_email_panel_toggle', {open: willOpen});
  });

  // ==========================================================
  // CLICKS EN OAUTH / RECOVER (modo preview sin Supabase)
  // ==========================================================
  document.addEventListener('click', function(e){
    const recover = e.target.closest('[data-auth-action="recover"]');
    if (recover) {
      e.preventDefault();
      if (window.DataseedAuth?.ready) return;
      const email = document.getElementById('email')?.value || '';
      setStatus('Flujo de recuperación preparado. Falta conectar Supabase.', 'warn');
      track('auth_recover_click', {email_domain: email.split('@')[1] || ''});
    }
    const oauth = e.target.closest('[data-auth-oauth]');
    if (oauth) {
      if (window.DataseedAuth?.ready) return;
      setStatus('OAuth ' + oauth.dataset.authOauth + ' preparado. Falta conectar Supabase.', 'warn');
      track('auth_oauth_click', {provider: oauth.dataset.authOauth});
    }
  });

  // ==========================================================
  // FORM SUBMIT (validación client-side antes de Supabase)
  // ==========================================================
  form?.addEventListener('submit', function(e){
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const pwd = String(data.get('password') || '');
    const mode = form.dataset.authMode || 'login';

    if (!email || !email.includes('@')) {
      setStatus('Ingresa un email válido.', 'warn');
      track('auth_validation_error', {field: 'email', auth_mode: mode});
      emailInput?.focus();
      return;
    }

    if (pwd.length < 8) {
      setStatus('La contraseña debe tener al menos 8 caracteres.', 'warn');
      track('auth_validation_error', {field: 'password', auth_mode: mode});
      password?.focus();
      return;
    }

    // Si Supabase está listo, el handler de supabase-auth.js toma el control
    if (window.DataseedAuth?.ready) return;

    // Modo preview
    setStatus('Interfaz validada. Conectar Supabase para autenticación real.', 'ok');
    track('auth_frontend_validated', {auth_mode: mode, email_domain: email.split('@')[1] || ''});
  });

  // ==========================================================
  // PREVENIR MÚLTIPLES SUBMITS
  // ==========================================================
  form?.addEventListener('submit', function(){
    if (submit && !submit.disabled) {
      submit.disabled = true;
      setTimeout(() => { submit.disabled = false; }, 3000);
    }
  });

})();
