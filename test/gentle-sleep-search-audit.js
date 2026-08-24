const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog/gentle-sleep-training-guide.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

requireOnce('title', '<title>Gentle Sleep: A Responsive Baby Sleep Guide | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/blog/gentle-sleep-training-guide.html"/>');

for (const value of [
  'Gentle sleep is not one fixed programme.',
  'no general method can promise longer sleep',
  'A responsive four-step way to try one change',
  'Safer sleep stays separate from settling style',
  'personalised timing guidance begins around day four',
  'not medical advice or a sleep-treatment service',
  'auto_20260824_gentle_sleep_search_refresh',
]) {
  if (!page.includes(value)) throw new Error(`Missing answer, boundary or attribution: ${value}`);
}

if (/we have been there|big changes|superpower|you are safe|guarantee(?:s|d)? sleep|sleep through/i.test(page)) {
  throw new Error('An invented experience or outcome-sounding sleep claim is present');
}

console.log('Gentle-sleep search audit passed: answer-first intent, evidence, CTA and safety boundaries are present.');
