const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'baby-feed-tracker.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

const requireAtLeast = (label, value, minimum) => {
  const count = page.split(value).length - 1;
  if (count < minimum) throw new Error(`${label}: expected at least ${minimum} occurrences, found ${count}`);
};

requireOnce('title', '<title>Feed Tracker for Breast, Bottle &amp; Mixed Feeding | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/baby-feed-tracker.html"/>');
requireOnce('H1', '<h1>A feed tracker for the last feed—and the next handover.</h1>');
requireAtLeast('iPhone CTA', 'Log the next feed on iPhone', 1);
requireAtLeast('Android CTA', 'Log the next feed on Android', 1);

for (const value of [
  'breastfeed or bottle',
  'mixed feeding and pumping',
  'A feeding record is context, not a target',
  'does not prescribe how much or how often',
  'cannot confirm that a baby is receiving enough milk',
  'responsive feeding',
]) {
  if (!page.includes(value)) throw new Error(`Missing product or safety boundary: ${value}`);
}

if (/guaranteed|increase(?:s|d)? milk|improve(?:s|d)? supply|feeding plan|medical device/i.test(page)) {
  throw new Error('An unsafe feeding or medical claim is present');
}

console.log('Feed-tracker search audit passed: intent, modes, CTA and medical boundaries are present.');
