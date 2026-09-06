import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MEASUREMENT_ID, cookielessAnalytics} from './analytics-snippet.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/obubba\.com([^<]*)<\/loc>/g)].map((match) => match[1]);
const files = urls
  .filter((urlPath) => urlPath === '/' || urlPath.endsWith('.html'))
  .map((urlPath) => path.join(root, urlPath === '/' ? 'index.html' : urlPath.slice(1)));

const oldHomepageSnippet = `  <script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "${MEASUREMENT_ID}");
  </script>`;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes("gtag('consent', 'default'")) continue;
  if (html.includes(oldHomepageSnippet)) {
    html = html.replace(oldHomepageSnippet, `  ${cookielessAnalytics({trackStoreLinks: false})}`);
  } else {
    const marker = html.includes('<style>') ? '<style>' : '</head>';
    const replacement = marker === '<style>'
      ? `  ${cookielessAnalytics()}\n  <style>`
      : `  ${cookielessAnalytics()}\n</head>`;
    if (!html.includes(marker)) throw new Error(`${path.relative(root, file)} has no safe head insertion point`);
    html = html.replace(marker, replacement);
  }
  fs.writeFileSync(file, html);
}

console.log(`Injected cookieless analytics into ${files.length} sitemap HTML pages.`);
