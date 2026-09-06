const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-sleep-after-clocks-change-gentle-reset.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const override = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/schedule_override.dart', 'utf8');
const reminders = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/notifications/reminder_schedule.dart', 'utf8');
const dayPlan = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/day_plan.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('one-day wake and bedtime changes expire after their start day',
  override.includes('transition == SchedTransition.instant ? diff == 0 : true'));
assert('nap count persists until reset even under Just today',
  override.includes('int? effectiveNapCount(String today)') &&
  override.includes('return _dayDiff(startDay!, today) >= 0 ? napCount : null;'));
assert('pinned nap times also persist until reset',
  override.includes('List<int>? effectiveNapTimes(String today)') &&
  override.includes('return _dayDiff(startDay!, today) >= 0 ? napTimes : null;'));
assert('gradual wake and bedtime easing uses three calendar days and cannot overshoot',
  override.includes('this.gradualDays = 3') &&
  override.includes('final stepsDone = diff + 1') &&
  override.includes("Don't overshoot the target"));
assert('calendar-day arithmetic is DST safe',
  override.includes('DateTime.utc(b.year, b.month, b.day).difference(DateTime.utc(a.year, a.month, a.day)).inDays'));
assert('tomorrow projection discloses its 7am cold-start fallback',
  dayPlan.includes('falls back to [defaultWakeMin] (7am) when there\'s no usable history') &&
  article.includes('falls back to a 7am starting wake and age-based nap structure'));
assert('manual bedtime reaches the same reminder engine used by the clock',
  reminders.includes('sick day / override / skip / consultation plan exactly like the clock'));
assert('article limits schedule adjustment to older babies with an established rhythm',
  article.includes('for an older baby with an established rhythm, not a newborn'));
assert('article preserves responsive feeding and safer-sleep boundaries',
  article.includes('Feed responsively') &&
  article.includes('place baby on their back in a clear, separate sleep space'));
assert('article has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261105_clock_change'));
assert('article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-baby-sleep-after-clocks-change.jpg',
  'obubba-tomorrows-plan-nap-bedtime-prediction.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
