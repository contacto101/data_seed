const { competitors, filterOpportunities, industryLabels } = require('./data');
const { fetchLiveTenders, hasChileCompraTicket } = require('./chilecompra');

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.end(JSON.stringify(body));
}

function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function filterLiveOpportunities(list, { industry = 'ti', region = 'all', keyword = '' } = {}) {
  const kw = normalizeText(keyword);
  const filtered = list.filter((tender) => {
    const matchesIndustry = industry === 'all' || tender.industry === industry;
    const matchesRegion = region === 'all' || tender.region === region;
    const haystack = normalizeText([tender.title, tender.organization, ...tender.keywords].join(' '));
    const matchesKeyword = !kw || haystack.includes(kw);
    return matchesIndustry && matchesRegion && matchesKeyword;
  });

  return filtered.sort((a, b) => b.score - a.score);
}

async function resolveOpportunities(query) {
  const demo = filterOpportunities(query);

  if (!hasChileCompraTicket()) {
    return {
      mode: 'demo_until_chilecompra_ticket',
      source: 'Datos demostrativos normalizados. Conexión productiva requiere ticket oficial ChileCompra.',
      opportunities: demo
    };
  }

  try {
    const live = await fetchLiveTenders();
    const filtered = filterLiveOpportunities(live.tenders, query);
    return {
      mode: 'chilecompra_live',
      source: 'API Mercado Público ChileCompra',
      opportunities: filtered.length ? filtered : demo,
      liveCount: live.count
    };
  } catch (error) {
    return {
      mode: 'chilecompra_error_demo_fallback',
      source: 'Fallback demo: la API ChileCompra no respondió correctamente.',
      warning: error.message,
      opportunities: demo
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const { industry = 'ti', region = 'all', keyword = '' } = req.query || {};
  const query = { industry, region, keyword };
  const result = await resolveOpportunities(query);

  return sendJson(res, 200, {
    connected: true,
    mode: result.mode,
    profile: {
      industry,
      industryLabel: industryLabels[industry] || industry,
      region,
      keyword
    },
    count: result.opportunities.length,
    opportunities: result.opportunities,
    competitors,
    meta: {
      source: result.source,
      warning: result.warning,
      liveCount: result.liveCount,
      plannedSources: ['licitaciones', 'órdenes de compra', 'compradores', 'proveedores'],
      officialApi: 'https://www.chilecompra.cl/api/',
      generatedAt: new Date().toISOString()
    }
  });
};
