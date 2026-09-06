const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/when-to-pack-hospital-bag-checklist-uk.md',
  'utf8',
);
const prep = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/pregnancy_prep.dart',
  'utf8',
);
const home = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/pregnancy/pregnancy_home.dart',
  'utf8',
);
const guideScreen = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/pregnancy/pregnancy_guide_screen.dart',
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
  article.includes('utm_content=auto_20261120_hospital_bag'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the NHS timing is presented as guidance rather than a guarantee',
  article.includes('may be a good idea to have your hospital bag packed at least three weeks') &&
    article.includes('the date is a planning point rather than an appointment'),
);
assert(
  'the current one-in-twenty due-date context is retained',
  article.includes('Only about one baby in 20 arrives on the estimated due date'),
);
assert(
  'the article defers unit-specific supplies and individual plans',
  article.includes("Check your hospital or birth centre's own list") &&
    article.includes('your maternity unit is the authority'),
);
assert(
  'the car-seat section carries current legal and safer-sleep boundaries',
  article.includes('rear-facing until the child is over 15 months') &&
    article.includes('taking a sleeping baby out of the car seat as soon as you reach your destination'),
);
assert(
  'the app ships the hospital-bag guide and preparation checklist item',
  prep.includes("id: 'hospital_bag'") &&
    prep.includes("title: 'The hospital bag'") &&
    home.includes("('bag', '🎒', 'Hospital bag packed')"),
);
assert(
  'the app renders preparation as a swipeable deck with progress and completion controls',
  guideScreen.includes('child: PageView(') &&
    guideScreen.includes('// Progress dots.') &&
    guideScreen.includes("last ? 'Done 🤍' : 'Next'"),
);
assert(
  'the article does not promote the known-conflict contraction tool',
  !article.includes('contraction timer') &&
    !article.includes('kick counting, contractions'),
);
assert(
  'the article assets are versioned in the deployable site root',
  fs.existsSync('obubba-hospital-bag-checklist-uk-20261120.jpg') &&
    fs.existsSync('obubba-claim-bump-app-20261120.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Hospital-bag article truth audit passed.');
