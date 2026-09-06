const fs = require('node:fs');

const article = fs.readFileSync('content/blog/new-parent-mental-load-make-invisible-care-visible.md', 'utf8');
const loadEngine = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/parental_load.dart',
  'utf8',
);
const provider = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/track/track_providers.dart',
  'utf8',
);
const card = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/features/track/brain_screen.dart',
  'utf8',
);
const wellbeing = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/maternal_wellbeing.dart',
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

assert('the article has fixed acquisition attribution', article.includes('utm_content=auto_20261113_mental_load'));
assert('the article contains no em dash', !article.includes('—'));
assert('the monthly recap reads 30 days', provider.includes('for (var i = 0; i < 30; i++)'));
assert('the monthly recap needs 14 data days and 20 feed-plus-nap events', loadEngine.includes('days >= 14 && (feeds + naps) >= 20'));
assert('the recap is capped once per baby per calendar month', provider.includes('_scopedKey') && provider.includes('_monthKey(now)'));
assert('zero-value recap categories are omitted', loadEngine.includes('if (l.feeds > 0)') && loadEngine.includes('if (l.nappies > 0)'));
assert('the recap can be kept or shared', card.includes('Keep / share'));
assert('the article discloses that warm labels are inferred from shared log counts', article.includes('cannot prove who physically held a nap'));
assert('the wellbeing check-in is stored outside the shared child blob', wellbeing.includes('kept OFF') && wellbeing.includes('shared child_syncs blob'));
assert('the two article assets are versioned', fs.existsSync('obubba-new-parent-mental-load-shared-care.jpg') && fs.existsSync('obubba-parent-room-app.jpg'));

if (process.exitCode) process.exit(process.exitCode);
console.log('Mental-load article truth audit passed.');
