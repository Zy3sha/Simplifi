const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/is-my-baby-hungry-or-comfort-feeding.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const daytimeSignals = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/feed_insights.dart', 'utf8');
const nightAnalysis = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/night_analysis.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the hungry-or-comfort-feeding article is explicitly paused', /^status: paused$/m.test(article));
assert('the article states that hunger and comfort overlap', article.includes('The honest answer is that hunger and comfort overlap.'));
assert('the article keeps feeding cues in charge', article.includes('Feed a hungry baby. Comfort a baby who needs comfort.'));
assert('the daytime insight acknowledges hunger remains possible', daytimeSignals.includes('could also be hunger or a growth spurt'));
assert('the daytime insight says never to withhold from a hungry baby', daytimeSignals.includes('always respond, never withhold from a hungry baby'));
assert('the night engine labels small feeds as not hunger', nightAnalysis.includes("title: 'Comfort feeds, not hunger'"));
assert('the night engine infers motive from volume alone', nightAnalysis.includes('avgNightFeedMl < 40'));
assert('the night engine suggests reassurance before feeding', nightAnalysis.includes('A brief reassure before offering a feed often eases it'));
assert('the night-feed branch is not age-gated at the point of inference', !nightAnalysis.slice(nightAnalysis.indexOf('// Mostly feed-driven wakes.'), nightAnalysis.indexOf('// Several wakes, few/no feeds')).includes('ageWeeks'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/is-my-baby-hungry-or-comfort-feeding.html',
  'public/blog/is-my-baby-hungry-or-comfort-feeding.html',
  'hosting-care/blog/is-my-baby-hungry-or-comfort-feeding.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
