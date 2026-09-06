const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/feed-baby-before-or-after-nap.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const feedNapEngine = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/feed_nap_spacing.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the feed-before-after-nap article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the causal fall-asleep-cue conflict',
  article.includes('makes milk the fall-asleep cue and prescribes a longer gap'));
assert('the current app still contains the conflicting causal and prescriptive wording',
  feedNapEngine.includes('makes the feed the fall-asleep cue') &&
  feedNapEngine.includes('Finish the pre-nap feed about'));
assert('the engine derives the recommendation from timing association rather than causal evidence',
  feedNapEngine.includes('best.avg - worst.avg < 15') &&
  feedNapEngine.includes('Naps run longest when the last feed lands'));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/feed-baby-before-or-after-nap.html',
  'public/blog/feed-baby-before-or-after-nap.html',
  'hosting-care/blog/feed-baby-before-or-after-nap.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
