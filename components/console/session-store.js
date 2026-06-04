const STORAGE_KEY = 'dataseed.console.sessions.v1';

export function createSession() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    title: 'Nueva conversación',
    messages: []
  };
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function upsertSession(session) {
  const sessions = loadSessions();
  const index = sessions.findIndex((item) => item.id === session.id);
  const next = { ...session, updatedAt: new Date().toISOString() };
  if (next.messages.length > 0) {
    const firstUser = next.messages.find((message) => message.role === 'user');
    next.title = firstUser ? firstUser.content.slice(0, 80) : next.title;
  }
  if (index >= 0) sessions[index] = next;
  else sessions.unshift(next);
  sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  saveSessions(sessions);
  return next;
}
