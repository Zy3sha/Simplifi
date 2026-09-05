#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/baby-separation-anxiety-sleep-clingy.md',
  'utf8',
);

const expected = [
  'common from around 6 months to 3 years',
  'Open **Grow**, tap the **development wave** card, then choose **Why right now?**',
  'The current Flutter screen is called **Behaviour Explained**',
  'a recent teething signal suppresses the separation interpretation',
  'an age window alone is not enough',
  '“one possible thread” and “never a diagnosis”',
  'utm_source=separation_anxiety_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260911_separation_anxiety',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing separation-anxiety truth marker: ${marker}`);
}

if (/diagnose separation anxiety/.test(source) === false) {
  throw new Error('The article must preserve the boundary that OBubba cannot diagnose separation anxiety');
}

console.log('Separation-anxiety article truth audit passed: current product route, evidence gates, clinical boundary and acquisition attribution are present.');
