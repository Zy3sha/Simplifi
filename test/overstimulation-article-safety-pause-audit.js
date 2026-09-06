const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/is-my-baby-overstimulated-signs-calm-reset.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const cryingHelper = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/crying_helper_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the overstimulation article is explicitly paused', /^status: paused$/m.test(article));
assert('the article warns against covering a pram with muslin', article.includes('Do not cover a pram or pushchair with a muslin'));
assert('the shipped crying helper recommends muslin over the pram', cryingHelper.includes('A muslin over the pram or a calm dark room resets an overloaded little brain.'));
assert('the article keeps overstimulation non-diagnostic', article.includes('Overstimulation is an everyday description, not a medical diagnosis.'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/is-my-baby-overstimulated-signs-calm-reset.html',
  'public/blog/is-my-baby-overstimulated-signs-calm-reset.html',
  'hosting-care/blog/is-my-baby-overstimulated-signs-calm-reset.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
