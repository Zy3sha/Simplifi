#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/baby-refusing-solids-no-pressure-plan.md',
  'utf8',
);

const expected = [
  'around six months',
  'three readiness signs together',
  'do not force rejected food',
  'Continue breast milk or first infant formula as your baby\'s usual milk during the first year',
  'three consecutive refused meals logged within about seven days',
  'latest no more than four days ago',
  'Track → Feed → Solids',
  '**Loved it**, **Unsure** or **Reaction**',
  'Solids logging, the food journal, allergen journey and progress summary remain available without Premium',
  'full recipe collection and deeper personalised pattern guidance are Premium features',
  'through the first two corrected-age months',
  'utm_source=refusing_solids_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260918_refusing_solids',
  'https://www.nhs.uk/baby/weaning-and-feeding/fussy-eaters/',
  'https://www.nhs.uk/best-start-in-life/baby/weaning/',
  'https://www.nhs.uk/symptoms/swallowing-problems-dysphagia/',
];

for (const marker of expected) {
  if (!source.includes(marker)) {
    throw new Error(`Missing refusing-solids truth marker: ${marker}`);
  }
}

const forbidden = [
  'force one more bite',
  'withhold milk to make baby hungry',
  'every refusal is an allergy',
];

for (const marker of forbidden) {
  if (source.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Unsafe refusing-solids claim remains: ${marker}`);
  }
}

console.log('Refusing-solids article truth audit passed: current NHS boundaries, product route, refusal-pattern thresholds, entitlement boundary and acquisition attribution are present.');
