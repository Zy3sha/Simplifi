const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const expected = [
  'Show me how to share the baby record',
  'href="/partner-baby-tracker-app.html"',
  'class="btn btn-ghost js-shared-care-guide"',
  'data-content-id="auto_20260905_home_shared_care_guide"',
  'window.gtag("event", "shared_care_guide_click"',
];

for (const value of expected) {
  if (!homepage.includes(value)) throw new Error(`Missing shared-care discovery marker: ${value}`);
}

if (/shared_care_guide_click[\s\S]{0,500}(sync.?code|family.?id|user.?id|email)/i.test(homepage)) {
  throw new Error('Shared-care discovery analytics appears to include sensitive or identifying data');
}

console.log('Shared-care discovery audit passed: the homepage CTA and fixed privacy-safe event are present.');
