const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/which-breast-offer-next-left-right.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const lactation = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/lactation_insights.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the breast-next article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the warm-compress and massage conflict', article.includes('advises a warm compress and massage'));
assert('the current app still contains the conflicting warm-compress guidance', lactation.includes('a warm compress and gentle massage before feeds help it drain'));
assert('the renderer excludes paused sources before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/which-breast-offer-next-left-right.html',
  'public/blog/which-breast-offer-next-left-right.html',
  'hosting-care/blog/which-breast-offer-next-left-right.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
