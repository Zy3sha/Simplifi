const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-wakes-same-time-every-night.md', 'utf8');
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

assert('the same-time-wake article is explicitly paused', /^status: paused$/m.test(article));
assert('the article limits scheduled waking to older babies and clinician discussion', article.includes('If a baby is over six months') && article.includes('discuss it with a health visitor or appropriately qualified clinician'));
assert('the product instructs a timed pre-wake rouse', coachKb.includes("go in ~15-30 minutes BEFORE it and gently rouse your baby"));
assert('the product states an unverified learned body-clock cause', coachKb.includes("your baby\\'s body has learned to surface at that exact point"));
assert('the product makes a no-cry guarantee', coachKb.includes('it works WITH their sleep cycles and never involves any crying'));
assert('the product predicts the wake usually changes', coachKb.includes('the habitual wake usually softens or shifts'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-wakes-same-time-every-night.html',
  'public/blog/baby-wakes-same-time-every-night.html',
  'hosting-care/blog/baby-wakes-same-time-every-night.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
