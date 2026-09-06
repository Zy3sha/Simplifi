const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/what-feed-baby-this-week-weaning-meal-plan.md',
  'utf8',
);
const recipeEngine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_recipe_engine.dart',
  'utf8',
);
const plan = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_plan.dart',
  'utf8',
);
const screen = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart',
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
  article.includes('utm_content=auto_20261121_weekly_weaning_plan'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the article does not route readers to the safety-paused reaction guide',
  !article.includes('/blog/baby-food-allergy-reaction-what-to-do-log.html'),
);
assert(
  'an uneaten allergen is not marked introduced or tolerated',
  article.includes('do not mark a food as introduced or tolerated unless your baby actually ate it') &&
    !article.includes('The exposure still counts'),
);
assert(
  'the article describes the actual flexible Monday-to-Saturday planner slots',
  article.includes('six slots labelled Monday to Saturday') &&
    article.includes('flexible planning slots rather than a clinical schedule') &&
    screen.includes("['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"),
);
assert(
  'device-local child and week persistence is disclosed',
  article.includes('persist on that device for that child and Monday-based week') &&
    article.includes("do not currently sync to a partner's device") &&
    plan.includes("String _scoped() => '${_key}_${ref.read(childCodeProvider) ?? 'none'}';") &&
    plan.includes('setString(_scoped(), jsonEncode(p.toJson()))'),
);
assert(
  'the article does not invent an active regenerate control',
  !article.includes('Regenerating asks for confirmation'),
);
assert(
  'the planner ranking and allergen scan exist in the current product',
  recipeEngine.includes('score += 2;') &&
    recipeEngine.includes('score += 3;') &&
    recipeEngine.includes('score -= 2;') &&
    recipeEngine.includes('recipeDisplayAllergens'),
);
assert(
  'the article assets are versioned in the deployable site root',
  fs.existsSync('obubba-baby-weaning-weekly-meal-plan-20261121.jpg') &&
    fs.existsSync('obubba-weaning-planner-app-20261121.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Weekly-weaning-plan article truth audit passed.');
