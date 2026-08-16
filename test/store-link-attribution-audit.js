#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CAMPAIGN = 'from_bump_to_baby_auto';
const APPLE_APP_ID = '6760968757';
const NON_STORE_ACQUISITION_PAGES = new Set(['for-professionals.html']);

function decodedHtml(file) {
  return fs.readFileSync(file, 'utf8').replaceAll('&amp;', '&');
}

function hrefs(html, host) {
  const pattern = new RegExp(`href=["'](https://${host.replaceAll('.', '\\.')}/[^"']+)["']`, 'g');
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function auditAppleLinks(page, html, failures) {
  const appLinks = hrefs(html, 'apps.apple.com')
    .filter((link) => new URL(link).pathname.endsWith(`/id${APPLE_APP_ID}`));
  if (!appLinks.length) failures.push(`${page}: no OBubba App Store CTA found`);

  for (const link of appLinks) {
    const url = new URL(link);
    if (/^\/[a-z]{2}\//i.test(url.pathname)) {
      failures.push(`${page}: App Store URL forces a country storefront (${url.pathname})`);
    }
    if (url.searchParams.has('ct') && !url.searchParams.has('pt')) {
      failures.push(`${page}: Apple campaign token has no provider token`);
    }
  }
}

const renderer = fs.readFileSync(path.join(ROOT, 'tools', 'render-seo.mjs'), 'utf8');
const topicSection = renderer.split('function siteCss')[0];
const topics = [...topicSection.matchAll(/^    slug: '([^']+)',$/gm)].map((match) => match[1]);
const posts = fs.readdirSync(path.join(ROOT, 'content', 'blog'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -3));

const pages = [
  'best-baby-tracker.html',
  ...topics.map((slug) => `${slug}.html`),
  ...posts.map((slug) => path.join('blog', `${slug}.html`)),
];

const failures = [];
const contentByPage = new Map();

for (const page of pages) {
  const file = path.join(ROOT, page);
  const html = decodedHtml(file);
  const playLinks = hrefs(html, 'play.google.com');
  if (!playLinks.length && !NON_STORE_ACQUISITION_PAGES.has(page)) {
    failures.push(`${page}: no Google Play CTA found`);
  }

  for (const link of playLinks) {
    const url = new URL(link);
    if (url.searchParams.get('id') !== 'com.obubba.app') {
      failures.push(`${page}: unexpected package in ${link}`);
      continue;
    }
    const encodedReferrer = url.searchParams.get('referrer');
    if (!encodedReferrer) {
      failures.push(`${page}: Google Play CTA has no referrer`);
      continue;
    }
    if (encodedReferrer.length > 512) failures.push(`${page}: referrer exceeds 512 characters`);
    const referrer = new URLSearchParams(encodedReferrer);
    const expected = {
      utm_source: 'owned_search',
      utm_medium: 'seo',
      utm_campaign: CAMPAIGN,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (referrer.get(key) !== value) failures.push(`${page}: ${key} is not ${value}`);
    }
    const content = referrer.get('utm_content');
    if (!content) failures.push(`${page}: utm_content is missing`);
    else if (contentByPage.has(content) && contentByPage.get(content) !== page) {
      failures.push(`${page}: utm_content duplicates ${contentByPage.get(content)} (${content})`);
    } else {
      contentByPage.set(content, page);
    }
  }

  auditAppleLinks(page, html, failures);
}


for (const page of ['index.html', 'blog/index.html', 'obubba-visual-identity.html', 'referral.html']) {
  auditAppleLinks(page, decodedHtml(path.join(ROOT, page)), failures);
}

const referralPage = 'referral.html';
const referralLinks = hrefs(decodedHtml(path.join(ROOT, referralPage)), 'play.google.com');
if (referralLinks.length !== 1) {
  failures.push(`${referralPage}: expected one Google Play CTA, found ${referralLinks.length}`);
} else {
  const url = new URL(referralLinks[0]);
  const referrer = new URLSearchParams(url.searchParams.get('referrer') || '');
  const expected = {
    utm_source: 'product_referral',
    utm_medium: 'share_card',
    utm_campaign: CAMPAIGN,
    utm_content: 'referral_landing',
  };
  if (url.searchParams.get('id') !== 'com.obubba.app') {
    failures.push(`${referralPage}: unexpected package`);
  }
  for (const [key, value] of Object.entries(expected)) {
    if (referrer.get(key) !== value) failures.push(`${referralPage}: ${key} is not ${value}`);
  }
  if (referrer.has('code') || referrer.has('referral_code')) {
    failures.push(`${referralPage}: friend code must not enter store attribution`);
  }
}

if (failures.length) {
  console.error(`Store attribution audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Store attribution audit passed: ${pages.length} generated acquisition pages, ${contentByPage.size} unique content IDs, and the privacy-bounded referral CTA.`);
