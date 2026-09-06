const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-wakes-when-put-down-cot-transfer.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const coachKb = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/coach_kb.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the cot-transfer article is explicitly paused', /^status: paused$/m.test(article));
assert('the article rejects a universal stopwatch rule', article.includes('do not build the whole plan around an exact stopwatch number') && article.includes('There is no universal number'));
assert('the product gives an exact approximate transfer time', coachKb.includes('wait ~20 minutes for deep sleep'));
assert('the product presents deep sleep as the transfer method', coachKb.includes('Wait for deep sleep (heavy, floppy arm) before moving.'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-wakes-when-put-down-cot-transfer.html',
  'public/blog/baby-wakes-when-put-down-cot-transfer.html',
  'hosting-care/blog/baby-wakes-when-put-down-cot-transfer.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
