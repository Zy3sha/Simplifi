const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'baby-wake-window-tracker.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

const requireAtLeast = (label, value, minimum) => {
  const count = page.split(value).length - 1;
  if (count < minimum) throw new Error(`${label}: expected at least ${minimum} occurrences, found ${count}`);
};

requireOnce('title', '<title>Wake Window App for Baby Naps | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/baby-wake-window-tracker.html"/>');
requireOnce('H1', '<h1>A wake window app built from your baby’s actual naps.</h1>');
requireAtLeast('iPhone CTA', 'Track the next nap on iPhone', 1);
requireAtLeast('Android CTA', 'Track the next nap on Android', 1);

for (const value of [
  'personalised timing guidance begins around day four',
  'the picture gets clearer across the first fortnight',
  'Suggested times remain flexible guides',
  'Wake windows are planning context, not a sleep promise',
  'current safer-sleep guidance',
]) {
  if (!page.includes(value)) throw new Error(`Missing claim boundary: ${value}`);
}

if (/guaranteed|sleep through|fix(?:es|ed)? sleep|medical device/i.test(page)) {
  throw new Error('An unsafe sleep or medical claim is present');
}

console.log('Wake-window app search audit passed: intent, learning timeline, CTA and safety boundaries are present.');
