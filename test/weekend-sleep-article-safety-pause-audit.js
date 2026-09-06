const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/should-i-let-baby-sleep-in-weekends.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const trends = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/sleep_trends.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the weekend-sleep article is explicitly paused', /^status: paused$/m.test(article));
assert('the article states the threshold is not causal proof', article.includes('not proof that the weekend caused Sunday resistance'));
assert('the product states a Sunday and Monday outcome without observing either', trends.includes("Sunday night\\'s bedtime fights back") && trends.includes('Monday runs rough'));
assert('the product instructs a tighter wake time from timing data alone', trends.includes('Keeping the morning wake within ~30 min all week'));
assert('the product fallback states easy settling and predictable mornings without outcome evidence', trends.includes('keeps settling easy and mornings predictable'));
assert('the product function does not receive sleep-debt or settling outcomes', trends.includes('List<({int weekday, int? bedtimeMin, int? morningWakeMin})> nights'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/should-i-let-baby-sleep-in-weekends.html',
  'public/blog/should-i-let-baby-sleep-in-weekends.html',
  'hosting-care/blog/should-i-let-baby-sleep-in-weekends.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
