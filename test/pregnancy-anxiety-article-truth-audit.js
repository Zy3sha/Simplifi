const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/is-anxiety-normal-in-pregnancy-when-worry-needs-support.md',
  'utf8',
);
const shell = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/shell/main_shell.dart',
  'utf8',
);
const screen = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/pregnancy/pregnancy_magic_screen.dart',
  'utf8',
);
const preview = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/pregnancy/pregnancy_magic_preview.dart',
  'utf8',
);
const store = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/maternal_store.dart',
  'utf8',
);

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert(
  'the article has fixed acquisition attribution',
  article.includes('utm_content=auto_20261123_pregnancy_anxiety'),
);
assert('the article contains no en or em dash', !/[–—]/.test(article));
assert(
  'the article uses the current NHS pregnancy anxiety and care routes',
  article.includes('https://www.nhs.uk/pregnancy/mental-health-in-pregnancy-and-after-the-birth/anxiety-in-pregnancy/') &&
    article.includes('https://www.nhs.uk/nhs-services/mental-health-services/find-care-for-your-mental-health-before-during-and-after-pregnancy/'),
);
assert(
  'the article preserves the immediate-risk escalation boundary',
  article.includes('call **999** or go to A&E now') &&
    article.includes('risk you may harm yourself or your baby'),
);
assert(
  'Talking Therapies is correctly limited to England',
  article.includes('In England, adults can also self-refer to NHS Talking Therapies'),
);
assert(
  'the active pregnancy shell uses the current magic screen',
  shell.includes('return const PregnancyMagicScreen();'),
);
assert(
  'the five mood choices and persistence hook match production',
  preview.includes("['Light', 'Calm', 'Tired', 'Worried', 'Low']") &&
    screen.includes('saveCheckIn('),
);
assert(
  'one daily record is replaced rather than duplicated',
  store.includes('checkIns().where((x) => x.dateKey != c.dateKey).toList()..add(c)'),
);
assert(
  'the article does not invent mood notes or an app-visible trend',
  !article.includes('mood notes') &&
    !article.includes('noticing a repeated personal pattern'),
);
assert(
  'the product boundary is self-reflection and signposting, not diagnosis',
  article.includes('computes no depression or anxiety score') &&
    article.includes('signposting screen, not an assessment'),
);
assert(
  'the article does not call its campaign visual a raw app screenshot',
  article.includes('An OBubba pregnancy overview featuring the current Flutter For you screen') &&
    !article.includes('The real OBubba Flutter pregnancy experience'),
);
assert(
  'the article assets are versioned in the deployable site root',
  fs.existsSync('obubba-anxiety-in-pregnancy-support-20261123.jpg') &&
    fs.existsSync('obubba-pregnancy-wellbeing-app-20261123.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Pregnancy-anxiety article truth audit passed.');
