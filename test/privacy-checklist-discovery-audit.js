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

if (failures.length) {
  console.error(`Privacy checklist discovery audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Privacy checklist discovery audit passed: four contextual guide and printable entry points.');
