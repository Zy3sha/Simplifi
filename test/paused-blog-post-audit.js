const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-movements-in-pregnancy-when-to-call.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const pregnancyTools = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/pregnancy_tools.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the movement article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the product-safety conflict', article.includes('Current kick-counter guidance conflicts with immediate-call movement guidance'));
assert('the current app still contains the conflicting wait-and-stimulate branch', pregnancyTools.includes('Try a cold drink, a snack, or lying on your left side, and keep counting.'));
assert('the renderer excludes paused and draft posts before any preview override', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-movements-in-pregnancy-when-to-call.html',
  'public/blog/baby-movements-in-pregnancy-when-to-call.html',
  'hosting-care/blog/baby-movements-in-pregnancy-when-to-call.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
