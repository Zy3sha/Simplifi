const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/baby-blues-or-postnatal-depression-signs-help.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const wellbeing = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/wellbeing_proactive.dart',
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

assert('the postnatal mental-health article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records both unsupported product-claim conflicts',
  article.includes('sleep deprivation "doubles PND risk"') &&
    article.includes('"80% of new parents" experience') &&
    article.includes('incorrectly generalises a post-birth hormonal experience'),
);
assert(
  'the shipped sleep-crisis card still contains the unqualified PND-risk claim',
  wellbeing.includes('it doubles PND risk and impairs judgement and driving'),
);
assert(
  'the shipped baby-blues card still generalises the numerical claim to all new parents',
  wellbeing.includes('80% of new parents feel the baby blues') && wellbeing.includes('It is the hormone cliff'),
);
assert(
  'the pause specifies calibrated product corrections and clinical review',
  article.includes('Replace the numerical PND-risk statement') &&
    /people who have\s+recently given birth/.test(article) &&
    article.includes('obtain suitable clinical/content review'),
);
assert(
  'the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"),
);

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-blues-or-postnatal-depression-signs-help.html',
  'public/blog/baby-blues-or-postnatal-depression-signs-help.html',
  'hosting-care/blog/baby-blues-or-postnatal-depression-signs-help.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
