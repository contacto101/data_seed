const assert = require('node:assert/strict');
const { buildAgentAnswer, filterOpportunities, getTenderById } = require('../api/publica/data');
const { buildAlerts } = require('../api/publica/alerts');
const { formatDateForChileCompra, hasChileCompraTicket, inferIndustry, normalizeTender } = require('../api/publica/chilecompra');

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

test('filters opportunities by industry', () => {
  const results = filterOpportunities({ industry: 'ti', region: 'all', keyword: '' });
  assert.ok(results.length >= 2);
  assert.ok(results.every((item) => item.industry === 'ti'));
});

test('filters opportunities by region and keyword without accents', () => {
  const results = filterOpportunities({ industry: 'ti', region: 'Valparaíso', keyword: 'analitica' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '887-19-LP26');
});

test('falls back to industry results when keyword has no exact match', () => {
  const results = filterOpportunities({ industry: 'salud', region: 'all', keyword: 'zzz' });
  assert.ok(results.length >= 1);
  assert.ok(results.every((item) => item.industry === 'salud'));
});

test('agent answer references the selected tender and price range', () => {
  const tender = getTenderById('1023-44-LQ26');
  const reply = buildAgentAnswer(tender, '¿Qué precio conviene?');
  assert.match(reply.answer, /Precio:/);
  assert.match(reply.answer, /84M–148M/);
  assert.equal(reply.sources[1].type, 'planned_connector');
});

test('formats ChileCompra date as ddmmyyyy', () => {
  assert.equal(formatDateForChileCompra(new Date('2026-06-03T12:00:00Z')), '03062026');
});

test('does not report live ChileCompra mode without ticket', () => {
  const previous = process.env.CHILECOMPRA_TICKET;
  delete process.env.CHILECOMPRA_TICKET;
  assert.equal(hasChileCompraTicket(), false);
  if (previous) process.env.CHILECOMPRA_TICKET = previous;
});

test('infers and normalizes ChileCompra tender payload', () => {
  const normalized = normalizeTender({
    CodigoExterno: '111-22-LQ26',
    Nombre: 'Servicio de desarrollo de software para analítica institucional',
    MontoEstimado: 250000000,
    Comprador: { NombreOrganismo: 'Organismo demo', RegionUnidad: 'Metropolitana' },
    Fechas: { FechaCierre: '2026-06-10T15:00:00' }
  });
  assert.equal(normalized.id, '111-22-LQ26');
  assert.equal(normalized.industry, 'ti');
  assert.equal(normalized.organization, 'Organismo demo');
  assert.ok(normalized.score >= 90);
});

test('builds actionable alerts from opportunity profile', () => {
  const alerts = buildAlerts({ industry: 'ti', region: 'all', keyword: 'software', minScore: 80 });
  assert.ok(alerts.length >= 1);
  assert.equal(alerts[0].priority, 'alta');
  assert.match(alerts[0].reason, /score/);
});

test('infers industries from Spanish public procurement text', () => {
  assert.equal(inferIndustry({ Nombre: 'Suministro de insumos clínicos hospitalarios' }), 'salud');
  assert.equal(inferIndustry({ Nombre: 'Conservación de infraestructura y obras menores' }), 'construccion');
  assert.equal(inferIndustry({ Nombre: 'Equipamiento tecnológico para aulas' }), 'ti');
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
