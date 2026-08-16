#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'review-obubba.html'), 'utf8');
const failures = [];

const checks = [
  ['route is noindex', /<meta name="robots" content="noindex, follow"/.test(page)],
  ['one canonical URL', (page.match(/<link rel="canonical"/g) || []).length === 1],
  ['honest-review framing', /honest review helps another parent decide/i.test(page)],
  ['no incentive', /No reward\. No preferred rating\./i.test(page)],
  ['mixed experience explicitly welcome', /brilliant, mixed or still evolving/i.test(page)],
  ['support is rating-independent', /Support is available whatever rating or review you choose/i.test(page)],
  ['verified Apple app ID', page.includes('https://apps.apple.com/app/id6760968757?action=write-review')],
  ['verified Google package', page.includes('https://play.google.com/store/apps/details?id=com.obubba.app')],
  ['no sentiment gate language', !/love it|needs work|five[- ]star|positive review/i.test(page)],
  ['no review outcome tracking claim', /cannot see whether an individual visitor submits/i.test(page)],
];

for (const [label, passed] of checks) {
  if (!passed) failures.push(label);
}

if (failures.length) {
  console.error(`Honest review route audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Honest review route audit passed: non-incentivised, ungated and noindex.');
