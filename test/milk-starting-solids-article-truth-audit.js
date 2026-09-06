const fs = require('node:fs');

const article = fs.readFileSync('content/blog/how-much-milk-baby-starting-solids.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const feedInsights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/feed_insights.dart', 'utf8');
const weaningScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('milk trends require 14 days and enough measured days', feedInsights.includes('recentDays.length < 14') && feedInsights.includes('thisWeek.length < 4 || lastWeek.length < 4'));
assert('milk trends exclude pumping and solids', feedInsights.includes("e.feedType == 'solids' || e.feedType == 'pump'"));
assert('the current progress screen includes food variety, texture, iron and allergens', weaningScreen.includes('uniqueFoods') && weaningScreen.includes('ironMeals') && weaningScreen.includes('allergens'));
assert('the article labels NHS formula amounts as guides', article.includes('around 600ml a day') && article.includes('around 400ml a day') && article.includes('guides rather than quotas'));
assert('the article does not prescribe milk and solids percentages', !/\d+% milk\s*\/\s*\d+% solids/i.test(article));
assert('the article preserves the non-diagnostic boundary', article.includes('cannot assess milk transfer at the breast, diagnose dehydration or decide whether a baby is growing well'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261021_milk_solids'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-milk-baby-starting-solids.jpg', 'obubba-weaning-progress-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
