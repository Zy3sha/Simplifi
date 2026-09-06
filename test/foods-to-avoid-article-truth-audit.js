const fs = require('node:fs');

const article = fs.readFileSync('content/blog/foods-babies-should-avoid-uk-weaning-safety-list.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const safety = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/food_safety.dart', 'utf8');
const care = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart', 'utf8');
const weaning = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

for (const productPhrase of [
  'Honey, not under 12 months',
  'Whole nuts, choking risk',
  'Round foods, cut for safety',
  'Hard raw fruit & veg, choking risk',
  'High-mercury fish',
  'Must be cooked thoroughly',
  'Rice milk, not under 5 years',
  'Watch the salt',
]) {
  assert(`the shipped logger contains ${productPhrase}`, safety.includes(productPhrase));
}

assert('Weaning and First Foods opens without a Care-level Premium gate', care.includes("if (title == 'Weaning & First Foods')") && care.includes('const WeaningScreen()'));
assert('the full recipe garden retains its Premium boundary', weaning.includes('Unlock the full $kRecipeCount-recipe garden') && article.includes('full recipe garden is a Premium feature'));
assert('the article states that the checker is text-based and cannot inspect food', article.includes('text-based prompt, not a food inspection or nutrition-label reader'));
assert('the article covers the current NHS food and drink exclusions', ['Fresh pâté', 'Unpasteurised or raw milk', 'Plant-based drinks'].every(item => article.includes(item)));
assert('the article links current NHS avoidance and preparation guidance', article.includes('/safe-weaning/food-and-drinks-to-avoid/') && article.includes('/safe-weaning/preparing-food-safely/'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261018_foods_to_avoid'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-foods-babies-should-avoid.jpg', 'obubba-foods-to-avoid-weaning-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
