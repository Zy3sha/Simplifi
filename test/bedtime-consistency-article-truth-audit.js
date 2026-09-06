const fs = require('node:fs');

const article = fs.readFileSync('content/blog/does-baby-need-same-bedtime-every-night.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const consistency = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/consistency.dart',
  'utf8',
);
const impact = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/bedtime_consistency_impact.dart',
  'utf8',
);
const predictor = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/predict_bedtime.dart',
  'utf8',
);
const care = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart',
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
  'the bedtime predictor remains silent under four weeks',
  predictor.includes('if (ageWeeks < 4) return null;'),
);
assert(
  'the reports score uses circular clock spread for bedtime and morning wake',
  consistency.includes('shortest arc') &&
    consistency.includes('bedtimeMad') &&
    consistency.includes('wakeMad'),
);
assert(
  'the reports route is currently free',
  care.includes("if (title == 'Reports')") &&
    care.includes('const ReportsScreen()') &&
    care.includes('// free (Capacitor parity)'),
);
assert(
  'the impact insight requires nine nights, a real timing contrast and one fewer wake',
  impact.includes('if (withBed.length < 9) return null;') &&
    impact.includes('if (devGap < 30) return null;') &&
    impact.includes('if (delta < 1.0) return null;'),
);
assert(
  'the article keeps the association non-causal and does not promise fewer wakes',
  article.includes('A relationship between bedtime and wakes is a clue, not proof that one caused the other.') &&
    article.includes('not a controlled experiment or a promise of fewer wakes'),
);
assert(
  'the article protects newborn feeding and flexible timing',
  article.includes('do not withhold feeds, stretch wake time or keep a tired newborn awake') &&
    article.includes('window rather than a single target'),
);
assert(
  'the article preserves current safer-sleep boundaries',
  article.includes('clear, flat, separate sleep space') &&
    article.includes('same room as a parent or carer for at least the first six months'),
);
assert(
  'the acquisition CTA has unique fixed attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261110_bedtime_consistency'),
);
assert(
  'the article does not link to the paused feed-to-nap unit',
  !article.includes('/blog/feed-baby-before-or-after-nap.html'),
);
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-same-bedtime-every-night.jpg',
  'obubba-reports-clinic-prep-app.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
