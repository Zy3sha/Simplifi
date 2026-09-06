const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/hunger-teething-or-sleep-cycle-reading-baby-night-wake.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const pattern = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/wake_reason_pattern.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the night-wake article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the duration inference and feed-avoidance conflicts',
  article.includes("wake can be read by duration") &&
  article.includes('help avoid a full feed'));
assert('the product still claims a baby wake can be read by length',
  pattern.includes("You can read $name\\'s night wakes by their length"));
assert('the product still says duration hints at what the baby needs',
  pattern.includes('how long they fuss is a clue to what they need'));
assert('the product still uses the pattern to suggest avoiding a feed',
  pattern.includes('avoid a full feed when a quick reassure would do'));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/hunger-teething-or-sleep-cycle-reading-baby-night-wake.html',
  'public/blog/hunger-teething-or-sleep-cycle-reading-baby-night-wake.html',
  'hosting-care/blog/hunger-teething-or-sleep-cycle-reading-baby-night-wake.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
