const fs = require('node:fs');

const article = fs.readFileSync('content/blog/what-does-a-baby-sleep-consultant-do.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const care = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart', 'utf8');
const screen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/sleep_coach_screen.dart', 'utf8');
const consultation = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/sleep_consultation.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Sleep Consultant is explicitly Premium-gated in Care', care.includes("if (title == 'Sleep Consultant')") && care.includes('_gatedPush(context, const SleepCoachScreen())'));
assert('the full consultation requires at least five profiles', consultation.includes('if (profiles.length < 5) return null;') && article.includes('at least five logged day profiles'));
assert('structured plans use a 17-corrected-week floor', screen.includes('rawAge < 17') && screen.includes('Plan available from around 4 months') && article.includes('at least 17 corrected weeks'));
assert('the three gentle paths match current labels', screen.includes("'No-cry / Gentle'") && screen.includes("'Chair shuffle'") && screen.includes("'Parent-led rhythm'"));
assert('timed check-ins retain the opt-in and six-month gate', screen.includes('graduatedMethodUnlocked') && screen.includes('6mo+ baby') && article.includes('six-month corrected-age gate'));
assert('the article clearly states the Premium and medical boundaries', article.includes('Sleep Consultant is a **Premium feature**') && article.includes('software, not a human clinician') && article.includes('cannot diagnose'));
assert('the article retains current NHS safer-sleep guidance', article.includes('https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/') && article.includes('firm, flat and clear'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261017_sleep_consultant'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-baby-sleep-consultant.jpg', 'obubba-sleep-consultant-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
