const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/baby-temperature-fever-when-to-call-111.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const healthEngine = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/health_insights.dart', 'utf8');
const healthSheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/extra_sheets.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the fever article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the unsupported automatic 40C emergency rule', article.includes('40C as an automatic emergency at any age'));
assert('the current health engine contains the conflicting automatic emergency branch', healthEngine.includes('A temperature this high is an emergency at any age.'));
assert('the current temperature sheet repeats the conflicting automatic emergency branch', healthSheet.includes('A temperature of $disp is an emergency at any age'));
assert('the renderer excludes paused sources before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-temperature-fever-when-to-call-111.html',
  'public/blog/baby-temperature-fever-when-to-call-111.html',
  'hosting-care/blog/baby-temperature-fever-when-to-call-111.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
