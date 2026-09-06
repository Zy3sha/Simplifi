const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/where-should-baby-nap-cot-contact-pram-carrier-car.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const insights = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/extra_insights.dart', 'utf8');
const brain = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/brain.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the nap-location article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records the unsafe car-seat recommendation conflict',
  article.includes('rank a car nap as the longest or happiest location') &&
    article.includes('car seats are for transport, not routine sleep') &&
    article.includes('Exclude car from recommendation candidates'),
);
assert('car remains a current factual nap-log location', insights.includes("'car': 'Car'"));
assert(
  'duration comparison currently permits car to win and calls the winner a good bet',
  insights.includes('final best = sorted.first, worst = sorted.last;') &&
    insights.includes("the ${bestLabel.toLowerCase()} is a good bet"),
);
assert(
  'wake-mood comparison currently permits car to win and calls it the happiest place',
  insights.includes('happiest place to sleep, handy for the nap you most want to go well'),
);
assert(
  'the contradiction guard is conditional rather than a universal car exclusion',
  insights.includes('if (total < 8 || movement / total < 0.7) return null;') &&
    brain.includes('final weaningMotion = methodOk && contactNap != null;') &&
    insights.includes('if (suppressMotionWinner && _movementNapLocs.contains(best.key)) return null;'),
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
  'blog/where-should-baby-nap-cot-contact-pram-carrier-car.html',
  'public/blog/where-should-baby-nap-cot-contact-pram-carrier-car.html',
  'hosting-care/blog/where-should-baby-nap-cot-contact-pram-carrier-car.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
