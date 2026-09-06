const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/can-i-introduce-two-allergens-same-day.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const pacing = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_allergen_pacing.dart', 'utf8');
const weaning = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_insights.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the two-allergen article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the interval and prevention-claim conflicts',
  article.includes('universal couple-of-days interval') &&
  article.includes('continuing weekly lowers the chance'));
assert('the product still attributes a couple-of-days interval to NHS/WHO guidance',
  pacing.includes('NHS/WHO guidance is to introduce the common allergens one at a time, a couple') &&
  pacing.includes('of days apart'));
assert('the product still instructs a new allergen in a few days',
  pacing.includes('add the next new one in a few days'));
assert('the product still makes the broad weekly allergy-prevention claim',
  weaning.includes('continuing weekly lowers the chance of developing'));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/can-i-introduce-two-allergens-same-day.html',
  'public/blog/can-i-introduce-two-allergens-same-day.html',
  'hosting-care/blog/can-i-introduce-two-allergens-same-day.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
