#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CAMPAIGN = 'from_bump_to_baby_auto';

function decodedHtml(file) {
  return fs.readFileSync(file, 'utf8').replaceAll('&amp;', '&');
}

function hrefs(html, host) {
  const pattern = new RegExp(`href=["'](https://${host.replaceAll('.', '\\.')}/[^"']+)["']`, 'g');
  return [...html.matchAll(pattern)].map((match) => match[1]);
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
  if (!playLinks.length) failures.push(`${page}: no Google Play CTA found`);

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

  for (const link of hrefs(html, 'apps.apple.com')) {
    const url = new URL(link);
    if (url.searchParams.has('ct') && !url.searchParams.has('pt')) {
      failures.push(`${page}: Apple campaign token has no provider token`);
    }
  }
}

if (failures.length) {
  console.error(`Store attribution audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Store attribution audit passed: ${pages.length} generated acquisition pages, ${contentByPage.size} unique content IDs.`);
