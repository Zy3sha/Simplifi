const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const partnerArticle = fs.readFileSync(path.join(ROOT, 'blog', 'share-baby-tracker-with-partner-without-keeping-score.html'), 'utf8');

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

const articleExpected = [
  'See how to set up one shared baby record',
  '/partner-baby-tracker-app.html?utm_source=partner_article&amp;utm_medium=owned_search',
  'utm_campaign=from_bump_to_baby_auto',
  'utm_content=auto_20260905_partner_article_setup',
];

for (const value of articleExpected) {
  if (!partnerArticle.includes(value)) throw new Error(`Missing partner-article discovery marker: ${value}`);
}

console.log('Shared-care discovery audit passed: homepage and partner-article routes reach the current public setup guide.');
