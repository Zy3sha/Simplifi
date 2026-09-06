const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/baby-gone-back-to-purees-weaning-texture-reset.md',
  'utf8',
);
const detector = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/weaning_texture_readiness.dart',
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
  article.includes('utm_content=auto_20261116_texture_reset'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the article names product suggestions as hypotheses rather than proved causes',
  article.includes('possible explanations to consider, not causes the app has proved'),
);
assert(
  'the detector recognises the texture terms described by the article',
  detector.includes("['puree', 'pureed', 'purée', 'smooth', 'blended', 'blitzed']") &&
    detector.includes("['chopped', 'minced', 'diced', 'small pieces', 'bite-size', 'bite size']"),
);
assert(
  'each comparison window requires at least three texture-labelled meals',
  detector.includes('if (stages.length < 3) return null'),
);
assert(
  'the current and prior windows are limited to days 0 to 6 and 7 to 13',
  detector.includes('_daysAgoFromNewest(recent14, m) < 7') &&
    detector.includes('d >= 7 && d < 14'),
);
assert(
  'the detector stays quiet when texture holds or advances',
  detector.includes('curStage >= priorStage'),
);
assert(
  'the detector suppresses stale present-tense findings',
  detector.includes('if (staleDays > 9) return null'),
);
assert(
  'the article hero and product image are versioned',
  fs.existsSync('obubba-baby-back-to-purees-texture-reset.jpg') &&
    fs.existsSync('obubba-weaning-progress-app.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Texture-reset article truth audit passed.');
