const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/does-a-lick-count-as-introducing-baby-allergen.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const weaning = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/weaning_screen.dart', 'utf8');
const childSync = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/child_sync_repository.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the allergen-lick article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the missing offered eaten and tolerated states', article.includes('offered, eaten and tolerated states'));
assert('the article cites current NHS infant-allergy guidance', article.includes('https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'));
assert('every allergen-bearing solids log still enters the ever-tried set', childSync.includes("if (e is Map && e['feedType'] == 'solids')") && childSync.includes('tried.addAll(allergensForEntry(e));'));
assert('manual ticks still enter the introduced set', weaning.includes('final out = <String>{..._manualIntroduced};'));
assert('the journey still labels the resulting state Introduced', weaning.includes("'Introduced'"));
assert('the journey still advises twice-weekly re-offering from that state', weaning.includes("Once introduced, keep offering it regularly (about twice a week) to maintain tolerance."));
assert('paused posts are excluded before scheduled preview', renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/does-a-lick-count-as-introducing-baby-allergen.html',
  'public/blog/does-a-lick-count-as-introducing-baby-allergen.html',
  'hosting-care/blog/does-a-lick-count-as-introducing-baby-allergen.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
