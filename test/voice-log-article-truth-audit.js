#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/hands-free-baby-tracking-voice-log.md',
  'utf8',
);

const expected = [
  'Open **Track**, find **Log details**, then tap **Quick log**',
  '**OBUBBA HEARD**',
  'Nothing is saved merely because speech appeared on screen.',
  '“Gave medicine [exact medicine name], [measured amount], at 11:10am.”',
  'Quick Log does not silently start a timer',
  'only part of the group logged',
  'utm_source=voice_log_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260912_voice_log',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing voice-log truth marker: ${marker}`);
}

if (/“Gave \[exact medicine name\]/.test(source)) {
  throw new Error('The generic medicine example must include the parser trigger word “medicine”');
}

console.log('Voice-log article truth audit passed: current route, confirmation boundary, supported medicine template, failure behavior and acquisition attribution are present.');
