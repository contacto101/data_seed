const assert = require('node:assert/strict');
const { buildAgentAnswer, filterOpportunities, getTenderById } = require('../api/publica/data');

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

if (process.exitCode) {
  process.exit(process.exitCode);
}
