const fs = require('node:fs');

const article = fs.readFileSync('content/blog/how-to-track-twins-feeds-nappies-sleep.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const account = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/account/account_screen.dart', 'utf8');
const logSheet = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/log_sheet.dart', 'utf8');
const feedTimer = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/track/feed_timer.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the first baby is free and the second baby is Premium-gated', account.includes('First baby free, 2nd+ needs Premium'));
assert('Account exposes active-child switching and Add another baby', account.includes('activeChildCodeProvider.notifier') && account.includes('addAnotherBaby'));
assert('Log for all creates a fresh sibling identity and recomputes night context', logSheet.includes("..remove('id'); // fresh id per baby") && logSheet.includes('recomputeNightFromOpenSleep: true'));
assert('Undo includes the sibling entries', logSheet.includes('also: [...siblingEntries, ..._companionUndo]'));
assert('the feed timer stays attached to the child that started it', feedTimer.includes('the child this feed was STARTED for') && feedTimer.includes('String?\n  childCode'));
assert('the article states that there is no side-by-side dashboard', article.includes('does not currently put both babies into one side-by-side dashboard'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261025_twins_tracking'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-track-twins-without-mixups.jpg',
  'obubba-multi-baby-account-app.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
