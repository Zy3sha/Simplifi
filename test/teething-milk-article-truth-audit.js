const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/baby-drinking-less-milk-while-teething.md',
  'utf8',
);
const detector = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/teething_ripple.dart',
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
  article.includes('utm_content=auto_20261117_teething_milk'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the article does not diagnose teething as the cause of a feed dip',
  article.includes('pattern detection, not proof that the tooth caused'),
);
assert(
  'the article discloses incomplete-day and night-feed limits',
  article.includes('An incompletely logged day can look like a lower-intake day') &&
    article.includes('unlogged night feeds are outside this daytime comparison'),
);
assert(
  'the article says wet nappies are not part of the feed percentage',
  article.includes('does not use wet nappies to calculate this percentage'),
);
assert(
  'the detector requires a recorded tooth in the previous five days',
  detector.includes('gap >= 0 && gap <= 5'),
);
assert(
  'the detector requires two window days and five baseline days',
  detector.includes('windowDates.length < 2 || baseDates.length < 5'),
);
assert(
  'the detector analyses daytime feeds and gates mixed feeding',
  detector.includes("e.type == 'feed' && !e.night") &&
    detector.includes('if (!useMl && !useMin) return null'),
);
assert(
  'the detector threshold is 15 percent',
  detector.includes('if (dipPct < 15) return null'),
);
assert(
  'the article uses current NHS urgent-help timing',
  article.includes('no drink for eight waking hours') &&
    article.includes('no wet nappy or pee for 12 hours'),
);
assert(
  'the article assets are versioned',
  fs.existsSync('obubba-baby-drinking-less-milk-teething-20261117.jpg') &&
    fs.existsSync('obubba-teeth-smile-map-app-20261117.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Teething-milk article truth audit passed.');
