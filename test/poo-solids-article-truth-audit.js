const fs = require('node:fs');

const article = fs.readFileSync('content/blog/baby-poo-after-starting-solids.md', 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');

function assert(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${label}`);
}

assert('article names the current Flutter nappy texture label', article.includes('Bloody/streaked'));
assert('article does not claim the app diagnoses stool or dehydration', article.includes('not diagnosis') && article.includes('cannot tell whether a colour is blood') && article.includes('assess dehydration'));
assert('pale-stool route uses current NHS urgent advice', article.includes('https://www.nhs.uk/conditions/jaundice-in-babies/'));
assert('dehydration guidance cites the NHS', article.includes('https://www.nhs.uk/conditions/dehydration/'));
assert('article has a uniquely attributable download route', article.includes('utm_content=auto_20261008_poo_solids'));
assert('article contains no em dash', !article.includes('—'));
for (const asset of ['obubba-baby-poo-after-solids.jpg', 'obubba-poo-colour-texture-log-app.jpg']) {
  assert(`${asset} is versioned at the source root`, fs.existsSync(asset));
  assert(`${asset} is copied by the SEO renderer`, renderer.includes(`'${asset}'`));
}

if (process.exitCode) process.exit(process.exitCode);
