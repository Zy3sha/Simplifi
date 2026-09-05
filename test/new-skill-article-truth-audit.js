const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-suddenly-fussy-before-new-skill.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const grow = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/grow_screen.dart', 'utf8');
const forecast = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/skill_forecast_screen.dart', 'utf8');
const waves = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/grow/waves_screen.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('Grow development tools are reached without a Premium gate', grow.includes("title == 'Waves'") && grow.includes('const DevelopmentMapScreen()') && grow.includes("title == 'Milestones'"));
assert('Skill Forecast uses age-typical windows until at least two milestones shape it', forecast.includes('forecast.first.samples >= 2') && forecast.includes('Age-typical windows for now; each logged milestone makes this more personal.'));
assert('corrected age switches on only at 21 days early', forecast.includes('utcDays(due, birth) >= 21'));
assert('the forecast explicitly avoids deadlines', forecast.includes('A forecast, not a deadline'));
assert('Waves explicitly avoid diagnosis and milestone-test claims', waves.includes('They are not a diagnosis or a milestone test.'));
assert('the article uses the current NHS urgent-help URL', article.includes('https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/'));
assert('the article preserves illness and developmental-assessment limits', article.includes('Development is context, not a diagnosis') && article.includes('should never be used to explain away illness'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261012_new_skill'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-baby-fussy-new-skill.jpg', 'obubba-app-growth-development-screenshot.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
