#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/baby-tracker-widgets-lock-screen-siri.md',
  'utf8',
);

const expected = [
  'Starts a timestamped nap timer without opening the app',
  'Starts a timestamped bedtime timer without opening the app',
  'Queues a timestamped stop without opening the app',
  'The feed shortcut opens the relevant OBubba action',
  'The queue is bounded rather than allowed to grow forever',
  'does not expose premium-only prediction data',
  'https://support.apple.com/en-us/118610',
  'https://support.apple.com/guide/iphone/iph28f50d10d/ios',
  'utm_source=widgets_siri_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260914_widgets_siri',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing widgets/Siri truth marker: ${marker}`);
}

if (source.includes('“Siri, start a sleep timer in OBubba.” | Opens OBubba')) {
  throw new Error('Stale Siri bedtime behavior remains: the current App Intent starts it without opening OBubba');
}

console.log('Widgets/Siri article truth audit passed: current zero-screen timer actions, app-opening detail actions, bounded queue, Premium prediction boundary, official sources and acquisition attribution are present.');
