const fs = require('node:fs');

const article = fs.readFileSync('content/blog/perineal-massage-how-to-when-to-start.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
const screen = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/pregnancy/pregnancy_tools_screen.dart', 'utf8');
const safety = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/core/engine/pregnancy_tools.dart', 'utf8');
const premium = fs.readFileSync('/Users/zyesha/development/obubba_flutter_main/lib/features/premium/premium_providers.dart', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('the shipped pregnancy tool is a four-step perineal-massage guide', screen.includes("title: 'Your gentle four-step guide'") && ['When to start', 'Getting comfy', 'How to do it', 'Be kind to yourself'].every(step => screen.includes(`title: '${step}'`)));
assert('the article matches the shipped 34 to 35 week timing and gentle technique', screen.includes('From around 34–35 weeks') && article.includes('34–35 weeks') && article.includes('slow U-shaped movement'));
assert('the article preserves the shipped stop and contraindication boundaries', safety.includes("Don\\'t massage if you have vaginal bleeding") && ['waters may have broken', 'active thrush', 'midwife has advised against it'].every(boundary => article.includes(boundary)));
assert('the article keeps the evidence calibrated rather than guaranteeing prevention', article.includes('cannot guarantee a tear-free birth') && article.includes('may reduce the chance'));
assert('the pregnancy early-free entitlement matches the current provider', premium.includes('if (child.isExpecting) return true') && premium.includes('wk != null && wk < 9') && article.includes('first eight corrected weeks'));
assert('the article does not cross-promote the paused movement or contraction tools', !article.includes('kick counter') && !article.includes('contraction timer'));
assert('the article links current RCOG and NHS maternity guidance', article.includes('rcog.org.uk/for-the-public/perineal-tears') && article.includes('cuh.nhs.uk/patient-information/antenatal-perineal-massage-explained'));
assert('the CTA has unique privacy-safe attribution', article.includes('utm_content=auto_20261019_perineal_massage'));
assert('the article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-perineal-massage-pregnancy.jpg', 'obubba-perineal-massage-guide-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
