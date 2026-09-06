const fs = require('node:fs');

const article = fs.readFileSync('content/blog/track-baby-sleep-illness-travel-nursery.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const trackHome = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_home.dart', 'utf8');
const providers = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_providers.dart', 'utf8');
const baseline = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/optimal_ww.dart', 'utf8');
const brain = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_type_night.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

for (const dayType of ['home', 'daycare', 'grand', 'travel', 'sick']) {
  assert(`the shipped picker includes ${dayType}`, trackHome.includes(`('${dayType}',`));
}

assert('day tags are written to shared child data', providers.includes("setChildMap(code, 'dayTags'"));
assert('day tags keep a local offline copy', providers.includes("setString(_key(code), jsonEncode(next))"));
assert('all exceptional picker types are excluded from baseline learning',
  ['sick', 'travel', 'daycare', 'grand'].every((tag) => baseline.includes(`dayTag == '${tag}'`)));
assert('away versus home night comparison needs four nights in each group',
  brain.includes('away.length < 4 || home.length < 4'));
assert('away versus home night comparison needs at least one wake difference',
  brain.includes('delta.abs() < 1.0'));
assert('the article does not repeat the stale device-local limitation',
  !article.includes('They are device-local') && !article.includes('Not currently.'));
assert('the CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261026_day_types'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-track-sleep-illness-travel-nursery.jpg',
  'obubba-app-baby-sleep-clock-screenshot.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
