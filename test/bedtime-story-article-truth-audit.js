#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/how-to-read-bedtime-stories-to-a-baby.md',
  'utf8',
);

const expected = [
  '**Care → Bedtime Stories**',
  '**Choose a bedtime story**',
  '**Track → More logs → Bedtime Story** tile records a story-time moment',
  'The library contains **12 original, curated stories**',
  'Neither can observe your baby or guarantee sleep.',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing bedtime-story truth marker: ${marker}`);
}

if (/open \*\*Track → Story\*\*/.test(source)) {
  throw new Error('The Track story-time log must not be described as a library route');
}

console.log('Bedtime-story article truth audit passed: current library and logging routes remain distinct.');
