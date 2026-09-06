const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-friendly-family-meals-without-cooking-twice.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const recipeEngine = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_recipe_engine.dart', 'utf8');
const weaningPlan = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_plan.dart', 'utf8');
const weaningScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('recipes stay hidden before the around-six-month window',
  weaningScreen.includes('if (ageWeeks < 26) return const SizedBox.shrink();'));
assert('recipe ranking rewards iron and untried foods',
  recipeEngine.includes('if (isIron) score += 2') && recipeEngine.includes('if (!tried) score += 1'));
assert('recipe ranking favours one new allergen and de-ranks two or more',
  recipeEngine.includes('newAllergens.length == 1') && recipeEngine.includes('newAllergens.length >= 2'));
assert('recorded reacted allergens are filtered from recipes',
  recipeEngine.includes('_detectedRecipeAllergens(r).any(reacted.contains)'));
assert('the weekly plan defaults to six meals and persists meal and shopping ticks',
  weaningPlan.includes('{int meals = 6') &&
  weaningPlan.includes('Future<void> toggleTried') &&
  weaningPlan.includes('Future<void> toggleGot') &&
  weaningPlan.includes("setString(_scoped(), jsonEncode(p.toJson()))"));
assert('the shopping list is derived from planned recipe ingredients',
  weaningPlan.includes('shoppingFromRecipes(picks.map((p) => p.recipe))'));
assert('the article states the free weekly-plan and Premium recipe boundary',
  article.includes('saved six-meal weekly plan and its shopping list are available in the free app') &&
  article.includes('Premium unlocks the full 77-recipe garden'));
assert('the CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261028_family_meals'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-baby-friendly-family-meals.jpg',
  'obubba-weaning-progress-app.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
