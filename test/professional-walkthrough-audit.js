#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'for-professionals.html');
const failures = [];

if (!fs.existsSync(PAGE)) {
  failures.push('for-professionals.html is missing');
} else {
  const html = fs.readFileSync(PAGE, 'utf8');
  const checks = [
    ['one canonical', (html.match(/<link rel="canonical"/g) || []).length === 1],
    ['walkthrough email CTA', html.includes('mailto:hello@obubba.com?subject=OBubba%20professional%20walkthrough')],
    ['press brief link', html.includes('/press/obubba-press-podcast-brief.pdf')],
    ['no endorsement expectation', /no endorsement expected/i.test(html)],
    ['no identifiable family data boundary', /no identifiable (baby or family|family) data/i.test(html)],
    ['non-clinical boundary', /not a clinical record/i.test(html)],
  ];
  for (const [label, passed] of checks) {
    if (!passed) failures.push(label);
  }
}

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!home.includes('href="/for-professionals.html"')) {
  failures.push('homepage discovery link is missing');
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<loc>https://obubba.com/for-professionals.html</loc>')) {
  failures.push('sitemap entry is missing');
}

if (failures.length) {
  console.error(`Professional walkthrough audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Professional walkthrough audit passed: discoverable, reviewable and privacy-bounded.');
