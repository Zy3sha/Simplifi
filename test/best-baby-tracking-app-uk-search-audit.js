const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog', 'best-baby-tracker-app-uk.html'), 'utf8');

const required = [
  '<title>Best Baby Tracker Apps UK 2026: 5 Options Compared | OBubba</title>',
  '<link rel="canonical" href="https://obubba.com/blog/best-baby-tracker-app-uk.html"/>',
  'Best baby tracking apps UK: the short answer',
  'Five baby tracker apps to compare in the UK',
  'This comparison is published by OBubba, so it is not an independent ranking.',
  '<h3>1. OBubba</h3>',
  '<h3>2. Huckleberry</h3>',
  '<h3>3. Nara Baby</h3>',
  '<h3>4. Baby Tracker by Nighp</h3>',
  '<h3>5. Onoco</h3>',
  'https://apps.apple.com/gb/app/huckleberry-baby-tracker/id1169136078',
  'https://apps.apple.com/gb/app/nara-baby-pregnancy-tracker/id1444639029',
  'https://apps.apple.com/gb/app/baby-tracker-newborn-log/id779656557',
  'https://apps.apple.com/gb/app/onoco-baby-tracker-schedule/id1529620090',
  'The comparison does not score medical quality, safety or outcomes.',
  'A 60-second comparison checklist',
  '<li><strong>Everyday logging:</strong>',
  '<li><strong>Two-parent use:</strong>',
  '<li><strong>Privacy:</strong>',
  'A simpler single-purpose timer may suit you better',
  'personalised timing guidance begins around day four',
  'deeper Gemini answers are optional and consented',
  'The whole OBubba app is unlocked during pregnancy and through corrected age week 8',
  'When OBubba may not be the right fit',
  '/start/?utm_source=owned_search&amp;utm_medium=seo&amp;utm_campaign=from_bump_to_baby_auto&amp;utm_content=auto_20260824_best_baby_tracking_app_uk_refresh',
];

for (const value of required) {
  if (!page.includes(value)) throw new Error(`Missing required comparison evidence: ${value}`);
}

if (/best-rated|number one|#1|NHS[- ]approved|guaranteed|fix(?:es|ed)? sleep/i.test(page)) {
  throw new Error('An unverifiable ranking, approval or outcome claim is present');
}

console.log('Best baby tracking app UK search audit passed: decision checklist, limitations, product truth and attribution are present.');
