#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/is-obubba-free-what-premium-includes.md',
  'utf8',
);

const expected = [
  '**OBubba is free to download, and core tracking stays free.**',
  'baby’s corrected age is below nine weeks',
  'one-time **14-day Premium trial**',
  'Add as Free',
  'deeper Premium guidance stays off unless that baby has valid Premium access',
  'https://apps.apple.com/app/id6760968757',
  'utm_source%3Downed_search',
  'utm_medium%3Dseo',
  'utm_campaign%3Dfrom_bump_to_baby_auto',
  'utm_content%3Dis_obubba_free',
  'utm_source=obubba_free_article',
  'utm_medium=owned_search',
  'utm_content=auto_20270512_obubba_free',
  'must be checked again before publication',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing Premium-article truth marker: ${marker}`);
}

const forbidden = [
  'adding a second or later profile requires Premium',
  'Adding a second or later child profile is one of the current Premium gates',
  'https://apps.apple.com/gb/',
  '45 focused Flutter tests passed on 12 May 2027',
];

for (const marker of forbidden) {
  if (source.includes(marker)) throw new Error(`Stale or unverified Premium claim remains: ${marker}`);
}

console.log('OBubba-free article truth audit passed: current early-free and trial boundaries, per-baby Free path, global store links, attribution and pre-publication recheck gate are present.');
