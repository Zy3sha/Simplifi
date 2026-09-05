#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/switch-baby-tracker-apps-without-losing-history.md',
  'utf8',
);

const expected = [
  'Account → Import data',
  'The import creates a new baby profile.',
  'OBubba CSV | Full round-trip mapping',
  'Huckleberry CSV | Dedicated mapping',
  'Header-driven best effort',
  'groups consecutive overnight sessions into one bedtime-to-morning sleep arc',
  'keeps the most recent days that fit while dropping the oldest days first',
  'utm_source=switch_tracker_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260913_switch_tracker',
];

for (const marker of expected) {
  if (!source.includes(marker)) {
    throw new Error(`Missing switch-tracker truth marker: ${marker}`);
  }
}

if (/silently merge/i.test(source) && !/does not silently merge/i.test(source)) {
  throw new Error('The article must not imply that imported history merges into an existing baby');
}

console.log('Switch-tracker article truth audit passed: current route, new-profile boundary, mapping levels, overnight transformation, large-history limit and acquisition attribution are present.');
