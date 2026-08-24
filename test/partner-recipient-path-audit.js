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

console.log('Partner recipient-path audit passed: fresh and existing installs are separated and the sync-code boundary is present.');
