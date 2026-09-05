#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/baby-led-weaning-vs-spoon-feeding.md',
  'utf8',
);

const expected = [
  'there is no right or wrong way, and some families combine both approaches',
  'appetite and fullness signals while actively supporting them to eat',
  '**Care → Weaning & First Foods → First Foods**',
  'contains **34 first-food ideas**',
  '**Track → Feed → Solids**',
  'It also cannot feel whether a piece is soft',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing weaning-methods truth marker: ${marker}`);
}

if (/parent decides \*\*what, when and where\*\*/.test(source)) {
  throw new Error('Do not attribute the separate division-of-responsibility formula to WHO');
}

console.log('Weaning-methods article truth audit passed: current product paths and source-calibrated feeding claims are present.');
