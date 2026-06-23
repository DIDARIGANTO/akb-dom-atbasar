const fs = require('fs');
const DIR = '/Users/didar/Desktop/akb-dom-atbasar';
const SRC = DIR + '/_source/index.singlepage-backup.html';
const ORIGIN = 'https://akb-dom-atbasar.kz';
let src = fs.readFileSync(SRC, 'utf8');

// ── 1. Shared CSS ───────────────────────────────
let css = src.match(/<style>([\s\S]*?)<\/style>/)[1].trim();
css += `

/* ── Breadcrumbs (multi-page) ───────────────── */
.crumbs { font-family: var(--f-mono); font-size: 12px; color: var(--ink-3); letter-spacing: .04em; padding: 26px 0 0; text-transform: uppercase; }
.crumbs a { color: var(--ink-3); }
.crumbs a:hover { color: var(--ph); }
.crumbs .sep { margin: 0 9px; color: var(--ink-dim); }
.crumbs .cur { color: var(--ph); }
.nav a[aria-current="page"] { color: var(--ph); }
`;
fs.writeFileSync(DIR + '/styles.css', css + '\n');

// ── 2. Shared JS ────────────────────────────────
let js = src.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1].trim();
// show boot screen only once per session (don't replay on every page nav)
js = js.replace(/'use strict';/, "'use strict';\n  try{ if(sessionStorage.getItem('akb_booted')){ var _b=document.getElementById('boot'); if(_b){_b.classList.add('done'); _b.style.display='none';} } else { sessionStorage.setItem('akb_booted','1'); } }catch(e){}");
fs.writeFileSync(DIR + '/app.js', js + '\n');

