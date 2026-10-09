import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const landingUrl = new URL('../../site/index.html', import.meta.url);
const readLanding = () => readFile(landingUrl, 'utf8');

test('phone navigation uses an accessible hamburger drawer and compact hero', async () => {
  const html = await readLanding();

  assert.match(
    html,
    /<button class="menu-toggle" type="button" id="menuToggle" aria-label="Abrir menú" aria-controls="mobileMenu" aria-expanded="false">/,
  );
  assert.match(html, /<div class="mobile-menu" id="mobileMenu" role="navigation" aria-label="Navegación móvil" hidden>/);
  assert.doesNotMatch(html, /desktop-nav/);
  assert.match(html, /\.menu-toggle\{display:inline-flex;/);
  assert.match(html, /\.area-nav\{display:none;\}/);
  assert.match(html, /#hero \.ticker-wrap\{width:auto;margin:0 -1\.5rem 2rem;\}/);
  assert.doesNotMatch(html, /\.logo>div\{display:none;\}/);
  assert.match(html, /menuToggle\.setAttribute\('aria-expanded',String\(open\)\)/);
  assert.match(html, /if\(event\.key==='Escape'\)setMenu\(false\)/);
  assert.match(html, /backgroundElements\.forEach\(\(element\)=>\{element\.inert=open;\}\)/);
  assert.match(html, /if\(event\.key==='Tab'&&menuToggle\.getAttribute\('aria-expanded'\)==='true'\)/);
  assert.match(html, /returnFocus\?\.focus\(\)/);
});

test('header and phone menu list the same areas, and each one exists in the page', async () => {
  const html = await readLanding();
  const header = html.match(/<ul class="area-nav"[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? '';
  const phone = html.match(/<div class="mobile-menu"[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? '';
  const linksIn = (block) => [...block.matchAll(/href="#([^"]+)" data-area-link="([^"]+)"/g)].map(([, id, area]) => ({ id, area }));
  const headerLinks = linksIn(header);

  assert.equal(headerLinks.length, 9);
  assert.deepEqual(linksIn(phone), headerLinks);
  for (const { id, area } of headerLinks) {
    assert.match(html, new RegExp(`id="${id}" data-area="${area}"`), `falta el área ${area}`);
  }
  assert.doesNotMatch(html, /\[data-area\]\[hidden\]/);
  assert.match(html, /addEventListener\('scroll',update,\{passive:true\}\)/);
  assert.match(html, /link\.setAttribute\('aria-current','location'\)/);
});

test('area links live in the header, not in a side rail', async () => {
  const html = await readLanding();

  assert.match(html, /<\/a>\n  <ul class="area-nav" aria-label="Áreas de la página">/);
  assert.doesNotMatch(html, /area-rail|rail-toggle|dataseed-rail/);
});

test('chat bubble hides while the phone menu is open', async () => {
  const html = await readLanding();

  assert.match(html, /body\.menu-open #n8n-chat\{display:none;\}/);
});

test('footer belongs to the Contacto area and Inicio has no call-to-action buttons', async () => {
  const html = await readLanding();

  assert.match(html, /<footer data-area="contacto">/);
  assert.doesNotMatch(html, /class="hero-btns"/);
});

test('areas are delimited by a glowing gradient line, without background bands', async () => {
  const html = await readLanding();

  assert.match(html, /#services,#how,#testimonials,#types,#products,#prod-demo,#faq,#contacto\{padding:var\(--area-pad\) 0;border-top:0;background:transparent;\}/);
  assert.match(html, /::before\{top:0;width:min\(1160px,calc\(100% - 3rem\)\);height:2px;[^}]*linear-gradient\(90deg,transparent,var\(--divider-core\)/);
  assert.doesNotMatch(html, /--band/);
});

test('brand landscape is the page background, dimmed under the content', async () => {
  const html = await readLanding();
  const image = await readFile(new URL('../../site/assets/fondo-dataseed.webp', import.meta.url));

  assert.ok(image.length > 10_000);
  assert.match(html, /<div class="site-bg" aria-hidden="true"><\/div>/);
  assert.match(html, /url\(assets\/fondo-dataseed\.webp\)/);
  assert.match(html, /root\.style\.setProperty\('--bg-dim',/);
  assert.doesNotMatch(html, /id="bgc"|class="orb /);
});

test('narrow phone layout collapses dense grids and product actions to one column', async () => {
  const html = await readLanding();

  assert.match(html, /\.site-bg\{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var\(--bg\);\}/);
  assert.match(
    html,
    /\.hero-strip,\.srv-grid,\.types-grid,\.kpi-row,\.stats-row\{grid-template-columns:1fr;\}/,
  );
  assert.match(html, /\.prod-card-foot\{flex-direction:column;align-items:stretch;\}/);
  assert.match(
    html,
    /\.prod-card-foot \.prod-cta\{width:100%;white-space:normal;text-align:center;\}/,
  );
  assert.match(html, /\.demo-topbar\{flex-wrap:wrap;\}/);
});

test('mobile controls use readable text, semantic buttons and 44px or larger targets', async () => {
  const html = await readLanding();

  assert.match(html, /\.theme-toggle\{width:44px;height:44px;flex:0 0 44px;\}/);
  assert.match(html, /\.demo-chip\{min-height:44px;\}/);
  assert.match(html, /\.demo-send\{width:48px;height:48px;\}/);
  assert.match(html, /\.demo-chat,\.demo-input\{min-width:0;\}/);
  assert.match(
    html,
    /\.demo-input,\.contact-input,\.contact-textarea\{font-size:16px;\}/,
  );
  assert.match(
    html,
    /html\[data-platform="android"\] \.demo-input,html\[data-platform="android"\] \.contact-input,html\[data-platform="android"\] \.contact-textarea\{font-size:16px;\}/,
  );
  assert.doesNotMatch(html, /<div class="demo-chip[^\"]*" onclick=/);
  assert.equal(
    (html.match(/<button type="button" class="demo-chip/g) || []).length,
    5,
  );
});

test('large-phone landscape and desktop-mode viewports keep mobile behavior through 1024px', async () => {
  const html = await readLanding();

  assert.match(
    html,
    /@media\(max-width:1024px\)\{\n  nav\{padding-top:calc\(1rem \+ env\(safe-area-inset-top\)\);padding-right:calc\(1\.5rem \+ env\(safe-area-inset-right\)\);padding-bottom:1rem;padding-left:calc\(1\.5rem \+ env\(safe-area-inset-left\)\);\}/,
  );
  assert.match(
    html,
    /\.menu-toggle\{display:inline-flex;flex:0 0 48px;\}\n  \.theme-toggle\{width:44px;height:44px;flex:0 0 44px;\}/,
  );
  assert.match(
    html,
    /\.demo-chip\{min-height:44px;\}\n  \.demo-input,\.contact-input,\.contact-textarea\{font-size:16px;\}\n  \.demo-send\{width:48px;height:48px;\}/,
  );
  assert.match(
    html,
    /@media\(max-width:600px\)\{[\s\S]*?#hero\{padding-top:calc\(1\.5rem \+ env\(safe-area-inset-top\)\);\}/,
  );
  assert.doesNotMatch(html, /#hero\{min-height:100d?vh;/);
  assert.match(html, /window\.innerWidth>1024/);
  assert.doesNotMatch(html, /max-width:900px|min-width:901px|innerWidth>900/);
});

test('iOS and Android layout respects safe areas, dynamic viewport and reduced motion', async () => {
  const html = await readLanding();

  assert.match(
    html,
    /nav\{padding-top:calc\(\.9rem \+ env\(safe-area-inset-top\)\);padding-right:calc\(1rem \+ env\(safe-area-inset-right\)\);padding-left:calc\(1rem \+ env\(safe-area-inset-left\)\);\}/,
  );
  assert.match(html, /section\[id\]\{scroll-margin-top:calc\(6rem \+ env\(safe-area-inset-top\)\);\}/);
  assert.doesNotMatch(html, /#hero\{min-height:100d?vh;/);
  assert.match(html, /#hero \.ticker-wrap\{width:auto;margin:0 -1\.5rem 2rem;\}/);
  assert.match(html, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html, /\.ticker\{animation:none!important;transform:none!important;\}/);
});
