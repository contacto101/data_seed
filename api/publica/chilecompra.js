const DEFAULT_API_BASE_URL = 'https://api.mercadopublico.cl/servicios/v1/publico';

function hasChileCompraTicket() {
  return Boolean(process.env.CHILECOMPRA_TICKET && process.env.CHILECOMPRA_TICKET.trim());
}

function getApiBaseUrl() {
  return (process.env.CHILECOMPRA_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

function formatDateForChileCompra(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function inferIndustry(source = {}) {
  const haystack = normalizeText([
    source.Nombre,
    source.Descripcion,
    source.Categoria,
    source.Rubro,
    source.Unidad,
    source.NombreProducto
  ].filter(Boolean).join(' '));

  if (/software|tecnolog|plataforma|licencia|datos|analitica|web|soporte|comput/.test(haystack)) return 'ti';
  if (/salud|clinico|hospital|medic|insumo/.test(haystack)) return 'salud';
  if (/obra|construccion|infraestructura|mantencion|conservacion/.test(haystack)) return 'construccion';
  if (/educacion|aula|colegio|universidad|capacitacion/.test(haystack)) return 'educacion';
  return 'otros';
}

function parseBudget(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function normalizeTender(source = {}) {
  const buyer = source.Comprador || source.comprador || {};
  const dates = source.Fechas || source.fechas || {};
  const amount = source.MontoEstimado || source.MontoDisponible || source.montoEstimado || 0;
  const budget = parseBudget(amount);
  const industry = inferIndustry(source);
  const title = source.Nombre || source.title || 'Licitación sin título informado';
  const keywords = Array.from(new Set([
    industry === 'ti' ? 'software' : null,
    industry === 'salud' ? 'insumos' : null,
    industry === 'construccion' ? 'obras' : null,
    industry === 'educacion' ? 'educación' : null,
    source.Categoria,
    source.Rubro
  ].filter(Boolean))).slice(0, 4);

  return {
    id: source.CodigoExterno || source.Codigo || source.id || 'SIN-CODIGO',
    industry,
    region: buyer.RegionUnidad || source.Region || 'Sin región informada',
    title,
    organization: buyer.NombreOrganismo || source.Organismo || 'Organismo no informado',
    budget,
    close: dates.FechaCierre || source.FechaCierre || 'Sin fecha informada',
    score: scoreTender({ title, budget, industry, close: dates.FechaCierre || source.FechaCierre }),
    keywords,
    prices: buildComparablePriceSeries(budget),
    summary: buildSummary(title, budget, industry)
  };
}

function scoreTender({ title, budget, industry, close }) {
  let score = 58;
  if (industry !== 'otros') score += 18;
  if (budget >= 100000000) score += 12;
  if (/mantenci|soporte|desarrollo|suministro|equipamiento/i.test(title || '')) score += 8;
  if (close) score += 4;
  return Math.min(score, 96);
}

function buildComparablePriceSeries(budget) {
  const base = Math.max(Math.round((budget || 120000000) / 1000000), 24);
  return [0.62, 0.71, 0.82, 0.94, 1.05, 1.14].map((factor) => Math.max(18, Math.round(base * factor)));
}

function buildSummary(title, budget, industry) {
  const budgetText = budget ? `Presupuesto informado cercano a $${Math.round(budget / 1000000).toLocaleString('es-CL')}M.` : 'Presupuesto no informado en la respuesta base.';
  const focus = industry === 'otros' ? 'Requiere clasificación manual por rubro/keywords.' : `Clasificada preliminarmente en industria ${industry}.`;
  return `${focus} ${budgetText} Conviene revisar bases, requisitos administrativos y adjudicaciones históricas comparables.`;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`chilecompra_http_${response.status}:${text.slice(0, 120)}`);
  }
  return response.json();
}

async function fetchLiveTenders({ date = new Date(), ticket = process.env.CHILECOMPRA_TICKET } = {}) {
  if (!ticket) {
    return { ok: false, reason: 'missing_chilecompra_ticket', tenders: [] };
  }

  const params = new URLSearchParams({ fecha: formatDateForChileCompra(date), ticket });
  const url = `${getApiBaseUrl()}/licitaciones.json?${params.toString()}`;
  const payload = await fetchJson(url);
  const raw = payload.Listado || payload.listado || payload.licitaciones || [];
  const list = Array.isArray(raw) ? raw : [];

  return {
    ok: true,
    source: 'chilecompra_api',
    fetchedAt: new Date().toISOString(),
    count: list.length,
    tenders: list.map(normalizeTender)
  };
}

module.exports = {
  DEFAULT_API_BASE_URL,
  hasChileCompraTicket,
  formatDateForChileCompra,
  inferIndustry,
  normalizeTender,
  fetchLiveTenders
};
