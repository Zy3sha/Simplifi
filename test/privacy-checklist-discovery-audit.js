#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const GUIDE = '/blog/pregnancy-baby-app-privacy-checklist.html';
const PDF = '/resources/pregnancy-baby-app-privacy-checklist.pdf';
const targets = [
  ['professional review', 'for-professionals.html'],
  ['tracker selection', 'best-baby-tracker.html'],
  ['free tracker', 'free-baby-tracker-app.html'],
  ['data migration', 'import-baby-tracker-data.html'],
];

const failures = [];
for (const [label, file] of targets) {
  const page = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const guideLinks = (page.match(new RegExp(`href="${GUIDE}"`, 'g')) || []).length;
  const pdfLinks = (page.match(new RegExp(`href="${PDF}" download`, 'g')) || []).length;
  if (guideLinks !== 1) failures.push(`${label}: expected one privacy-guide link, found ${guideLinks}`);
  if (pdfLinks !== 1) failures.push(`${label}: expected one printable link, found ${pdfLinks}`);
  if (!page.includes('privacy-checklist-og.png')) failures.push(`${label}: missing checklist preview`);
}

const professional = fs.readFileSync(path.join(ROOT, 'for-professionals.html'), 'utf8');
if (!/does not ask the professional to recommend OBubba/i.test(professional)) {
  failures.push('professional review: endorsement boundary missing');
}

const embedSection = professional.match(/<div class="section-inner narrow privacy-embed-tool"[\s\S]*?<\/section>/)?.[0] || '';
const embedChecks = [
  ['one embed-code field', (professional.match(/id="privacy-embed-code"/g) || []).length === 1],
  ['embed field is read-only', /id="privacy-embed-code" readonly/.test(professional)],
  ['one user-initiated copy action', (professional.match(/id="copy-privacy-embed"/g) || []).length === 1],
  ['fixed embed source', embedSection.includes('utm_source=partner_embed')],
  ['fixed referral medium', embedSection.includes('utm_medium=referral')],
  ['fixed campaign', embedSection.includes('utm_campaign=from_bump_to_baby_auto')],
  ['fixed embed content', embedSection.includes('utm_content=privacy_checklist_embed')],
  ['public preview only', embedSection.includes('https://obubba.com/privacy-checklist-og.png')],
  ['visible OBubba credit', /Free pregnancy and baby app privacy checklist by OBubba/.test(embedSection)],
  ['no private record fields', !/friend code|baby name|due date|email address|care log/i.test(embedSection)],
  ['no endorsement boundary', /embedding the resource does not mean you recommend OBubba/i.test(embedSection)],
  ['no automatic copy invocation', !/DOMContentLoaded[^<]{0,500}clipboard\.writeText/i.test(professional)],
];
for (const [label, passed] of embedChecks) {
  if (!passed) failures.push(`professional embed: ${label}`);
}

if (failures.length) {
  console.error(`Privacy checklist discovery audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Privacy checklist discovery audit passed: four contextual entry points and one privacy-bounded embed tool.');
