const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/when-should-i-offer-next-bottle-responsive-feeding.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const engine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/next_bottle.dart',
  'utf8',
);

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the next-bottle article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records the cue-led feeding conflict',
  article.includes('smaller evening bottle') &&
    article.includes('fuller daytime bottle') &&
    article.includes('contradictory under-feeding risk'),
);
assert(
  'the shipped engine still changes suggested volume by time of day to support sleep',
  engine.includes('evening ? even * 0.9 : even * 1.08') &&
    engine.includes('support a settled night') &&
    engine.includes('support the night'),
);
assert(
  'the shipped engine still discourages a full bottle at an app-defined daily range',
  engine.includes('consumed >= max') &&
    engine.includes('offer on cue rather than a full bottle'),
);
assert(
  'the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") <
    renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"),
);

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/when-should-i-offer-next-bottle-responsive-feeding.html',
  'public/blog/when-should-i-offer-next-bottle-responsive-feeding.html',
  'hosting-care/blog/when-should-i-offer-next-bottle-responsive-feeding.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
