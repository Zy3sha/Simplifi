const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/does-my-baby-have-nap-schedule-yet.md',
  'utf8',
);
const engine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/nap_rhythm.dart',
  'utf8',
);
const reports = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/reports_screen.dart',
  'utf8',
);
const section = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/widgets/nap_rhythm_section.dart',
  'utf8',
);

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert(
  'the article has fixed acquisition attribution',
  article.includes('utm_content=auto_20261122_nap_rhythm'),
);
assert('the article contains no en or em dash', !/[–—]/.test(article));
assert(
  'the article uses the current NHS baby-sleep route',
  article.includes('https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/'),
);
assert(
  'the worked example distinguishes a human middle cluster from OBubba hour rounding',
  article.includes('most useful human summary') &&
    article.includes('roughly 9:00 to 10:00') &&
    engine.includes('var low = (p25 ~/ 60) * 60') &&
    engine.includes('var high = ((p75 + 59) ~/ 60) * 60'),
);
assert(
  'the current engine requires three observations and preserves extremes',
  engine.includes('int minDaysPerSlot = 3') &&
    engine.includes('earliestMin: sorted.first') &&
    engine.includes('latestMin: sorted.last'),
);
assert(
  'the article matches the 35-day observed-rhythm input and free teaching section',
  reports.includes('const rhythmWindowDays = 35;') &&
    section.includes('this section is FREE and stays free'),
);
assert(
  'the article does not call a marketing composite a real Flutter screen',
  !article.includes("OBubba's real Flutter sleep screen") &&
    !article.includes('/obubba-sleep-rhythm-app.jpg'),
);
assert(
  'the article preserves cue-first and non-diagnostic boundaries',
  article.includes('Follow the baby, not the card') &&
    article.includes('Neither surface diagnoses a sleep problem'),
);
assert(
  'the article assets are versioned in the deployable site root',
  fs.existsSync('obubba-baby-nap-rhythm-schedule-20261122.jpg') &&
    fs.existsSync('obubba-reports-range-selector-app-20261122.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Nap-rhythm article truth audit passed.');
