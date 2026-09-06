const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/baby-food-allergy-reaction-what-to-do-log.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const confidence = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/allergy_confidence.dart',
  'utf8',
);
const tonight = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/tonight_guidance.dart',
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

assert('the food-allergy reaction article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records the unsafe home re-offer conflict',
  article.includes('offer one suspected food') &&
    article.includes('not to repeat a suspected food as a home test') &&
    article.includes('only describe reintroduction as clinician-directed'),
);
assert(
  'the shipped reaction-group card still tells a family to retry a suspected group food',
  confidence.includes('offer ONE suspected $group food on its own') &&
    confidence.includes('see how $name does'),
);
assert(
  'the shipped night guidance still contains the unverified second-exposure rule',
  tonight.includes('Most reactions show within 72h of the second exposure.'),
);
assert(
  'the draft contradiction about swollen lips is explicitly recorded',
  article.includes('lists swollen lips under both the emergency and milder-reaction rows') &&
    article.includes('sudden lip swelling is never classified'),
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
  'blog/baby-food-allergy-reaction-what-to-do-log.html',
  'public/blog/baby-food-allergy-reaction-what-to-do-log.html',
  'hosting-care/blog/baby-food-allergy-reaction-what-to-do-log.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
