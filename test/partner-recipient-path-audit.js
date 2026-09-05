const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'partner-baby-tracker-app.html'), 'utf8');

const requireOnce = (value) => {
  const count = page.split(value).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one ${JSON.stringify(value)}; found ${count}`);
};

requireOnce('Already have a private sync code?');
requireOnce('Join the baby record you were invited to.');
requireOnce('Download for iPhone to enter the code');
requireOnce('Get Android to enter the code');

if (!page.includes('Import your data / Connect')) throw new Error('Fresh-install recipient path is missing');
if (!page.includes('Connect — live sync')) throw new Error('Exact fresh-install CTA is missing');
if (!page.includes('Account › Family &amp; Sharing › Connect another device')) throw new Error('Existing-install recipient path is missing');
if (!page.includes('Keep the code private.')) throw new Error('Sync-code privacy boundary is missing');
if (/OB-[A-Z0-9]{6,}/.test(page)) throw new Error('An apparent real or example sync code is exposed');
if (!page.includes("gtag('event', 'store_click'")) throw new Error('Partner store-intent event is missing');
if (!page.includes('auto_20260905_partner_shared_record_intent')) throw new Error('Fixed partner intent content label is missing');
if (/auto_20260905_partner_shared_record_intent[\s\S]{0,700}(sync.?code|family.?id|user.?id|email)/i.test(page)) {
  throw new Error('Partner store-intent analytics appears to include sensitive or identifying data');
}

console.log('Partner recipient-path audit passed: recipient paths, sync-code boundary and privacy-safe store intent are present.');
