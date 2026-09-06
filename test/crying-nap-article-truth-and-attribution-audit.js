#!/usr/bin/env node

const fs = require('node:fs');

const article = fs.readFileSync('content/blog/why-baby-wakes-crying-from-naps.md', 'utf8');
const logSheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/log_sheet.dart', 'utf8');
const napOutcome = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/nap_outcome.dart', 'utf8');
const optimalWw = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/optimal_ww.dart', 'utf8');
const extraInsights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/extra_insights.dart', 'utf8');

function assert(label, condition) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

assert('article has no paused status', !/^status: paused$/m.test(article));
assert('article contains no em or en dash', !/[—–]/.test(article));
assert('article carries exact acquisition attribution', article.includes('utm_content=auto_20261203_crying_nap'));
assert('article preserves the respond-first boundary', article.includes('Respond to the baby first. Interpret the nap second.'));
assert('article states that OBubba cannot diagnose the crying wake', article.includes('The app cannot hear the cry, assess pain, see breathing, confirm reflux'));
assert('article uses the versioned hero', article.includes('heroImage: /obubba-baby-wakes-crying-after-nap-20261203.jpg'));
assert('article uses the versioned live timer image', article.includes('/obubba-live-nap-timer-20261203.jpg'));
assert('versioned hero exists', fs.existsSync('obubba-baby-wakes-crying-after-nap-20261203.jpg'));
assert('versioned live timer image exists', fs.existsSync('obubba-live-nap-timer-20261203.jpg'));
assert('article links current NHS crying guidance', article.includes('https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/'));
assert('article links current NHS baby-state guidance', article.includes('https://www.nhs.uk/best-start-in-life/baby/baby-basics/bonding-with-your-baby/understanding-your-baby/'));
assert('article links Lullaby Trust sleeping-position guidance', article.includes('https://www.lullabytrust.org.uk/baby-safety/safer-sleep-information/sleeping-position/'));

assert('nap logger records all three wake moods', ['Happy', 'Sleepy', 'Fussy'].every((label) => logSheet.includes(label)));
assert('nap logger records all three quality values', ["('good', 'Good')", "('ok', 'OK')", "('rough', 'Rough')"].every((value) => logSheet.includes(value)));
assert('nap logger records the stated settle ranges', ['Under 5m', '5–15m', '15–30m', '30m+'].every((value) => logSheet.includes(value)));
assert('nap logger records the stated nap locations', ['Cot', 'Contact', 'Pram', 'Carrier', 'Car'].every((value) => logSheet.includes(value)));
assert('nap outcome combines duration, settling, mood and quality', napOutcome.includes('durationScore + settleScore + moodScore + qualityScore'));
assert('optimal model requires six pairs', optimalWw.includes('if (pairs.length < 6) return null'));
assert('optimal model requires three samples in a bucket', optimalWw.includes('if (arr.length < 3) return'));
assert('optimal model requires two usable buckets', optimalWw.includes('if (stats.length < 2) return null'));
assert('mismatch insight requires eight samples', optimalWw.includes('optimal.sampleSize < 8'));
assert('mismatch insight requires a twenty-minute difference', optimalWw.includes('delta.abs() < 20'));
assert('location mood comparison requires three per location', extraInsights.includes('e.value.total >= 3'));
assert('location mood comparison requires a clear contrast', extraInsights.includes('best.value < 0.6 || worst.value >= 0.4'));
assert('position trend requires five samples', extraInsights.includes('if (rows.length < 5) return'));
assert('position trend requires recent and older evidence', extraInsights.includes('recent.length < 2 || older.length < 2'));
assert('position trend requires three minutes of change', extraInsights.includes('if (delta < 3) return'));
assert('exceptional-day exclusions cover illness and care contexts', ['sick', 'travel', 'daycare', 'grand', 'grandparents', 'nursery'].every((tag) => optimalWw.includes(`dayTag == '${tag}'`)));

console.log('Crying-nap article truth and attribution audit passed.');
