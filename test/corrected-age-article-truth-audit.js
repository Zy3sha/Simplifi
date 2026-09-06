const fs = require('node:fs');

const article = fs.readFileSync('content/blog/corrected-age-premature-baby-sleep-weaning-milestones.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const child = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/child_sync_repository.dart', 'utf8');
const brain = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/brain.dart', 'utf8');
const growth = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/growth.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('corrected age switches on only for a gap of at least 21 days',
  child.includes('difference(DateTime.utc(b.year, b.month, b.day)).inDays <\n        21'));
assert('developmental correction is clamped before the due date and tapered by two years',
  child.includes('if (correctedDays < 0) return 0;') &&
  child.includes('const kCorrectionEndMonths = 24.0;') &&
  child.includes('const kTaperMonths = 6.0;'));
assert('growth correction preserves a negative pre-term age so percentiles are withheld',
  growth.includes('negative age flows into weightPercentile, which nulls ageMonths<0') &&
  growth.includes('ageMonths < 0'));
assert('medicine suitability stays on chronological age',
  brain.includes('medicationDoseGuard(medDoses, ageWeeks: chronoAgeWeeksSafe)'));
assert('vitamin D timing stays on chronological age',
  brain.includes('vitaminDReminder(ageWeeks: chronoAgeWeeksSafe'));
assert('weaning guidance uses corrected age when available',
  brain.includes('final weaningAgeWeeks = child.correctedWeeks(now: n) ?? chronoAgeWeeksSafe;'));
assert('article distinguishes developmental context from chronological safety decisions',
  article.includes('Routine vaccinations start from time since birth') &&
  article.includes('Never calculate a dose from corrected age.'));
assert('article preserves the specialist premature-weaning boundary',
  article.includes('developmental readiness as well as corrected age') &&
  article.includes('cannot determine feeding readiness'));
assert('article uses current authoritative premature-baby sources',
  article.includes('bliss.org.uk/parents/about-your-baby/early-developmental-milestones') &&
  article.includes('gov.uk/government/publications/a-quick-guide-to-childhood-immunisation-for-the-parents-of-premature-babies'));
assert('CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261104_corrected_age'));
assert('article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-corrected-age-premature-baby.jpg',
  'obubba-app-growth-development-screenshot.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
