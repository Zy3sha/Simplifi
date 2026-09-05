const fs = require('node:fs');

const article = fs.readFileSync('content/blog/is-this-normal-newborn-things.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const newborn = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/newborn_screen.dart', 'utf8');
const storybook = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/newborn_storybook_view.dart', 'utf8');
const grow = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/grow_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Is this normal routes directly to the newborn screen', grow.includes("if (title == 'Is this normal?')") && grow.includes('screen = const NewbornScreen();'));
assert('the reassurance route remains visible at every age', grow.includes('Keep the complete six-tool promise visible for every age') && grow.includes('useful as a reference for older babies too'));
assert('the app supplies the 18 reassurance topics described', (newborn.match(/^    \($/gm) || []).length >= 18 && newborn.includes("'Cluster feeding (feeding constantly)'") && newborn.includes("'Umbilical cord stump care'"));
assert('the app supplies all six PURPLE crying elements', newborn.includes("'Peak of crying'") && newborn.includes("'Unexpected'") && newborn.includes("'Resists soothing'") && newborn.includes("'Pain-like face'") && newborn.includes("'Long lasting'") && newborn.includes("'Evening'") );
assert('the safe-pause and urgent-help claims match the app', storybook.includes('A safe pause is allowed') && storybook.includes('Never shake a baby') && storybook.includes('When to get help'));
assert('the article uses the current NHS urgent-help route', article.includes('https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/') && !article.includes('is-your-baby-or-toddler-seriously-ill'));
assert('the article uses current wet-nappy and squint thresholds', article.includes('no wet nappy for 12 hours') && article.includes('continues after three months'));
assert('the article preserves the non-diagnostic boundary', article.includes('does not listen to breathing') && article.includes('cannot decide that a symptom is safe'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261014_newborn_normal'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-newborn-is-this-normal.jpg', 'obubba-newborn-reassurance-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
