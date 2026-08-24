const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'breastfeeding-tracker.html'), 'utf8');

const requireOnce = (label, value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
};

requireOnce('title', '<title>Nursing Tracker with Live Breastfeeding Timer | OBubba</title>');
requireOnce('canonical', '<link rel="canonical" href="https://obubba.com/breastfeeding-tracker.html"/>');

for (const value of [
  'A nursing tracker that remembers the timer, side and handover.',
  'switch sides, pause and resume, keep running when minimised',
  'Pumping stays distinct',
  'Minutes are a record, not a milk measurement',
  'cannot measure milk transfer, supply, intake',
  'Time the next breastfeed on iPhone',
  'Time the next breastfeed on Android',
  'auto_20260824_nursing_tracker_search_refresh',
]) {
  if (!page.includes(value)) throw new Error(`Missing product truth, boundary or CTA: ${value}`);
}

if (/increase(?:s|d)? (?:your )?(?:milk )?supply|ensures? enough milk|set a feeding target|guarantees? effective feeding/i.test(page)) {
  throw new Error('The page contains a milk-transfer, supply, intake or target claim');
}

console.log('Nursing-tracker search audit passed: live timer truth, pumping distinction, medical limits and CTAs are present.');
