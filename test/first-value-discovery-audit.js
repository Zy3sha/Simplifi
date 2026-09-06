#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replaceAll('&amp;', '&');
const guide = fs.readFileSync(path.join(root, 'blog', 'what-to-track-newborn-without-overtracking.html'), 'utf8');
const failures = [];

const requiredHomepage = [
  'Already downloaded?',
  'Do not catch up or fill in a perfect day.',
  'Choose the next useful log.',
  '/blog/what-to-track-newborn-without-overtracking.html?utm_source=homepage&utm_medium=owned_navigation&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_home_first_value_guide',
  'class="js-first-value-guide"',
  'data-content-id="auto_20260906_home_first_value_guide"',
  'window.gtag("event", "first_value_guide_click"',
  'event_category: "activation"',
];

for (const marker of requiredHomepage) {
  if (!homepage.includes(marker)) failures.push(`homepage missing: ${marker}`);
}

for (const marker of ['obubba://?action=log_feed', 'obubba://?action=log_sleep', 'obubba://?action=log_nappy', 'No baby or care details are placed in the link.']) {
  if (!guide.includes(marker)) failures.push(`first-value guide missing: ${marker}`);
}

const eventBlock = homepage.slice(homepage.indexOf('var firstValueGuides'), homepage.indexOf('})();', homepage.indexOf('var firstValueGuides')));
if (/(baby|child|family|email|token|code|feed_time|sleep_time|nappy_time)\s*:/i.test(eventBlock)) {
  failures.push('first-value event contains a sensitive or care-detail field');
}

if (failures.length) {
  console.error(`First-value discovery audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('First-value discovery audit passed: homepage activation route, fixed measurement and safe log actions are present.');
