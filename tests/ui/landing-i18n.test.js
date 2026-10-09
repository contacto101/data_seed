import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildEnglish } from '../../scripts/web/build-landing-en.mjs';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('site/en.html is generated from the current site/index.html', async () => {
  const [{ html, missing }, committed] = await Promise.all([buildEnglish(), read('site/en.html')]);

  assert.deepEqual(missing, [], 'hay textos sin traducción: correr npm run build:en');
  assert.equal(committed, html, 'site/en.html quedó desactualizado: correr npm run build:en');
});

test('both languages link to each other and mark the current one', async () => {
  const [es, en] = await Promise.all([read('site/index.html'), read('site/en.html')]);

  assert.match(es, /<html lang="es">/);
  assert.match(en, /<html lang="en">/);
  for (const html of [es, en]) {
    assert.match(html, /<link rel="alternate" hreflang="es" href="https:\/\/dataseed\.cl\/site\/index\.html">/);
    assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/dataseed\.cl\/site\/en\.html">/);
  }
  assert.match(es, /<a href="index\.html" hreflang="es" lang="es" aria-current="true"/);
  assert.match(en, /<a href="en\.html" hreflang="en" lang="en" aria-current="true"/);
  assert.match(en, /<link rel="canonical" href="https:\/\/dataseed\.cl\/site\/en\.html">/);
});
