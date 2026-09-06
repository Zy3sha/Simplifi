const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/why-baby-pulls-off-breast-and-cries.md', 'utf8');
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

assert('the breast-pull acquisition article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the current product-guidance conflict',
  article.includes('apply a warm compress and massage before feeds') &&
  article.includes('cold relief and avoiding firm pressure'));
assert('the current app still creates the conflicting action from side-time data',
  lactation.includes('final neglectedPct = (neglected / total * 100).round();') &&
  lactation.includes('Try starting feeds on the $neglectedSide for a day or two, or hand-express it to comfort') &&
  lactation.includes('a warm compress and gentle massage before feeds help it drain'));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/why-baby-pulls-off-breast-and-cries.html',
  'public/blog/why-baby-pulls-off-breast-and-cries.html',
  'hosting-care/blog/why-baby-pulls-off-breast-and-cries.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
