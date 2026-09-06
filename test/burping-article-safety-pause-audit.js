const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/do-i-need-to-burp-baby-after-every-feed.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const cryingHelper = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/crying_helper_screen.dart', 'utf8');
const coachKb = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/coach_kb.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the burping article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the cue-led product conflict', article.includes('routine preventive instruction'));
assert('the article cites current NHS burping guidance', article.includes('https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/how-to-burp-your-baby/'));
assert('the Crying Helper still makes the preventive claim', cryingHelper.includes('A good burp after feeds prevents a lot of evening fussing.'));
assert('the feeding coach still gives a blanket winding schedule', coachKb.includes('Wind halfway through and at the end of a feed.'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/do-i-need-to-burp-baby-after-every-feed.html',
  'public/blog/do-i-need-to-burp-baby-after-every-feed.html',
  'hosting-care/blog/do-i-need-to-burp-baby-after-every-feed.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
