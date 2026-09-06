const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-throws-food-on-floor-weaning.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const weaningInsights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_insights.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the food-throwing article is explicitly paused', /^status: paused$/m.test(article));
assert('the article routes repeated choking to professional support', article.includes('throwing comes with coughing, choking, pain or wet breathing') && article.includes('stop the experiment and seek professional advice'));
assert('the live texture matcher includes choking language', weaningInsights.includes("'choke', 'choked'"));
assert('the live classifier sends those words to the texture-gap route', weaningInsights.includes('if (_containsAny(meal.note, _textureRefusalWords)) return _RefusalKind.textureGap;'));
assert('the live texture card is low urgency', weaningInsights.includes('kind: InsightKind.weaningTextureRefusal') && weaningInsights.includes('urgency: InsightUrgency.low'));
assert('the live card recommends another texture experiment', weaningInsights.includes("If there's gagging, go a step softer for a few days") && weaningInsights.includes('offer soft finger foods to explore'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-throws-food-on-floor-weaning.html',
  'public/blog/baby-throws-food-on-floor-weaning.html',
  'hosting-care/blog/baby-throws-food-on-floor-weaning.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
