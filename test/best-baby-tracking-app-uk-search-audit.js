const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog', 'best-baby-tracker-app-uk.html'), 'utf8');

const required = [
  '<title>Best Baby Tracker App UK: 7 Things to Compare | OBubba</title>',
  '<link rel="canonical" href="https://obubba.com/blog/best-baby-tracker-app-uk.html"/>',
  'Best baby tracking app UK: the short answer',
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
