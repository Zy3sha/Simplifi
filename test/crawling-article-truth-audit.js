const fs = require('node:fs');

const article = fs.readFileSync(
  'content/blog/when-will-my-baby-crawl-signs.md',
  'utf8',
);
const engine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/milestone_analysis.dart',
  'utf8',
);
const growData = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/grow_data.dart',
  'utf8',
);
const supersedeTest = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/test/milestone_supersede_boundary_r125_test.dart',
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
  article.includes('utm_content=auto_20261119_crawling'),
);
assert('the article contains no em dash', !article.includes('—'));
assert(
  'the article carries the current NHS crawling range and 12-month advice',
  article.includes('around 7 to 10 months') &&
    article.includes('not showing any signs of moving by 12 months'),
);
assert(
  'the article refuses an exact crawling-date promise',
  article.includes('No app can know the exact date') &&
    article.includes('forecast, not an assessment or deadline'),
);
assert(
  'the forecast requires age and two dated milestones for personalisation',
  engine.includes('if (correctedWeeksNow == null) return const [];') &&
    engine.includes('final avg = off.samples >= 2 ? off.avg : 0.0'),
);
assert(
  'the article accurately explains the two-date median limit',
  article.includes('With only two dated milestones, both still shape the midpoint'),
);
assert(
  'the shipped crawl milestone includes bottom shuffling and its verified range',
  growData.includes("Milestone('m38', 'motor', 'Crawls or bottom shuffles', 28, 36, 52)"),
);
assert(
  'first steps supersede an unrecorded crawl at the shared boundary',
  supersedeTest.includes("expect(milestoneSupersededByLater(crawl, {'m42'}), isTrue)"),
);
assert(
  'the article no longer links the inaccessible Healthier Together route',
  !article.includes('healthiertogether.nhs.uk'),
);
assert(
  'the article assets are versioned',
  fs.existsSync('obubba-when-will-baby-crawl-20261119.jpg') &&
    fs.existsSync('obubba-milestones-app-20261119.jpg'),
);

if (process.exitCode) process.exit(process.exitCode);
console.log('Crawling article truth audit passed.');
