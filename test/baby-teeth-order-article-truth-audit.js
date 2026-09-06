const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-teeth-order-eruption-timeline.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const teethScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/teeth_screen.dart', 'utf8');
const growData = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/grow_data.dart', 'utf8');
const teethingSupport = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/teething_support.dart', 'utf8');
const memoryBook = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/memory_book.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the app has a 20-tooth map and supports multi-tooth logging', growData.includes('const kToothMap = <ToothPos>[') && teethScreen.includes("'${_teeth.length} of 20'") && teethScreen.includes('for (final t in teeth)'));
assert('the app uses corrected age for next-likely orientation', teethScreen.includes('final mo = child?.correctedMonths()') && teethScreen.includes("'NEXT LIKELY'"));
assert('the article labels app ranges as orientation rather than NHS deadlines', article.includes('broader orientation windows used in OBubba, not NHS deadlines'));
assert('the canine window matches the shipped app', growData.includes("ToothGroup('Canines', 16, 22") && article.includes('16-to-22-month orientation window'));
assert('the comfort insight requires stronger discomfort markers', teethingSupport.includes("const _distressMarkers = {'Swollen gums', 'Disturbed sleep', 'Off food', 'Red cheeks', 'Fussy'}"));
assert('the first dated tooth can enter the Memory Book', memoryBook.includes("title: 'First tooth'"));
assert('the article does not link the paused fever acquisition page', !article.includes('/blog/baby-temperature-fever-when-to-call-111.html'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261023_baby_teeth'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-baby-teeth-eruption-timeline.jpg', 'obubba-teeth-smile-map-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
