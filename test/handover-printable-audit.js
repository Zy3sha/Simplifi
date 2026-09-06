#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const pdfPath = path.join(root, 'resources', 'obubba-baby-care-handover-sheet.pdf');
const page = fs.readFileSync(path.join(root, 'blog', 'baby-care-handover-template-grandparents-nursery.html'), 'utf8').replaceAll('&amp;', '&');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const failures = [];

const expect = (condition, message) => { if (!condition) failures.push(message); };

expect(fs.existsSync(pdfPath), 'printable PDF is missing');
if (fs.existsSync(pdfPath)) {
  const bytes = fs.readFileSync(pdfPath);
  expect(bytes.subarray(0, 5).toString() === '%PDF-', 'resource is not a PDF');
  expect(bytes.length < 500000, 'PDF is too large for a lightweight download');
  const info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
  const extracted = execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8' });
  expect(/Pages:\s+1\b/.test(info), 'PDF must be one page');
  expect(/Page size:\s+595\.\d+ x 841\.\d+ pts \(A4\)/.test(info), 'PDF must be A4');
  for (const marker of [
    'Baby care handover sheet',
    'What has happened so far',
    'What the next carer needs to know',
    'Medicine and safety',
    'Hand back without another recap',
    'not a medical record',
  ]) expect(extracted.includes(marker), `PDF text is missing: ${marker}`);
}

const downloadPath = '/resources/obubba-baby-care-handover-sheet.pdf';
expect(page.includes(`id="download-handover-pdf" href="${downloadPath}?utm_source=owned_search&utm_medium=download&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_handover_printable" download`), 'page is missing the attributed PDF download');
expect(page.includes('free one-page OBubba handover sheet'), 'page does not explain when the printable helps');
expect(sitemap.includes(`<loc>https://obubba.com${downloadPath}</loc>`), 'PDF is missing from the sitemap');
expect(llms.includes(`[printable baby care handover sheet](https://obubba.com${downloadPath})`), 'PDF is missing from the AI-readable index');

if (failures.length) {
  console.error(`Handover printable audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Handover printable audit passed: one-page A4 resource, safety boundary, attributed download and discovery are present.');
