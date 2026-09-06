const fs = require('node:fs');

const article = fs.readFileSync('content/blog/cant-sleep-when-baby-sleeps-postpartum-insomnia.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const parentRoom = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/parent_room_screen.dart', 'utf8');
const moodScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/mood_checkin_screen.dart', 'utf8');
const wellbeing = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/wellbeing.dart', 'utf8');
const maternalStore = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/maternal_store.dart', 'utf8');
const care = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/care_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Parent Room opens without a Care-level Premium gate', care.includes("if (title == 'Parent Room')") && care.includes('const ParentRoomScreen()') && article.includes('available without Premium'));
assert('the breathing cycle matches the shipped four-four-six rhythm', parentRoom.includes('4s in · 4s hold · 6s out') && article.includes('4-in, 4-hold, 6-out'));
assert('the check-in uses all ten EPDS questions and does not score gaps', wellbeing.includes('EPDS needs ${kEpdsQuestions.length} answers') && moodScreen.includes('final gap = _answers.indexWhere((a) => a == null)') && article.includes('all ten questions one at a time'));
assert('any positive self-harm answer keeps the urgent-support reflex', wellbeing.includes('final selfHarm = epdsItemScore(9, answers[9]) > 0') && article.includes('Any positive response to the self-harm question triggers urgent support'));
assert('maternal wellbeing history remains phone-local', maternalStore.includes('SharedPreferences') && maternalStore.includes('NEVER written to the shared `child_syncs` blob') && article.includes('Results stay on the phone'));
assert('the article preserves non-diagnostic and emergency boundaries', article.includes('cannot diagnose insomnia') && article.includes('urgent same-day assessment') && article.includes('call 999'));
assert('the England-only Talking Therapies boundary is explicit', article.includes('In England, eligible adults can also self-refer'));
assert('the article links current NHS sleep, PND, psychosis, perinatal and safer-sleep routes', ['sleep-and-tiredness-after-having-a-baby', 'conditions/postnatal-depression', 'conditions/post-partum-psychosis', 'find-care-for-your-mental-health-before-during-and-after-pregnancy', 'safe-sleep-advice-for-babies'].every(path => article.includes(path)));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261020_postpartum_insomnia'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-cant-sleep-when-baby-sleeps.jpg', 'obubba-parent-wellbeing-checkin-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
