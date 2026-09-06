const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/baby-tolerated-egg-peanut-how-often-offer-again.md',
  'utf8',
);
const weaningScreen = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart',
  'utf8',
);
const confidenceEngine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_allergen_pacing.dart',
  'utf8',
);
const brain = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/brain.dart',
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
  article.includes('utm_content=auto_20261114_repeat_allergens'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the article does not link to the safety-paused OBubba reaction guide',
  !article.includes('/blog/baby-food-allergy-reaction-what-to-do-log.html'),
);
assert(
  'the allergen detail distinguishes introduced and reaction states',
  weaningScreen.includes("'Reaction logged'") &&
    weaningScreen.includes("'Introduced'"),
);
assert(
  'a recorded reaction pauses re-offer advice',
  weaningScreen.includes('Pause it and check with your') &&
    weaningScreen.includes('do not keep offering it in the meantime'),
);
assert(
  'the confidence card requires at least three tolerant meals and limits repeated unsure meals',
  confidenceEngine.includes('(tolerant[a] ?? 0) >= 3') &&
    confidenceEngine.includes('(unsure[a] ?? 0) < 2'),
);
assert(
  'lifetime reactions are passed into the confidence engine',
  brain.includes('priorReacted: child.allergensEverReacted.map(canonAllergen).toSet()'),
);
assert(
  'the two article assets are versioned',
  fs.existsSync('obubba-repeat-tolerated-allergens-egg-peanut.jpg') &&
    fs.existsSync('obubba-allergen-journey-app.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Repeat-allergen article truth audit passed.');
