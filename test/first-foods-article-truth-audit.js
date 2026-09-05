const fs = require('node:fs');

const article = fs.readFileSync('content/blog/what-can-6-month-old-eat-first-foods.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const catalogue = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/first_foods.dart', 'utf8');
const screen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/first_foods_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

const catalogueCount = (catalogue.match(/FirstFood\(name:/g) || []).length;
assert('the current Flutter catalogue contains exactly 34 foods', catalogueCount === 34);
assert('the article describes the current searchable catalogue', article.includes('search by food, standout nutrient or allergen') && screen.includes("hintText: 'Find a food, nutrient or allergen…'"));
assert('the current engine excludes allergens with a recorded reaction', catalogue.includes('!reacted.contains(allergenOf(f))'));
assert('the article does not call swelling or cough a mild reaction', !article.includes('Mild reactions can include'));
assert('the article preserves its medical-clearance boundary', article.includes('planning support, not medical clearance'));
assert('the article links current NHS first-food, allergy and food-safety guidance', ['babys-first-solid-foods', 'food-allergies-in-babies-and-young-children', 'foods-to-avoid-giving-babies-and-young-children'].every(path => article.includes(path)));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261009_first_foods'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-34-first-foods-six-month-old.jpg', 'obubba-first-foods-guide-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
