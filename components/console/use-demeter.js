function normalizeReplyText(value) {
  return String(value || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseDemeterReply(data) {
  if (typeof data?.reply === 'string') return normalizeReplyText(data.reply);
  if (typeof data?.message === 'string') return normalizeReplyText(data.message);
  if (typeof data?.content === 'string') return normalizeReplyText(data.content);
  const choice = data?.choices?.[0]?.message?.content;
  if (typeof choice === 'string') return normalizeReplyText(choice);
  const textBlock = Array.isArray(data?.content)
    ? data.content.find((block) => block?.type === 'text')?.text
    : null;
  if (typeof textBlock === 'string') return normalizeReplyText(textBlock);
  return 'Demeter no entregó contenido en la respuesta.';
}

export function useDemeter(config) {
  if (!config?.demeterApiBaseUrl) {
    throw new Error('Missing Demeter API base URL');
  }

  async function sendMessage({ sessionId, messages }) {
    const headers = { 'Content-Type': 'application/json' };
    if (config.demeterApiKey) headers.Authorization = `Bearer ${config.demeterApiKey}`;

    const response = await fetch(config.demeterApiBaseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId,
        messages,
        source: 'dataseed-internal-agent-console'
      })
    });

    if (!response.ok) {
      throw new Error(`Demeter request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: parseDemeterReply(data),
      createdAt: new Date().toISOString()
    };
  }

  return { sendMessage };
}
