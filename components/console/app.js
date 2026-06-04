import { createSession, loadSessions, upsertSession } from './session-store.js';
import { useDemeter } from './use-demeter.js';

const config = window.DATASEED_CONSOLE_CONFIG || {};
const demeter = useDemeter(config);
const modules = [
  { id: 'chat', icon: '●', label: 'Chat', status: 'active', description: 'Conversación directa con Demeter.' },
  { id: 'monitor', icon: '◌', label: 'Agent Monitor', status: 'soon', description: 'Supervisión de estado, latencia, errores y disponibilidad del agente.' },
  { id: 'analytics', icon: '◇', label: 'Analytics', status: 'soon', description: 'Métricas operativas de conversaciones, uso y resultados.' },
  { id: 'logs', icon: '≡', label: 'Logs', status: 'soon', description: 'Búsqueda y revisión de eventos técnicos del backend Hermes.' },
  { id: 'users', icon: '□', label: 'Users', status: 'soon', description: 'Administración de usuarios, roles y permisos internos.' },
  { id: 'multi-agent', icon: '✣', label: 'Multi-Agent', status: 'soon', description: 'Coordinación de flujos con múltiples agentes especializados.' }
];

const state = {
  route: 'chat',
  sessions: loadSessions(),
  currentSession: null,
  busy: false
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatTime(value) {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function relativeSessionTime(value) {
  return new Intl.DateTimeFormat('es-CL', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function ensureSession() {
  if (!state.currentSession) {
    state.currentSession = state.sessions[0] || createSession();
    if (!state.sessions.some((session) => session.id === state.currentSession.id)) {
      state.currentSession = upsertSession(state.currentSession);
      state.sessions = loadSessions();
    }
  }
}

function renderShell() {
  const root = document.getElementById('console-root');
  root.innerHTML = `
    <div class="console-app">
      <aside class="console-sidebar">
        <div class="sidebar-brand">
          <img src="dataseed_logo_black.png" alt="Dataseed">
          <div class="brand-copy"><strong>Dataseed</strong><span>internal</span></div>
        </div>
        <nav class="sidebar-nav" aria-label="Console modules">
          ${modules.map((item) => `
            <button class="nav-item ${state.route === item.id ? 'active' : ''}" type="button" data-route="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
              <span class="nav-status">${item.status === 'active' ? 'live' : 'soon'}</span>
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <span>Hermes backend: configured by runtime environment.</span>
          <span>Auth guard: ${config.skipAuth ? 'bypass enabled' : 'required'}</span>
        </div>
      </aside>
      <main class="console-main">
        <header class="console-header">
          <div class="header-left">
            <div class="header-logo"><img src="dataseed_logo_black.png" alt="Dataseed"><strong>Agent Console</strong></div>
            <div class="header-divider"></div>
            <div class="header-title"><span>Module</span><h1>${modules.find((item) => item.id === state.route)?.label || 'Console'}</h1></div>
          </div>
          <div class="header-right">
            <span class="${config.environment === 'PROD' ? 'env-badge' : 'dev-badge'}">${escapeHtml(config.environment || 'DEV')}</span>
            <span class="user-pill">${escapeHtml(config.currentUser || 'Equipo DataSeed')}</span>
          </div>
        </header>
        <section class="route-outlet" id="route-outlet"></section>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      state.route = button.dataset.route;
      renderShell();
      renderRoute();
    });
  });
}

function renderRoute() {
  if (state.route === 'chat') renderChat();
  else renderStub(state.route);
}

function renderStub(route) {
  const mod = modules.find((item) => item.id === route);
  document.getElementById('route-outlet').innerHTML = `
    <div class="stub-screen">
      <div class="stub-card">
        <span class="env-badge">In development</span>
        <h2>${escapeHtml(mod.label)}</h2>
        <p>${escapeHtml(mod.description)}</p>
        <div class="auth-guard-banner">Route mounted inside console shell. Future auth guard can protect this module without changing layout structure.</div>
      </div>
    </div>
  `;
}

