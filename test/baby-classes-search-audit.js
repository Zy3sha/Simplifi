#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const slug = 'baby-classes-near-me-real-life-guide';
const page = fs.readFileSync(path.join(root, 'blog', `${slug}.html`), 'utf8');
const source = fs.readFileSync(path.join(root, 'content', 'blog', `${slug}.md`), 'utf8');
const index = fs.readFileSync(path.join(root, 'blog', 'index.html'), 'utf8');
const feed = fs.readFileSync(path.join(root, 'feed.xml'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');

const checks = [
  ['source of truth exists', source.includes(`slug: ${slug}`)],
  ['canonical URL', page.includes(`https://obubba.com/blog/${slug}.html`)],
  ['single h1', (page.match(/<h1\b/g) || []).length === 1],
  ['answer-first title', page.includes('Baby Classes Near Me: How to Find One That Fits Real Life')],
  ['does not claim class discovery feature', !/OBubba (finds|lists|recommends) (local )?(classes|groups)/i.test(page)],
  ['partner sharing is invitation-based', page.includes('invited partner')],
  ['medical boundary', page.includes('not medical advice')],
  ['exact campaign attribution', page.includes('utm_content=auto_20260905_baby_classes_real_life')],
  ['blog index discovery', index.includes(`/blog/${slug}.html`)],
  ['feed discovery', feed.includes(`https://obubba.com/blog/${slug}.html`)],
  ['sitemap discovery', sitemap.includes(`https://obubba.com/blog/${slug}.html`)],
  ['AI-readable discovery', llms.includes(`https://obubba.com/blog/${slug}.html`)],
  ['press page remains discoverable', sitemap.includes('https://obubba.com/press.html') && llms.includes('[press and media resources](https://obubba.com/press.html)')],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  failures.forEach(([label]) => console.error(`FAIL: ${label}`));
  process.exit(1);
}

checks.forEach(([label]) => console.log(`PASS: ${label}`));
