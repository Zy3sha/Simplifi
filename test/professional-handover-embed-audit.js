#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.resolve(__dirname, '..', 'for-professionals.html'), 'utf8');
const handoverGuide = fs.readFileSync(path.resolve(__dirname, '..', 'blog', 'baby-care-handover-template-grandparents-nursery.html'), 'utf8');
const checks = [
  ['handover builder destination', page.includes('/blog/baby-care-handover-template-grandparents-nursery.html?utm_source=partner_embed')],
  ['fixed campaign attribution', page.includes('utm_campaign=from_bump_to_baby_auto') && page.includes('utm_content=baby_handover_builder_embed')],
  ['no-data boundary', /Nothing typed into the builder is collected or saved by the page/i.test(page)],
  ['neutral resource boundary', /not a recommendation or clinical tool/i.test(page)],
  ['copy control', page.includes('id="copy-handover-embed"') && page.includes("navigator.clipboard.writeText(field.value)")],
  ['safe new-tab link', page.includes('target=&quot;_blank&quot; rel=&quot;noopener&quot;')],
  ['no form or third-party script', !/<form/i.test(page) && !/script src=["']https:\/\/(?!www\.googletagmanager\.com)/i.test(page)],
  ['contextual discovery route', handoverGuide.includes('/for-professionals.html?utm_source=owned_search&amp;utm_medium=seo&amp;utm_campaign=from_bump_to_baby_auto&amp;utm_content=auto_20260905_handover_embed_discovery#handover-embed-heading')],
  ['discovery non-endorsement boundary', /Sharing the resource does not imply that you endorse OBubba/i.test(handoverGuide)],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Professional handover embed audit failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('Professional handover embed audit passed: attributed, privacy-bounded and copy-ready.');
