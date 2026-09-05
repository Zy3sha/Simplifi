#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/is-my-pump-output-normal.md',
  'utf8',
);

const expected = [
  'One pumping session is not a breast-milk supply test.',
  '**Track → Log details → More logs → Pump**',
  'pump volume is **expressed output**, not baby intake',
  'a pump session does not inflate bottle totals',
  'utm_source=pump_output_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260909_pump_output',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing pump-output truth marker: ${marker}`);
}

if (/cannot assess flange fit/.test(source) === false) {
  throw new Error('The article must preserve the boundary that OBubba cannot assess pump fit');
}

console.log('Pump-output article truth audit passed: current product route, intake boundary and fixed acquisition attribution are present.');
