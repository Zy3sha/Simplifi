#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const pagePath = path.join(ROOT, 'import-baby-tracker-data.html');
const failures = [];

if (!fs.existsSync(pagePath)) {
  failures.push('import-baby-tracker-data.html is missing');
} else {
  const html = fs.readFileSync(pagePath, 'utf8');
  const checks = [
    ['one canonical URL', (html.match(/<link rel="canonical"/g) || []).length === 1],
    ['dedicated Huckleberry mapping is qualified', /dedicated parser for Huckleberry-shaped CSV/i.test(html)],
    ['other formats are best effort', /best-effort header-driven parser/i.test(html)],
    ['preview exposes skipped rows', /entries ready and rows skipped/i.test(html)],
    ['website rejects family-data uploads', /do not upload or email the CSV to this website/i.test(html)],
    ['original export retention warning', /Keep the original CSV/i.test(html)],
    ['large-history partial import warning', /Very large histories may retain the most recent days/i.test(html)],
    ['non-clinical boundary', /not a clinical record/i.test(html)],
    ['Baby Connect official evidence', html.includes('https://en.babyconnect.com/reports')],
    ['Glow official evidence', html.includes('https://glowing.com/glow-safety')],
  ];
  for (const [label, passed] of checks) {
    if (!passed) failures.push(label);
  }
}

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!home.includes('href="/import-baby-tracker-data.html"')) {
  failures.push('homepage discovery link is missing');
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<loc>https://obubba.com/import-baby-tracker-data.html</loc>')) {
  failures.push('sitemap entry is missing');
}

if (failures.length) {
  console.error(`Import migration page audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Import migration page audit passed: preview-first, reversible and privacy-bounded.');
