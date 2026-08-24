const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog', 'personalized-baby-routine-5-minutes.html'), 'utf8');

const checks = [
  ['title', '<title>Personalized Baby Nap Schedule for Your Routine | OBubba</title>'],
  ['canonical', '<link rel="canonical" href="https://obubba.com/blog/personalized-baby-routine-5-minutes.html"/>'],
  ['answer-first opening', 'To design a personalized baby nap schedule, start with one anchor'],
  ['flexible cue boundary', 'use age-appropriate wake windows only as flexible planning cues'],
  ['safer-sleep boundary', 'Follow your baby&#39;s tired cues and current safer-sleep guidance rather than forcing exact clock times.'],
];

for (const [label, value] of checks) {
  if (!page.includes(value)) throw new Error(`${label} is missing`);
}

if (/guarantee|fix(?:es|ed)? sleep|sleep through/i.test(page)) {
  throw new Error('An unsafe sleep-outcome phrase is present');
}

console.log('Personalized nap-schedule search audit passed: intent-aligned title, answer-first opening and safety boundaries are present.');
