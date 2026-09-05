const fs = require('node:fs');

const article = fs.readFileSync('content/blog/6-month-baby-meal-plan.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const plan = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_plan.dart', 'utf8');
const screen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart', 'utf8');
const recipes = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/weaning_recipes.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

const recipeCount = (recipes.match(/WeaningRecipe\(stage:/g) || []).length;
assert('the current Flutter recipe garden contains 77 recipes', recipeCount === 77);
assert('the free weekly plan generates six meals and persists shopping ticks', plan.includes('{int meals = 6') && plan.includes('setString(_scoped(), jsonEncode(p.toJson()))') && plan.includes('toggleGot'));
assert('the app exposes fewer cookbook ideas free and the full garden with Premium', screen.includes('count: premium ? 6 : 3') && screen.includes("Unlock the full $kRecipeCount-recipe garden"));
assert('the article states the verified free and Premium boundary', article.includes('saved six-meal weekly plan and its shopping list are available in the free app') && article.includes('Premium unlocks the full 77-recipe garden'));
assert('the allergy emergency wording includes the current NHS body areas', article.includes('swelling of the lips, mouth, throat or tongue'));
assert('the vitamin section links current NHS guidance', article.includes('https://www.nhs.uk/best-start-in-life/baby/baby-vitamins/'));
assert('the article preserves its decision-support boundary', article.includes('decision support, not a diet prescription'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261010_six_month_meal_plan'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-6-month-baby-meal-plan.jpg', 'obubba-weaning-progress-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
