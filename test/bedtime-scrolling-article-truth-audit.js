const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/why-stay-up-scrolling-after-baby-sleeps.md',
  'utf8',
);
const track = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_home.dart',
  'utf8',
);
const winddown = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/track/widgets/bedtime_winddown_sheet.dart',
  'utf8',
);
const parentRoom = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/care/parent_room_screen.dart',
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
  article.includes('utm_content=auto_20261124_bedtime_scrolling'),
);
assert('the article contains no en or em dash', !/[–—]/.test(article));
assert(
  'the article cites current NHS sleep, new-parent tiredness and emergency routes',
  article.includes('https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/') &&
    article.includes('https://www.nhs.uk/baby/support-and-services/sleep-and-tiredness-after-having-a-baby/') &&
    article.includes('https://www.nhs.uk/mental-health/conditions/post-partum-psychosis/'),
);
assert(
  'the article cites current safer-sleep support for exhausted parents',
  article.includes('https://www.lullabytrust.org.uk/baby-safety/being-a-parent-or-caregiver/sleep-deprivation/'),
);
assert(
  'the live bedtime path suppresses wind-down behind the first timer tutorial',
  track.includes("getBool('ob_sleep_timer_explained_v1')") &&
    track.includes('showBedtimeWindDown(context, name)') &&
    article.includes('after the first timer tutorial has been seen'),
);
assert(
  'all five wind-down choices match the shipped screen',
  ['Parent Room', 'Just breathe', 'Put the kettle on', 'Guilt-free scroll']
    .every((label) => winddown.includes(label)) &&
    winddown.includes("I\\'m okay, goodnight"),
);
assert(
  'the article does not imply that OBubba limits or measures scrolling',
  article.includes('does not set a screen-time limit') &&
    article.includes('cannot tell whether tonight\'s scrolling restored you') &&
    article.includes('track your screen time'),
);
assert(
  'the article avoids promoting the adjacent weather-derived sleepwear card',
  !article.includes('weather data') && !article.includes('sleepwear check'),
);
assert(
  'Parent Room supports breathing, mood selection and regional contacts',
  parentRoom.includes('How are you today?') &&
    parentRoom.includes("static const _cycle = 14.0") &&
    parentRoom.includes('Terms.crisisLines'),
);
assert(
  'the article preserves non-diagnostic and urgent-help boundaries',
  article.includes('cannot diagnose or treat insomnia') &&
    article.includes('Call **999** if somebody may be in immediate danger'),
);
assert(
  'the article assets are versioned in the deployable site root',
  fs.existsSync('obubba-parent-scrolling-after-baby-sleeps-20261124.jpg') &&
    fs.existsSync('obubba-parent-room-app-20261124.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Bedtime-scrolling article truth audit passed.');
