#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'blog', 'pregnancy-baby-app-privacy-checklist.html'), 'utf8');
const source = fs.readFileSync(path.join(ROOT, 'tools', 'render-seo.mjs'), 'utf8');
const failures = [];

const checks = [
  ['share action is user initiated', page.includes('id="share-privacy-checklist"')],
  ['copy fallback is user initiated', page.includes('id="copy-privacy-checklist-link"')],
  ['native share uses the fixed URL', page.includes('navigator.share') && page.includes('url: shareUrl')],
  ['fixed parent-share source', page.includes('utm_source=parent_share')],
  ['fixed copy-share medium', page.includes('utm_medium=copy_share')],
  ['fixed campaign', page.includes('utm_campaign=from_bump_to_baby_auto')],
  ['fixed shared-content label', page.includes('utm_content=privacy_checklist_share')],
  ['shared landing gets distinct store label', page.includes('utm_content=privacy_checklist_share_to_store')],
  ['incoming labels must all match', source.includes("incoming.get('utm_source') === 'parent_share'")
    && source.includes("incoming.get('utm_medium') === 'copy_share'")
    && source.includes("incoming.get('utm_campaign') === 'from_bump_to_baby_auto'")
    && source.includes("incoming.get('utm_content') === 'privacy_checklist_share'")],
  ['shared CTA rewrite waits for parsed CTA', page.includes("document.addEventListener('DOMContentLoaded', rewriteSharedLandingCta")],
  ['no private record fields', !/friend code|baby name|due date|email address|care log/i.test(page.match(/<section class="privacy-share-tool"[\s\S]*?<\/section>/)?.[0] || '')],
  ['privacy boundary visible', /includes no account, pregnancy, baby, care or contact details/i.test(page)],
  ['no automatic share invocation', !/DOMContentLoaded[^<]{0,500}navigator\.share/i.test(page)],
];

for (const [label, passed] of checks) {
  if (!passed) failures.push(label);
}

if (failures.length) {
  console.error(`Privacy checklist share audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Privacy checklist share audit passed: user-initiated, fixed-label and privacy-bounded.');
