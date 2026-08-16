const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const APP_ID = '6760968757';
const EXPECTED_META = `<meta name="apple-itunes-app" content="app-id=${APP_ID}"/>`;

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${label}`);
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(https:\/\/obubba\.com(?:\/[^<]*)?)<\/loc>/g)]
  .map((match) => new URL(match[1]))
  .filter((url) => url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('/'))
  .filter((url) => !['/privacy.html', '/terms.html'].includes(url.pathname));

assert('sitemap exposes at least one canonical HTML page', urls.length > 0);

for (const url of urls) {
  const relativePath = url.pathname === '/'
    ? 'index.html'
    : url.pathname.endsWith('/')
      ? path.join(url.pathname.slice(1), 'index.html')
      : url.pathname.slice(1);
  const absolutePath = path.join(ROOT, relativePath);
  assert(`${url.pathname} exists`, fs.existsSync(absolutePath));
  if (!fs.existsSync(absolutePath)) continue;
  const html = fs.readFileSync(absolutePath, 'utf8');
  const banners = html.match(/<meta name="apple-itunes-app"[^>]*>/g) || [];
  assert(`${url.pathname} has exactly one Smart App Banner`, banners.length === 1);
  assert(`${url.pathname} uses the verified Apple app ID only`, banners[0] === EXPECTED_META);
  assert(`${url.pathname} does not put family or care data in an app argument`, !/apple-itunes-app[^>]*app-argument/i.test(html));
}

const generator = fs.readFileSync(path.join(ROOT, 'tools/render-seo.mjs'), 'utf8');
assert('shared generator preserves the verified Smart App Banner', generator.includes(EXPECTED_META));

for (const legalPath of ['privacy.html', 'terms.html']) {
  const legalHtml = fs.readFileSync(path.join(ROOT, legalPath), 'utf8');
  assert(`${legalPath} remains free of acquisition banners`, !legalHtml.includes('apple-itunes-app'));
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Smart App Banner audit passed across ${urls.length} canonical HTML pages.`);
