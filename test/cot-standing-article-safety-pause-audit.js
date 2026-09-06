const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-standing-in-cot-at-bedtime-cant-get-down.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const disruption = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/disruption_diagnostic.dart', 'utf8');
const devPredict = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/development/dev_predict.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the cot-standing article is explicitly paused', /^status: paused$/m.test(article));
assert('the article says the milestone link is not inevitable', article.includes('the link is not inevitable'));
assert('the article says a recent milestone is context rather than diagnosis', article.includes('a recent milestone is context, not a diagnosis'));
assert('the disruption card makes a broad overnight-rehearsal claim', disruption.includes('Babies rehearse a brand-new motor or thinking skill overnight'));
assert('the disruption card says a fresh milestone very often stirs sleep', disruption.includes('a fresh milestone very often stirs sleep for a week or two'));
assert('the disruption card predicts daytime practice speeds mastery and wakes ease', disruption.includes('Give lots of daytime practice so the skill becomes second nature sooner') && disruption.includes('the wakes usually ease as the novelty wears off'));
assert('the motor card gives a causal excitement explanation', devPredict.includes('The brain is so excited to practise it wakes them up'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-standing-in-cot-at-bedtime-cant-get-down.html',
  'public/blog/baby-standing-in-cot-at-bedtime-cant-get-down.html',
  'hosting-care/blog/baby-standing-in-cot-at-bedtime-cant-get-down.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
