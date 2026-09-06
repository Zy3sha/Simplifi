const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/fewer-wet-nappies-than-usual-baby.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const dayMetrics = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_metrics.dart',
  'utf8',
);
const hydration = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/health_insights.dart',
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

assert('the wet-nappy article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records the unproved wet-status conflict',
  article.includes('counts every soiled, dirty and untyped nappy entry as wet') &&
    article.includes('records that do not prove urine output'),
);
assert(
  'untyped nappies currently count as wet',
  dayMetrics.includes('if (pt.isEmpty) return true'),
);
assert(
  'poop and dirty nappies currently count as wet',
  dayMetrics.includes("pt == 'poop'") && dayMetrics.includes("pt == 'dirty'"),
);
assert(
  'the acute warning consumes that shared wet count',
  hydration.includes('final wet = s.wetNappies24h') &&
    hydration.includes('Fewer wet nappies than expected'),
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
  'blog/fewer-wet-nappies-than-usual-baby.html',
  'public/blog/fewer-wet-nappies-than-usual-baby.html',
  'hosting-care/blog/fewer-wet-nappies-than-usual-baby.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Wet-nappy article safety-pause audit passed.');
