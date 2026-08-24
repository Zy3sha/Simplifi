const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'baby-routine-app-uk.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

const requireAtLeast = (label, value, minimum) => {
  const count = page.split(value).length - 1;
  if (count < minimum) throw new Error(`${label}: expected at least ${minimum} occurrences, found ${count}`);
};

requireOnce('title', '<title>Baby Routine App for Feeds, Naps &amp; Handovers | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/baby-routine-app-uk.html"/>');
requireOnce('H1', '<h1>A baby routine app built around the day you actually had.</h1>');
requireAtLeast('iPhone CTA', 'Start a flexible routine on iPhone', 1);
requireAtLeast('Android CTA', 'Start a flexible routine on Android', 1);

for (const value of [
  'personalised timing guidance around day four',
  'the picture gets clearer across the first fortnight',
  'does not provide rigid feeding schedules',
  'Routine guidance is context, not a prescription',
  'current safer-sleep guidance',
  'Pause tracking when it adds pressure',
]) {
  if (!page.includes(value)) throw new Error(`Missing product or safety boundary: ${value}`);
}

if (/guaranteed|perfect schedule|sleep through|feeding plan|medical device/i.test(page)) {
  throw new Error('An unsafe routine, feeding or sleep claim is present');
}

console.log('Baby-routine app search audit passed: intent, learning timeline, sharing, CTA and safety boundaries are present.');
