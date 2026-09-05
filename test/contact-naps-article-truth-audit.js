#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/do-contact-naps-ruin-night-sleep.md',
  'utf8',
);

const expected = [
  'a contact nap does not automatically ruin night sleep',
  'awake, sober and able to keep watching',
  'Never fall asleep with a baby on a sofa or armchair',
  'use a firm, flat mattress',
  'use the same room as you for at least the first six months',
  'record **Contact → Cot** as one nap',
  'use **Pause nap** rather than ending and restarting it',
  'at least three completed naps in each location',
  'at least eight located naps',
  'Pattern guidance such as the contact-nap insight is a Premium feature',
  'through the first two corrected-age months',
  'utm_source=contact_naps_article',
  'utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260916_contact_naps',
  'https://www.nhs.uk/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/',
  'https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/room-sharing/',
];

for (const marker of expected) {
  if (!source.includes(marker)) {
    throw new Error(`Missing contact-naps truth marker: ${marker}`);
  }
}

const forbidden = [
  'guarantee better sleep',
  'safe contact nap',
  'Premium is free forever',
];

for (const marker of forbidden) {
  if (source.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Unsafe or inaccurate contact-naps claim remains: ${marker}`);
  }
}

console.log('Contact-naps article truth audit passed: safer-sleep boundaries, current nap-location and pause behavior, evidence thresholds, Premium boundary and acquisition attribution are present.');
