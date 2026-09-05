#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = '/blog/baby-classes-near-me-real-life-guide.html';
const pages = [
  {
    name: 'play guide',
    source: 'content/blog/five-minute-baby-play-ideas-by-age.md',
    html: 'blog/five-minute-baby-play-ideas-by-age.html',
    content: 'auto_20260905_baby_classes_cluster_play',
  },
  {
    name: 'tummy-time guide',
    source: 'content/blog/how-much-tummy-time-does-a-baby-need.md',
    html: 'blog/how-much-tummy-time-does-a-baby-need.html',
    content: 'auto_20260905_baby_classes_cluster_tummy',
  },
];

const failures = [];
for (const page of pages) {
  const source = fs.readFileSync(path.join(root, page.source), 'utf8');
  const html = fs.readFileSync(path.join(root, page.html), 'utf8');
  for (const [label, passed] of [
    ['source target', source.includes(target)],
    ['generated target', html.includes(target)],
    ['source content ID', source.includes(page.content)],
    ['generated content ID', html.includes(page.content)],
    ['campaign label', html.includes('utm_campaign=from_bump_to_baby_auto')],
    ['internal-link medium', html.includes('utm_medium=internal_link')],
  ]) {
    if (!passed) failures.push(`${page.name}: ${label}`);
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

pages.forEach((page) => console.log(`PASS: ${page.name} links to baby-classes guide with ${page.content}`));
