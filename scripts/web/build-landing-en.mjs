// Genera site/en.html a partir de site/index.html aplicando las traducciones de landing-en.json.
// La página en español es la fuente: se edita index.html, se corre `npm run build:en` y se commitean ambas.
// Si un texto en español cambió y su traducción ya no calza, el script se detiene y lo nombra.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const paths = {
  es: new URL('site/index.html', root),
  en: new URL('site/en.html', root),
  pairs: new URL('scripts/web/landing-en.json', root),
};

export async function buildEnglish() {
  const [html, pairs] = await Promise.all([
    readFile(paths.es, 'utf8'),
    readFile(paths.pairs, 'utf8').then(JSON.parse),
  ]);
  const missing = [];
  let out = html;
  for (const [es, en] of pairs) {
    if (!out.includes(es)) missing.push(es);
    out = out.split(es).join(en);
  }
  return { html: out, missing };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { html, missing } = await buildEnglish();
  if (missing.length) {
    console.error('Textos en español que ya no aparecen en site/index.html (actualizar scripts/web/landing-en.json):');
    for (const text of missing) console.error(`  - ${text.slice(0, 100)}`);
    process.exit(1);
  }
  await writeFile(paths.en, html);
  console.log('site/en.html actualizado.');
}
