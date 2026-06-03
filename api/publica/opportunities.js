const { competitors, filterOpportunities, industryLabels } = require('./data');

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.end(JSON.stringify(body));
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const { industry = 'ti', region = 'all', keyword = '' } = req.query || {};
  const opportunities = filterOpportunities({ industry, region, keyword });

  return sendJson(res, 200, {
    connected: true,
    mode: process.env.CHILECOMPRA_TICKET ? 'chilecompra_ready' : 'demo_until_chilecompra_ticket',
    profile: {
      industry,
      industryLabel: industryLabels[industry] || industry,
      region,
      keyword
    },
    count: opportunities.length,
    opportunities,
    competitors,
    meta: {
      source: 'Datos demostrativos normalizados. Conexión productiva requiere ticket oficial ChileCompra.',
      plannedSources: ['licitaciones', 'órdenes de compra', 'compradores', 'proveedores'],
      generatedAt: new Date().toISOString()
    }
  });
};
