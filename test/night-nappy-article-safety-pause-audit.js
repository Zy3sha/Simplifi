const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/change-baby-nappy-every-night-feed.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const dayMetrics = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_metrics.dart', 'utf8');
const healthInsights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/health_insights.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the night-nappy article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the hydration classification conflict', article.includes('counts Poo, Dirty and untyped nappy logs as wet nappies'));
assert('the article still promises distinct nappy types and real hydration entries', article.includes('Wet, Poo and Dirty entries') && article.includes('only surfaces hydration trends from real entries'));
assert('the hydration source still counts poo and dirty entries as wet', dayMetrics.includes("pt.contains('wet') || pt == 'poop' || pt == 'dirty' || pt == 'both'"));
assert('the hydration source still counts an untyped nappy as wet', dayMetrics.includes('if (pt.isEmpty) return true;'));
assert('the inferred wet count can still drive a dehydration insight', healthInsights.includes("title: 'Fewer wet nappies than expected'") && healthInsights.includes('final wet = s.wetNappies24h'));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/change-baby-nappy-every-night-feed.html',
  'public/blog/change-baby-nappy-every-night-feed.html',
  'hosting-care/blog/change-baby-nappy-every-night-feed.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
