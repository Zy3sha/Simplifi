const fs = require('node:fs');

const article = fs.readFileSync('content/blog/postpartum-rage-why-am-i-so-angry.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const wellbeing = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/wellbeing.dart', 'utf8');
const moodScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/mood_checkin_screen.dart', 'utf8');
const careScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Parent Room is directly reachable without a Premium gate', careScreen.includes("if (title == 'Parent Room')") && careScreen.includes('const ParentRoomScreen()'));
assert('EPDS is a 10-item screen and any positive self-harm answer is flagged', wellbeing.includes('kEpdsQuestions.length') && wellbeing.includes('final selfHarm = epdsItemScore(9, answers[9]) > 0'));
assert('the shipped screen labels EPDS as screening rather than diagnosis and phone-local', moodScreen.includes('recognised screening tool (EPDS), not a diagnosis. It stays on your phone.'));
assert('the article limits the 111 mental-health option to England', article.includes('In England') && article.includes('select the mental-health option'));
assert('the article preserves the urgent 999 boundary', article.includes('Call 999 or go to A&E if there is imminent danger'));
assert('the article does not present OBubba as diagnosis or crisis care', article.includes('does **not** diagnose postpartum rage') && article.includes('bridge to a person'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261011_postpartum_rage'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-postpartum-rage-safe-pause.jpg', 'obubba-parent-room-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
