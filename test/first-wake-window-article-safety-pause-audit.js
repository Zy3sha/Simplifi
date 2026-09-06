const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/why-is-babys-first-wake-window-so-short.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const sleepInsights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/sleep_insights.dart', 'utf8');
const resettleAction = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/brain_advice_card.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the first-wake-window article is explicitly paused', /^status: paused$/m.test(article));
assert('the article admits the app cannot determine sleep state', article.includes('The app cannot determine sleep state'));
assert('the detector states happy and calm without receiving those fields', sleepInsights.includes("body: '$name woke happily, stayed calm, then drifted back off"));
assert('the detector inputs contain no wake mood', !sleepInsights.slice(sleepInsights.indexOf('BrainInsight? detectMorningResettle'), sleepInsights.indexOf('/// Diagnose WHY')).includes('wakeMood'));
assert('the detector inputs contain no settling method', !sleepInsights.slice(sleepInsights.indexOf('BrainInsight? detectMorningResettle'), sleepInsights.indexOf('/// Diagnose WHY')).includes('settleMethod'));
assert('the action writes independently without observed settling evidence', resettleAction.includes("'note': 'Brief morning stir, resettled independently. Day starts here.'"));
assert('the action deletes the candidate nap', resettleAction.includes('await repo.deleteEntry(code, r.napId!)'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/why-is-babys-first-wake-window-so-short.html',
  'public/blog/why-is-babys-first-wake-window-so-short.html',
  'hosting-care/blog/why-is-babys-first-wake-window-so-short.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
