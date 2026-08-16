#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'best-baby-tracker.html'), 'utf8');
const failures = [];

for (const required of [
  '<title>Baby Tracker App Guide: What to Look For | OBubba</title>',
  'Choose a baby tracker for the next real job, not the longest feature list.',
  'A 30-second shortlist',
  'Partners and carers need different access',
  'around day four',
  'around twelve complete nights',
  'When OBubba is not the right tool.',
  'Sharing remains parent-controlled.',
]) {
  if (!page.includes(required)) failures.push(`missing required guide boundary: ${required}`);
}

for (const prohibited of [
  /best baby tracker for every family/i,
  /fix(?:es)? (?:your )?baby(?:'s)? sleep/i,
  /guaranteed/i,
  /diagnoses/i,
]) {
  if (prohibited.test(page)) failures.push(`prohibited guide claim: ${prohibited}`);
}

const appStoreCtas = (page.match(/href="https:\/\/apps\.apple\.com\/app\/obubba-baby-sleep-tracker\/id6760968757"/g) || []).length;
const playStoreCtas = (page.match(/href="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.obubba\.app&(?:amp;)?referrer=/g) || []).length;
if (appStoreCtas < 2) failures.push(`expected at least 2 App Store CTAs, found ${appStoreCtas}`);
if (playStoreCtas < 2) failures.push(`expected at least 2 attributed Play Store CTAs, found ${playStoreCtas}`);

if (failures.length) {
  throw new Error(`Baby tracker guide audit failed:\n${failures.join('\n')}`);
}

console.log(`Baby tracker guide audit passed (${appStoreCtas} App Store CTAs, ${playStoreCtas} attributed Play Store CTAs).`);
