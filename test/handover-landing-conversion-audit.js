#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'baby-care-handover-app.html'), 'utf8').replaceAll('&amp;', '&');
const failures = [];

const required = [
  'Try the free handover template',
  '/blog/baby-care-handover-template-grandparents-nursery.html?utm_source=owned_search&utm_medium=seo&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_handover_landing_builder#five-line-handover',
  'utm_content%3Dauto_20260906_handover_landing_download',
  'data-growth-action="handover_builder_open"',
  'Download for iPhone',
  'Get it on Android',
  "gtag('event', action",
  'Nothing typed into the builder is collected or saved by the page.',
  'the trusted carer opens the handover in a browser',
  '/obubba-screen-care.jpg',
];

for (const marker of required) {
  if (!html.includes(marker)) failures.push(`missing conversion marker: ${marker}`);
}

for (const forbidden of ['family_id=', 'baby_id=', 'care_token=', 'sync_code=']) {
  if (html.toLowerCase().includes(forbidden)) failures.push(`sensitive field leaked into landing URL: ${forbidden}`);
}

if (failures.length) {
  console.error(`Handover landing conversion audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Handover landing conversion audit passed: useful-first CTAs, privacy boundary and measurement hooks are present.');
