const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/does-baby-need-100-foods-before-one.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const firstFoods = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/first_foods.dart', 'utf8');
const allergenEngine = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_allergen_pacing.dart', 'utf8');
const analytics = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_analytics.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the 100-foods article is explicitly paused', /^status: paused$/m.test(article));
assert('the draft promises a separation between tolerated and new allergens', article.includes('keeping established tolerated foods separate from “new”'));
assert('the first-taste engine treats introduced as given rather than verified eaten', firstFoods.includes('allergens already given') && !firstFoods.includes('verified eaten'));
assert('the first-taste copy makes a broad allergy-risk reduction claim', firstFoods.includes('offering it early, on its own, helps lower allergy risk'));
assert('the confidence engine treats no recorded reaction as tolerant', allergenEngine.includes("m.reaction == '' || m.reaction == 'loved'") && allergenEngine.includes('tolerant exposures'));
assert('the confidence copy claims tolerance can stick', allergenEngine.includes('helps the tolerance stick'));
assert('the unique-food counter is description-based rather than ingredient-aware', analytics.includes("foods.map((f) => f.toLowerCase()).toSet().length"));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/does-baby-need-100-foods-before-one.html',
  'public/blog/does-baby-need-100-foods-before-one.html',
  'hosting-care/blog/does-baby-need-100-foods-before-one.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
