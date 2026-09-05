#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const press = fs.readFileSync(path.join(root, 'press.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');

const checks = [
  ['canonical press URL', press.includes('<link rel="canonical" href="https://obubba.com/press.html"/>')],
  ['single h1', (press.match(/<h1\b/g) || []).length === 1],
  ['founder identity', press.includes('Zyesha Reynolds')],
  ['non-medical boundary', press.includes('not a diagnostic or medical tool')],
  ['no endorsement boundary', press.includes('do not imply a partnership, clinical endorsement or outcome guarantee')],
  ['Apple listing', press.includes('id6760968757')],
  ['Google Play package', press.includes('id=com.obubba.app')],
  ['campaign attribution', press.includes('utm_campaign%3Dfrom_bump_to_baby_auto')],
  ['press contact', press.includes('hello@obubba.com')],
  ['downloadable icon', press.includes('obubba-baby-tracker-app-icon-crowned-baby.png" download')],
  ['downloadable feeding screen', press.includes('obubba-screen-feeding.jpg" download')],
  ['downloadable care screen', press.includes('obubba-screen-care.jpg" download')],
  ['downloadable grow screen', press.includes('obubba-screen-grow.jpg" download')],
  ['homepage discovery link', home.includes('<a href="/press.html">Press &amp; media</a>')],
  ['sitemap discovery', sitemap.includes('<loc>https://obubba.com/press.html</loc>')],
  ['AI-readable discovery', llms.includes('[press and media resources](https://obubba.com/press.html)')],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  failures.forEach(([label]) => console.error(`FAIL: ${label}`));
  process.exit(1);
}

checks.forEach(([label]) => console.log(`PASS: ${label}`));
