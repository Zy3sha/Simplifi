const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/will-bigger-bedtime-bottle-help-baby-sleep-longer.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const correlations = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/correlations.dart', 'utf8');
const intervention = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/intervention.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the bedtime-bottle article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the responsive-feeding conflict', article.includes('active instructions to split or trim the final bottle'));
assert('the article says not to cap or ration milk for the comparison', article.includes('It does not ration milk on “small bottle” nights') && article.includes('Do not cap a hungry baby'));
assert('the correlation engine assigns an unproven overfull-tummy cause', correlations.includes('a very full tummy can stir more night wakes'));
assert('the correlation experiment instructs a thresholded split feed', correlations.includes('instead of one big bottle over ${UnitPrefs.format(f.thr)}'));
assert('the intervention fallback tells a parent to trim the bottle', intervention.includes("Trim $name's last bottle a little and watch the night wakes."));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/will-bigger-bedtime-bottle-help-baby-sleep-longer.html',
  'public/blog/will-bigger-bedtime-bottle-help-baby-sleep-longer.html',
  'hosting-care/blog/will-bigger-bedtime-bottle-help-baby-sleep-longer.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
