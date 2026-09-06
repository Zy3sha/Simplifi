const fs = require('node:fs');

const article = fs.readFileSync('content/blog/forgot-stop-baby-sleep-timer-fix-log.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const home = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_home.dart', 'utf8');
const providers = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_providers.dart', 'utf8');
const logSheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/log_sheet.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the morning repair window is 06:00 through 16:00',
  providers.includes('if (nowMin < 6 * 60 || nowMin > 16 * 60) return null;'));
assert('the overdue-nap repair window starts at four hours and ends at twelve',
  providers.includes('int staleMins = 4 * 60') && providers.includes('elapsed > 12 * 60'));
assert('the repair flow asks for the parent-supplied wake time',
  home.includes('Still asleep, or up for the day?') && home.includes('Still napping, or did they wake?') && home.includes('endHmOverride:'));
assert('recent completed naps can resume for three hours and bedtime for ten',
  logSheet.includes("final maxAgo = type == 'sleep' ? 600 : 180"));
assert('resuming clears the end and preserves the original start',
  logSheet.includes("'end': null") && logSheet.includes('continuing from the ORIGINAL start'));
assert('manual nap and bedtime duration guards match the article',
  logSheet.includes('endMin - startMin > 6 * 60') && logSheet.includes('span > 18 * 60'));
assert('the article limits those duration guards to the manual editor',
  article.includes('When a parent enters or edits a completed sleep manually'));
assert('the article preserves the free timer versus Premium countdown boundary',
  article.includes('live sleep timer and logging controls are free') && article.includes('countdown target is a Premium feature'));
assert('the CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261027_forgotten_timer'));
assert('the article uses the current NHS urgent-help route',
  article.includes('/when-to-get-urgent-medical-help-for-babies-and-children-under-5/'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-forgot-stop-baby-sleep-timer.jpg',
  'obubba-app-baby-sleep-clock-screenshot.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
