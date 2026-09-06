const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/what-to-track-when-starting-solids.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const allergenEngine = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_allergen_pacing.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the starting-solids tracking article is explicitly paused', /^status: paused$/m.test(article));
assert('the article correctly rejects an unrecorded reaction as an allergy test', article.includes('a logged “no reaction” is not an allergy test'));
assert('the confidence engine treats an empty reaction field as tolerated', allergenEngine.includes("m.reaction == '' || m.reaction == 'loved'") && allergenEngine.includes('tolerant exposures'));
assert('the confidence card claims no trouble from those exposures', allergenEngine.includes('times now with no trouble'));
assert('the article links to the gagging-versus-choking guide', article.includes('/blog/gagging-vs-choking-baby-weaning.html'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/what-to-track-when-starting-solids.html',
  'public/blog/what-to-track-when-starting-solids.html',
  'hosting-care/blog/what-to-track-when-starting-solids.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
