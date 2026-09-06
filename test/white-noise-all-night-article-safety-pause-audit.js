const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/should-white-noise-stay-on-all-night-baby.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const soundScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/sound_machine_screen.dart', 'utf8');
const sleepTips = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/sleep_tips.dart', 'utf8');
const coachKb = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/coach_kb.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the all-night white-noise article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the duration and benefit conflict', article.includes('all-night or continuous white noise'));
assert('the article cites the current childhood white-noise review', article.includes('https://pubmed.ncbi.nlm.nih.gov/38663282/'));
assert('the Sound Machine screen still claims all-night resettling benefit', soundScreen.includes('leaving it on all night helps baby resettle between sleep cycles'));
assert('the shipped sleep tips still prescribe all-night use', sleepTips.includes("SleepTip('🔇', 'White noise all night'") && sleepTips.includes('leave it on all night at a low volume'));
assert('the coach knowledge base still recommends continuous sound', coachKb.includes('Run continuous white/pink noise at a low, steady volume a couple of metres away.'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/should-white-noise-stay-on-all-night-baby.html',
  'public/blog/should-white-noise-stay-on-all-night-baby.html',
  'hosting-care/blog/should-white-noise-stay-on-all-night-baby.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
