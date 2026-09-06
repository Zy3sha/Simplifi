const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const articlePath = 'content/blog/baby-fighting-bedtime-after-late-nap-evening-alertness-window.md';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const detector = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/wake_maintenance_zone.dart',
  'utf8',
);
const model = fs.readFileSync(
  '/Users/zyesha/development/obubba_flutter_main/lib/core/engine/sleep_pressure.dart',
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

assert('the late-nap article is explicitly paused', /^status: paused$/m.test(article));
assert(
  'the pause records the missing bedtime-resistance evidence',
  article.includes('does not require recorded settling') &&
    article.includes('bedtime resistance or false starts'),
);
assert(
  'the detector accepts only timing lists rather than a bedtime-resistance outcome',
  detector.includes('required List<int?> recentLastNapEnds') &&
    detector.includes('required List<int?> recentBedtimes') &&
    !detector.includes('recentSettling'),
);
assert(
  'the detector makes a causal battle or false-start claim from the timing gate',
  detector.includes('so bedtime becomes a battle or a false start'),
);
assert(
  'the infant clock curve and threshold are fixed in code',
  model.includes('[1050, 0.80]') &&
    model.includes('circadianAlertness(napClock) >= 0.72'),
);
assert(
  'the detector prescribes a fixed 45-minute relative move',
  detector.includes('medEnd - 45') && detector.includes('45 minutes earlier'),
);
assert(
  'the renderer excludes paused sources before scheduled preview',
  renderer.indexOf("post.status === 'paused'") <
    renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"),
);

execFileSync(process.execPath, ['tools/render-seo.mjs'], {
  cwd: process.cwd(),
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

for (const output of [
  'blog/baby-fighting-bedtime-after-late-nap-evening-alertness-window.html',
  'public/blog/baby-fighting-bedtime-after-late-nap-evening-alertness-window.html',
  'hosting-care/blog/baby-fighting-bedtime-after-late-nap-evening-alertness-window.html',
]) {
  assert(`${output} is absent even from a scheduled preview build`, !fs.existsSync(output));
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Late-nap wake-maintenance-zone article safety-pause audit passed.');
