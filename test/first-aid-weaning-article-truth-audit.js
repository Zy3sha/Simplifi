const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-first-aid-before-weaning.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const firstAid = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/account/first_aid_screen.dart', 'utf8');
const account = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/account/account_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('First Aid Quick Reference is directly reachable from Account without a Premium gate', account.includes("'FIRST AID QUICK REFERENCE' => const FirstAidScreen()"));
assert('the app localises emergency and non-emergency routes', firstAid.includes('Terms.emergencyNumber') && firstAid.includes('Terms.nonEmergencyLine'));
assert('the app separates emergency and prevention topics', firstAid.includes("'Choking (emergency)'") && firstAid.includes("'Choking prevention'"));
assert('the article uses current NHS choking and urgent-help routes', article.includes('https://www.nhs.uk/baby/first-aid-and-safety/first-aid/how-to-stop-a-child-from-choking/') && article.includes('https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/'));
assert('the article preserves the training and emergency boundaries', article.includes('not** a substitute for accredited training') && article.includes('call 999 and follow the call handler'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261013_first_aid_weaning'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-baby-first-aid-before-weaning.jpg', 'obubba-weaning-safety-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
