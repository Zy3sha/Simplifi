const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-dropped-centile-line-should-feed-more.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const growthFeed = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/growth_feed_insight.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the dropped-centile article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the fixed-threshold and feeding-prescription conflicts',
  article.includes('fixed two-band threshold regardless of birthweight') &&
  article.includes('prescribe offering feeds more often'));
assert('the app still uses a fixed two-band health-visitor branch',
  growthFeed.includes('if (shift.bandsCrossed >= 2 && span >= 5)'));
assert('the app still contains the unsupported reassuring wording',
  growthFeed.includes('a single-band ease is usually nothing to chase'));
assert('the app still prescribes more frequent feeding from its frequency floor',
  growthFeed.includes('try offering a little more often') &&
  growthFeed.includes("offer feeds a touch more '"));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-dropped-centile-line-should-feed-more.html',
  'public/blog/baby-dropped-centile-line-should-feed-more.html',
  'hosting-care/blog/baby-dropped-centile-line-should-feed-more.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
