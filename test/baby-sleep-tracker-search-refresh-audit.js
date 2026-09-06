#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'baby-sleep-tracker.html'), 'utf8');
const failures = [];

for (const required of [
  '<title>Baby Sleep Tracker for Naps &amp; Night Wakes | OBubba</title>',
  'Useful memory, not another rule book',
  'What should a baby sleep tracker actually help with?',
  'Personal guidance begins around day four.',
  'The sleep picture gets clearer around twelve complete nights.',
  'Use less when less feels better',
  'A sleep picture is context, not a command',
  'Tracking is optional.',
  'Partner Sync',
  'Bubba Care',
  'Track the next sleep on iPhone',
  'Track the next sleep on Android',
  'auto_20260906_baby_sleep_tracker_search_refresh',
]) {
  if (!page.includes(required)) failures.push(`missing sleep-page requirement: ${required}`);
}

for (const prohibited of [
  /fix(?:es|ed)? (?:your )?baby(?:'s)? sleep/i,
  /prevent(?:s|ed)? night wakes/i,
  /diagnoses? (?:your )?baby/i,
  /must sleep/i,
  /should be asleep/i,
]) {
  if (prohibited.test(page)) failures.push(`prohibited sleep-page claim: ${prohibited}`);
}

for (const source of [
  'https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/',
  'https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/',
  'https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/safer-sleep-overview/',
]) {
  if (!page.includes(source)) failures.push(`missing current safety source: ${source}`);
}

const screenshots = (page.match(/class="shot"/g) || []).length;
if (screenshots !== 2) failures.push(`expected 2 product screenshots, found ${screenshots}`);

const relatedLinks = (page.match(/<a class="tag" href="\/(?:baby-wake-window-tracker|baby-daily-log-app|partner-baby-tracker-app|baby-care-handover-app|newborn-tracker)\.html">/g) || []).length;
if (relatedLinks !== 5) failures.push(`expected 5 tailored related links, found ${relatedLinks}`);

if (failures.length) {
  throw new Error(`Baby sleep tracker search refresh audit failed:\n${failures.join('\n')}`);
}

console.log(`Baby sleep tracker search refresh audit passed (${screenshots} screenshots, ${relatedLinks} related links).`);
