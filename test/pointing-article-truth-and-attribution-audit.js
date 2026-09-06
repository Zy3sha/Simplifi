const fs = require('node:fs');

const article = fs.readFileSync('content/blog/when-do-babies-start-pointing-what-it-means.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const growData = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/grow_data.dart', 'utf8');
const forecast = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/skill_forecast_screen.dart', 'utf8');
const analysis = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/milestone_analysis.dart', 'utf8');
const bridge = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/development/milestone_activity_bridge.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the shipped app records pointing as a language milestone',
  growData.includes("Milestone('m24', 'language', 'Points to things they want'"));
assert('the forecast is explicitly framed as a forecast rather than a deadline',
  forecast.includes('A forecast, not a deadline') && forecast.includes('Could be any time now') && forecast.includes('Coming into view'));
assert('personalisation requires at least two credible dated samples',
  forecast.includes('forecast.first.samples >= 2') && analysis.includes('if (off.samples < 2) return null;'));
assert('the forecast uses a median and drops implausible dates',
  analysis.includes('offsets[k ~/ 2]') && analysis.includes('if (a < m.early - 6) continue;') && analysis.includes('(a - m.typical).abs() > band'));
assert('pointing bridges to Book Pointing and Name & Point',
  bridge.includes("'m24': ['a19', 'a22']") && growData.includes("'Book Pointing'") && growData.includes("'Name & Point'"));
assert('the article keeps the app boundary clear',
  article.includes('It cannot observe the behaviour or assess development.') && article.includes('The app’s range never overrules a concern.'));
assert('the article cites current NHS guidance and the health review',
  article.includes('nhs.uk/start-for-life/baby/learning-to-talk/learning-to-talk-6-to-12-months') && article.includes('nhs.uk/baby/babys-development/height-weight-and-reviews/baby-reviews'));
assert('the CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261213_pointing'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of ['obubba-when-babies-start-pointing.jpg', 'obubba-milestones-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
