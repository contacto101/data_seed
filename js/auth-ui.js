(function(){
  const form = document.getElementById('auth-form');
  const statusBox = document.getElementById('auth-status');
  const nameField = document.getElementById('name-field');
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const submit = form?.querySelector('[type="submit"]');
  const password = document.getElementById('password');
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
    if (submit) submit.textContent = mode === 'register' ? 'Crear acceso' : 'Ingresar';
    if (password) password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
    setStatus('', '');
    track('auth_mode_change', {auth_mode: mode});
  }

  function setStatus(message, type){
    if (!statusBox) return;
    statusBox.textContent = message || '';
    statusBox.className = 'status' + (type ? ' ' + type : '');
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.authTab)));

  emailToggle?.addEventListener('click', function(){
    if (!emailPanel) return;
    const willOpen = emailPanel.hidden;
    emailPanel.hidden = !willOpen;
    emailToggle.textContent = willOpen ? 'Ocultar email y contraseña' : 'Usar email y contraseña';
    track('auth_email_panel_toggle', {open: willOpen});
  });

  document.addEventListener('click', function(e){
    const recover = e.target.closest('[data-auth-action="recover"]');
    if (recover) {
      e.preventDefault();
      if (window.DataseedAuth?.ready) return;
      const email = document.getElementById('email')?.value || '';
      setStatus('Flujo de recuperación preparado. Falta conectar endpoint del proveedor auth.', 'warn');
      track('auth_recover_click', {email_domain: email.split('@')[1] || ''});
    }
    const oauth = e.target.closest('[data-auth-oauth]');
    if (oauth) {
      if (window.DataseedAuth?.ready) return;
      setStatus('OAuth ' + oauth.dataset.authOauth + ' preparado. Falta conectar proveedor auth.', 'warn');
      track('auth_oauth_click', {provider: oauth.dataset.authOauth});
    }
  });

  form?.addEventListener('submit', function(e){
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const pwd = String(data.get('password') || '');
    const mode = form.dataset.authMode || 'login';

    if (!email || !email.includes('@')) {
      setStatus('Ingresa un email de trabajo válido.', 'warn');
      track('auth_validation_error', {field: 'email', auth_mode: mode});
      return;
    }
    if (pwd.length < 8) {
      setStatus('La contraseña debe tener al menos 8 caracteres.', 'warn');
      track('auth_validation_error', {field: 'password', auth_mode: mode});
      return;
    }

    setStatus('Interfaz validada. Próximo paso: conectar proveedor de autenticación para crear sesión real.', 'ok');
    track('auth_frontend_validated', {auth_mode: mode, email_domain: email.split('@')[1] || ''});
  });
})();
