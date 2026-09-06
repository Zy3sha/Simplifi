const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const article = fs.readFileSync('content/blog/how-to-plan-baby-naps-around-appointment-event.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const maker = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/schedule_maker.dart', 'utf8');
const tables = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/sleep_tables.dart', 'utf8');
const sheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/schedule_maker_sheet.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the Schedule Maker article is explicitly paused', /^status: paused$/m.test(article));
assert('the pause records the newborn default-schedule conflict',
  article.includes('clock-based six-nap day for newborns') &&
  article.includes('minimum learned-history gate'));
assert('the article itself says not to reshape a newborn around a timetable',
  article.includes("Do not reshape a newborn's feeds and sleep around a social timetable."));
assert('Schedule Maker currently permits every non-negative corrected age',
  maker.includes('if (ageWeeks < 0) return null;') &&
  sheet.includes('final ageWeeks = child.correctedWeeks();'));
assert('the newborn profile currently generates six planned naps',
  tables.includes('if (w < 6) return const NapProfile(expectedNaps: 6'));
assert('insufficient history currently falls back to neutral clock defaults',
  maker.includes('this.avgWakeMin = 7 * 60') &&
  maker.includes('this.avgNapDurMin = 50') &&
  maker.includes('this.avgBedMin = 19 * 60') &&
  maker.includes('if (days.length < 3) return const ScheduleStats();'));
assert('the screen always supplies seven day slots even when they contain no usable logs',
  sheet.includes('for (var i = 1; i <= 7; i++)'));
assert('the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"));

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/how-to-plan-baby-naps-around-appointment-event.html',
  'public/blog/how-to-plan-baby-naps-around-appointment-event.html',
  'hosting-care/blog/how-to-plan-baby-naps-around-appointment-event.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
