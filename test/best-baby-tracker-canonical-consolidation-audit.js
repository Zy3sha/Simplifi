#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const oldPath = '/blog/best-baby-tracker-app-for-new-parents.html';
const targetPath = '/blog/best-baby-tracker-app-uk.html';
const redirect = fs.readFileSync(path.join(root, oldPath), 'utf8');
const target = fs.readFileSync(path.join(root, targetPath), 'utf8');
const failures = [];

for (const required of [
  `<meta http-equiv="refresh" content="0; url=${targetPath}"/>`,
  `<link rel="canonical" href="https://obubba.com${targetPath}"/>`,
  `<a href="${targetPath}">Continue to OBubba Blog</a>`,
]) {
  if (!redirect.includes(required)) failures.push(`redirect missing: ${required}`);
}

for (const required of [
  'Best Baby Tracker Apps UK 2026: 5 Options Compared',
  'This comparison is published by OBubba, so it is not an independent ranking.',
]) {
  if (!target.includes(required)) failures.push(`target missing: ${required}`);
}

for (const file of ['sitemap.xml', 'feed.xml', 'llms.txt', 'blog/index.html']) {
  const contents = fs.readFileSync(path.join(root, file), 'utf8');
  if (contents.includes(oldPath)) failures.push(`${file} still discovers the superseded URL`);
  if (!contents.includes(targetPath)) failures.push(`${file} does not discover the canonical comparison URL`);
}

if (failures.length) {
  throw new Error(`Best baby tracker canonical consolidation failed:\n${failures.join('\n')}`);
}

console.log('Best baby tracker canonical consolidation passed: old URL redirects and only the comparison URL remains discoverable.');
