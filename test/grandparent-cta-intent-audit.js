#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.resolve(__dirname, '..', 'baby-tracker-for-grandparents.html'), 'utf8');
const checks = [
  ['cookieless analytics consent', page.includes("analytics_storage: 'denied'") && page.includes("ad_storage: 'denied'")],
  ['no automatic page view', page.includes('send_page_view: false')],
  ['fixed store-click event', page.includes("gtag('event', 'store_click'")],
  ['fixed owned-search attribution', page.includes("ob_source: 'owned_search'") && page.includes("ob_medium: 'seo'")],
  ['fixed campaign', page.includes("ob_campaign: 'from_bump_to_baby_auto'")],
  ['unique intent label', page.includes('auto_20260905_grandparent_handover_intent')],
  ['no query string in page location', page.includes('page_location: location.origin + location.pathname')],
  ['both store destinations measured', page.includes("'app_store'") && page.includes("'google_play'")],
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Grandparent CTA intent audit failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('Grandparent CTA intent audit passed: privacy-bounded iPhone and Android store intent measurement is present.');
