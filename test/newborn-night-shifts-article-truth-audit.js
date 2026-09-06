const fs = require('node:fs');

const article = fs.readFileSync('content/blog/how-to-split-newborn-night-shifts.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const importScreen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/welcome/import_screen.dart', 'utf8');
const l10n = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/l10n/app_en.arb', 'utf8');
const handoff = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/carer_handoff.dart', 'utf8');
const bubbaCare = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/care/bubba_care_screen.dart', 'utf8');
const merge = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/repositories/child_merge.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('partner code connection is a live shared document',
  importScreen.includes('both devices share the same document in real time'));
assert('the current connection control is Connect live sync',
  l10n.includes('"importConnectCta": "Connect — live sync"'));
assert('same-id entries are deduplicated during sync merge',
  merge.includes('per-day entry union, deduped by entry id'));
assert('the carer briefing needs at least two days with entries',
  handoff.includes('if (daysWithData < 2) return null;'));
assert('the carer briefing includes recent medicine names only',
  handoff.includes('Recent meds:') && handoff.includes("e.type == 'med'") && handoff.includes('i < 2'));
assert('the app labels the route Hand-off briefing',
  bubbaCare.includes("'Hand-off briefing'") && article.includes('Bubba Care → Hand-off briefing'));
assert('the article preserves responsive-feeding boundaries',
  article.includes('Feed responsively') && article.includes('Do not introduce top-ups or stretch intervals solely to make a shift chart work.'));
assert('the article preserves safer-sleep boundaries',
  article.includes('nobody sleeps with the baby on a sofa or armchair') && article.includes('own clear cot or Moses basket'));
assert('the article does not imply the briefing gives medicine doses',
  article.includes('does **not** replace the exact timeline') && article.includes('does not list a medicine dose or administration time'));
assert('the CTA has unique privacy-safe attribution',
  article.includes('utm_campaign=from_bump_to_baby_auto&utm_content=auto_20261102_newborn_night_shifts'));
assert('the article contains no em dash', !article.includes('—'));

for (const asset of [
  'obubba-split-newborn-night-shifts.jpg',
  'obubba-connect-live-family-sync.jpg',
]) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
