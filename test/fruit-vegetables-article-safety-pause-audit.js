const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-only-eats-fruit-how-to-try-vegetables.md', 'utf8');
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

assert('the fruit and vegetables article is explicitly paused', /^status: paused$/m.test(article));
assert('the public guide routes repeated choking to professional assessment', article.includes('coughing, choking, wet breathing or pain repeats with certain textures'));
assert('the live refusal matcher includes choking language', weaningInsights.includes("'choke', 'choked'"));
assert('the live choking path is classified only as a texture gap', weaningInsights.includes('if (_containsAny(meal.note, _textureRefusalWords)) return _RefusalKind.textureGap;'));
assert('the resulting card is low urgency', weaningInsights.includes('kind: InsightKind.weaningTextureRefusal') && weaningInsights.includes('urgency: InsightUrgency.low'));
assert('the resulting advice suggests another food texture instead of assessment', weaningInsights.includes("If there's gagging, go a step softer for a few days"));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-only-eats-fruit-how-to-try-vegetables.html',
  'public/blog/baby-only-eats-fruit-how-to-try-vegetables.html',
  'hosting-care/blog/baby-only-eats-fruit-how-to-try-vegetables.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