function renderChat() {
  ensureSession();
  const outlet = document.getElementById('route-outlet');
  outlet.innerHTML = `
    <div class="chat-workspace">
      <aside class="history-panel">
        <div class="history-head">
          <span class="section-kicker">Conversation history</span>
          <button class="new-session-btn" type="button" id="new-session">New conversation</button>
        </div>
        <div class="session-list" id="session-list"></div>
      </aside>
      <section class="chat-panel">
        <div class="chat-head">
          <div class="agent-ident">
            <div class="agent-mark">D</div>
            <div class="agent-copy"><strong>Demeter</strong><span>Hermes backend agent</span></div>
          </div>
          <div class="connection-state"><span class="connection-dot"></span><span>Direct access</span></div>
        </div>
        <div class="messages" id="messages"></div>
        <div class="chat-input-shell">
          <div class="quick-prompts">
            <button class="quick-prompt" type="button" data-prompt="Resume el estado operativo actual de Demeter.">Estado operativo</button>
            <button class="quick-prompt" type="button" data-prompt="Qué tareas internas están pendientes para el portal DataSeed?">Pendientes portal</button>
            <button class="quick-prompt" type="button" data-prompt="Revisa riesgos antes de publicar cambios a producción.">Riesgos producción</button>
          </div>
          <form class="input-row" id="chat-form">
            <input class="chat-input" id="chat-input" autocomplete="off" placeholder="Escribe una instrucción interna para Demeter...">
            <button class="send-btn" id="send-btn" type="submit" aria-label="Enviar">→</button>
          </form>
        </div>
      </section>
    </div>
  `;
  bindChatEvents();
  renderHistory();
  renderMessages();
}

function bindChatEvents() {
  document.getElementById('new-session').addEventListener('click', () => {
    state.currentSession = upsertSession(createSession());
    state.sessions = loadSessions();
    renderHistory();
    renderMessages();
    document.getElementById('chat-input').focus();
  });

  document.getElementById('chat-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content || state.busy) return;
    input.value = '';
    sendUserMessage(content);
  });

  document.querySelectorAll('[data-prompt]').forEach((button) => {
    button.addEventListener('click', () => sendUserMessage(button.dataset.prompt));
  });
}

function renderHistory() {
  const list = document.getElementById('session-list');
  list.innerHTML = state.sessions.map((session) => {
    const firstUser = session.messages.find((message) => message.role === 'user');
    const preview = firstUser?.content || 'Sin mensajes todavía';
    return `
      <button class="session-item ${session.id === state.currentSession.id ? 'active' : ''}" type="button" data-session-id="${session.id}">
        <span class="session-time">${relativeSessionTime(session.updatedAt)}</span>
        <span class="session-preview">${escapeHtml(preview)}</span>
        <span class="session-meta">${session.messages.length} mensajes</span>
      </button>
    `;
  }).join('');
  list.querySelectorAll('[data-session-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentSession = state.sessions.find((session) => session.id === button.dataset.sessionId);
      renderHistory();
      renderMessages();
    });
  });
}

function renderMessages() {
  const box = document.getElementById('messages');
  const messages = state.currentSession.messages;
  if (!messages.length) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-card">
          <strong>Sin conversación activa</strong>
          <p>Inicia una sesión interna con Demeter. El historial queda persistido en este navegador.</p>
        </div>
      </div>
    `;
    return;
  }
  box.innerHTML = messages.map((message) => `
    <article class="message ${message.role === 'user' ? 'user' : 'agent'}">
      <div class="message-meta">
        <span>${message.role === 'user' ? 'Usuario' : 'Demeter'}</span>
        <time class="message-time" datetime="${message.createdAt}">${formatTime(message.createdAt)}</time>
      </div>
      <div class="message-bubble">${escapeHtml(message.content)}</div>
    </article>
  `).join('') + (state.busy ? `
    <article class="message agent" id="typing-message">
      <div class="message-meta"><span>Demeter</span></div>
      <div class="typing"><span></span><span></span><span></span></div>
    </article>
  ` : '');
  box.scrollTop = box.scrollHeight;
}

async function sendUserMessage(content) {
  ensureSession();
  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  };
  state.currentSession.messages.push(userMessage);
  state.currentSession = upsertSession(state.currentSession);
  state.sessions = loadSessions();
  state.busy = true;
  renderHistory();
  renderMessages();
  setInputDisabled(true);

  try {
    const reply = await demeter.sendMessage({
      sessionId: state.currentSession.id,
      messages: state.currentSession.messages.map((message) => ({ role: message.role, content: message.content }))
    });
    state.currentSession.messages.push(reply);
  } catch (error) {
    state.currentSession.messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Error de conexión con Demeter: ${error.message}`,
      createdAt: new Date().toISOString()
    });
  }

  state.currentSession = upsertSession(state.currentSession);
  state.sessions = loadSessions();
  state.busy = false;
  setInputDisabled(false);
  renderHistory();
  renderMessages();
}

function setInputDisabled(disabled) {
  document.getElementById('chat-input').disabled = disabled;
  document.getElementById('send-btn').disabled = disabled;
}

function authGuardAllowsRender() {
  return config.skipAuth === true;
}

if (!authGuardAllowsRender()) {
  document.getElementById('console-root').innerHTML = '<div class="stub-screen"><div class="stub-card"><span class="env-badge">Auth required</span><h2>Login pendiente</h2><p>El guard está listo para redirigir a /login cuando se habilite autenticación.</p></div></div>';
} else {
  ensureSession();
  renderShell();
  renderRoute();
}
