#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/health-visitor-appointment-baby-tracking-checklist.md',
  'utf8',
);

const expected = [
  '**Care → Reports**',
  '**Copy report for your GP / health visitor**',
  '**4-week summary PDF (for clinic)**',
  '**Prep sheet for a doctor visit**',
  'parent-logged summary, not a medical record',
  '38°C or higher under 3 months',
  '39°C or higher at 3 to 6 months',
  'temperature below 36°C',
  'when-to-get-urgent-medical-help-for-babies-and-children-under-5',
  'utm_source=health_visitor_article',
  'utm_content=auto_20260910_health_visitor',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing health-visitor truth marker: ${marker}`);
}

if (/green vomit/.test(source)) {
  throw new Error('Do not retain the stale urgent-care wording attributed to the replaced NHS page');
}

console.log('Health-visitor article truth audit passed: current report routes, medical boundary, NHS urgent thresholds and acquisition attribution are present.');
