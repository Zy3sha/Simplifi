const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/contractions-when-to-start-timing-when-to-call.md', 'utf8');
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

assert('the contractions article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the five-minute guidance conflict', article.includes('continued timing at a regular five-minute pattern'));
assert('the current app still contains the conflicting continue-timing branch', pregnancyTools.includes('Keep timing, if they settle into ~5 min apart, lasting a minute, for an hour'));
assert('the app separately keeps the urgent symptom note visible', pregnancyTools.includes('Call your midwife or maternity unit straight away, whatever the timer says'));
assert('the renderer excludes paused sources before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/contractions-when-to-start-timing-when-to-call.html',
  'public/blog/contractions-when-to-start-timing-when-to-call.html',
  'hosting-care/blog/contractions-when-to-start-timing-when-to-call.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