// ── 3. Shared chrome pieces ─────────────────────
const defs = src.match(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" style="display:none">[\s\S]*?<\/svg>/)[0];
const preHeader = src.match(/<!-- BOOT SCREEN[\s\S]*?(?=<!-- HEADER)/)[0].trim();
const lightbox = src.match(/<div class="lightbox"[\s\S]*?<\/div>\s*<\/div>/)[0];
const favicon = src.match(/<link rel="icon"[^>]*>/)[0];
const fonts = src.match(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"[\s\S]*?rel="stylesheet" \/>/)[0];
const geo = src.match(/<meta name="geo\.region"[\s\S]*?<meta name="ICBM"[^>]*>/)[0];
const bizSchema = src.match(/<script type="application\/ld\+json">\s*\{\s*"@context":"https:\/\/schema.org","@type":"AutoPartsStore"[\s\S]*?<\/script>/)[0];
const faqSchema = src.match(/<script type="application\/ld\+json">\s*\{\s*"@context":"https:\/\/schema.org","@type":"FAQPage"[\s\S]*?<\/script>/)[0];

// ── 4. Sections by key ──────────────────────────
const sections = {};
const secRe = /<section\b[^>]*>[\s\S]*?<\/section>/g;
let m;
while ((m = secRe.exec(src))) {
  const block = m[0];
  const idM = block.match(/\bid="([^"]+)"/);
  let key = idM ? idM[1] : null;
  if (!key) { const c = block.match(/class="([^"]+)"/); if (c && /shop-sec/.test(c[1])) key = 'shop-sec'; }
  if (key) sections[key] = block;
}

// ── 5. Header / footer builders ─────────────────
const NAV = [
  { href: 'uslugi.html',  n: '01', t: 'Услуги',   key: 'uslugi' },
  { href: 'katalog.html', n: '02', t: 'Каталог',  key: 'katalog' },
  { href: 'rayon.html',   n: '03', t: 'Район',    key: 'rayon' },
  { href: 'kontakty.html',n: '04', t: 'Контакты', key: 'kontakty' },
];
const header = (active) => `<header class="sysbar">
  <div class="container sysbar-row">
    <a href="index.html" class="brand" data-sound="click">
      <span class="brand-mark"><svg width="50" height="42" role="img" aria-label="АКБ Дом — аккумуляторы в Атбасаре"><use href="#logo"/></svg></span>
      <span class="brand-loc mono">/atb</span>
    </a>
    <nav class="nav">
${NAV.map(i => `      <a href="${i.href}"${active === i.key ? ' aria-current="page"' : ''} data-sound="click"><span class="nav-i">${i.n}</span><span>${i.t}</span></a>`).join('\n')}
    </nav>
    <a href="tel:+77002900503" class="sys-cta mono" data-sound="click">
      8 700 290 05 03
    </a>
  </div>
  <div class="ticker-bar mono" aria-hidden="true">
    <div class="container ticker-row">
      <span><i class="led led-on"></i> SHOP OPEN</span>
      <span class="sep">/</span>
      <span id="local-time">--:--:-- ALA</span>
      <span class="sep">/</span>
      <span class="hide-sm">100+ MODELS IN STOCK</span>
      <span class="sep hide-sm">/</span>
      <span class="hide-sm">ATBASAR · 51.82°N 68.36°E</span>
      <span class="sep hide-sm">/</span>
      <span>v.12.0 · DATE <span id="datestamp">--</span></span>
    </div>
  </div>
</header>`;

let footer = src.match(/<footer[\s\S]*?<\/footer>/)[0];
footer = footer.replace(/href="#top"/g, 'href="index.html"');
footer = footer.replace(
  /<h4 class="mono">НАВИГАЦИЯ<\/h4>[\s\S]*?(?=<\/div>)/,
  `<h4 class="mono">НАВИГАЦИЯ</h4>
        <a href="uslugi.html" data-sound="click">Услуги</a>
        <a href="katalog.html" data-sound="click">Каталог и бренды</a>
        <a href="rayon.html" data-sound="click">Доставка по району</a>
        <a href="kontakty.html" data-sound="click">Контакты</a>
      `);

// ── 6. Pages ────────────────────────────────────
const PAGES = [
  { file: 'index.html', active: '', bc: null, canon: ORIGIN + '/',
    title: 'Аккумуляторы в Атбасаре — подбор и замена за 15 мин | АКБ Дом',
    desc: 'Аккумуляторы в Атбасаре: подбор за 30 сек, замена за 15 мин. 100+ моделей — BARS, VARTA, BOSCH, ZION. Диагностика бесплатно. Железнодорожная 46. ☎ 8 700 290 05 03.',
    sections: ['top', 'why', 'diag'] },
  { file: 'uslugi.html', active: 'uslugi', bc: 'Услуги', canon: ORIGIN + '/uslugi.html',
    title: 'Услуги: подбор, замена и диагностика АКБ в Атбасаре | АКБ Дом',
    desc: 'Услуги АКБ Дом в Атбасаре: бесплатный подбор аккумулятора, замена за 15 минут, диагностика и зарядка. Легковые и грузовые. Подбор АКБ на зиму по пусковому току.',
    sections: ['services', 'cold'] },
  { file: 'katalog.html', active: 'katalog', bc: 'Каталог и бренды', canon: ORIGIN + '/katalog.html',
    title: 'Каталог аккумуляторов — VARTA, BOSCH, ZION в Атбасаре | АКБ Дом',
    desc: 'Каталог аккумуляторов в Атбасаре: 100+ моделей — VARTA, BOSCH, EXIDE, ZION, BARS, KAINAR и другие. Реальный склад, заводская гарантия, свежая дата выпуска.',
    sections: ['arsenal', 'shop-sec'] },
  { file: 'rayon.html', active: 'rayon', bc: 'Доставка по району', canon: ORIGIN + '/rayon.html',
    title: 'Аккумуляторы по Атбасарскому району — 33 села | АКБ Дом',
    desc: 'Аккумуляторы по всему Атбасарскому району: Самарка, Сергеевка, Тельмана, Макеевка, Калиновка и ещё 28 сёл. Подберём модель и придержим аккумулятор до приезда.',
    sections: ['region'] },
  { file: 'kontakty.html', active: 'kontakty', bc: 'Контакты', canon: ORIGIN + '/kontakty.html',
    title: 'Контакты — АКБ Дом, Атбасар, Железнодорожная 46 | ☎ 8 700 290 05 03',
    desc: 'Контакты АКБ Дом: Атбасар, Железнодорожная 46, ежедневно 08:00–20:00. Телефон 8 700 290 05 03, WhatsApp, Kaspi. Ответы на частые вопросы об аккумуляторах.',
    sections: ['contact', 'faq'], faq: true },
];

const report = [];
for (const p of PAGES) {
  const isSub = !!p.active;
  let counter = 0;
  const body = p.sections.map((key, i) => {
    let s = sections[key];
    if (!s) { report.push('!! MISSING SECTION: ' + key); return ''; }
    s = s.replace(/(<i class="dot phosphor"><\/i>)\d{2}/, (mm, g) => { counter++; return g + String(counter).padStart(2, '0'); });
    if (isSub && i === 0) s = s.replace(/<h2 class="(sec-h2[^"]*)">([\s\S]*?)<\/h2>/, '<h1 class="$1">$2</h1>');
    return s;
  }).join('\n\n');

  const crumbs = isSub
    ? `\n<nav class="container crumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a><span class="sep">/</span><span class="cur">${p.bc}</span></nav>\n`
    : '';
  const bcSchema = isSub
    ? `\n<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Главная","item":"${ORIGIN}/"},{"@type":"ListItem","position":2,"name":"${p.bc}","item":"${p.canon}"}]}</script>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#E5392F" />

<title>${p.title}</title>
<meta name="description" content="${p.desc}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
${geo}
<link rel="canonical" href="${p.canon}" />

<meta property="og:type" content="website" />
<meta property="og:locale" content="ru_KZ" />
<meta property="og:site_name" content="АКБ Дом" />
<meta property="og:title" content="${p.title}" />
<meta property="og:description" content="${p.desc}" />
<meta property="og:image" content="${ORIGIN}/og-cover.jpg" />
<meta property="og:url" content="${p.canon}" />

${fonts}
${favicon}
<link rel="stylesheet" href="styles.css" />

${bizSchema}${bcSchema}${p.faq ? '\n' + faqSchema : ''}
</head>
<body>

${defs}

${preHeader}

${header(p.active)}
${crumbs}
${body}

${footer}

${lightbox}

<script src="app.js" defer></script>
</body>
</html>
`;
  fs.writeFileSync(DIR + '/' + p.file, html);
  report.push(`${p.file}  ${(html.length / 1024).toFixed(1)}KB  [${p.sections.join(', ')}]  h1${isSub ? '←h2' : ''}`);
}

// ── 7. sitemap ──────────────────────────────────
const today = '2026-06-20';
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url>
    <loc>${p.canon}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.file === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(DIR + '/sitemap.xml', sm);

console.log('styles.css', (Buffer.byteLength(css) / 1024).toFixed(1) + 'KB');
console.log('app.js', (Buffer.byteLength(js) / 1024).toFixed(1) + 'KB');
console.log('sections found:', Object.keys(sections).join(', '));
console.log('---');
console.log(report.join('\n'));
console.log('sitemap: ' + PAGES.length + ' urls');
