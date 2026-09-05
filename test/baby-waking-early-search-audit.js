#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'blog', 'baby-waking-early-4am-morning.html'),
  'utf8',
);
const source = fs.readFileSync(
  path.join(root, 'content', 'blog', 'baby-waking-early-4am-morning.md'),
  'utf8',
);

const title = 'Baby Waking at 4am? What to Check First | OBubba';
const sourceTitle = 'Baby Waking at 4am? What to Check First';
const description = 'Baby waking at 4am and not resettling? Check feeds, naps, bedtime and early-morning light, with gentle practical steps for reading the pattern.';

const checks = [
  ['HTML title matches the approved treatment', page.includes(`<title>${title}</title>`)],
  ['HTML meta description matches the approved treatment', page.includes(`<meta name="description" content="${description}"/>`)],
  ['Open Graph title is consistent', page.includes(`<meta property="og:title" content="${title}"/>`)],
  ['Open Graph description is consistent', page.includes(`<meta property="og:description" content="${description}"/>`)],
  ['Twitter title is consistent', page.includes(`<meta name="twitter:title" content="${title}"/>`)],
  ['Twitter description is consistent', page.includes(`<meta name="twitter:description" content="${description}"/>`)],
  ['Canonical remains unchanged', page.includes('<link rel="canonical" href="https://obubba.com/blog/baby-waking-early-4am-morning.html"/>')],
  ['Markdown title matches the HTML treatment', source.includes(`title: "${sourceTitle}"`)],
  ['Markdown description matches the HTML treatment', source.includes(`description: "${description}"`)],
  ['Search title stays within 60 characters', title.length <= 60],
  ['Description stays within 160 characters', description.length <= 160],
];

const failures = checks.filter(([, passed]) => !passed);
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL: ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS: ${label}`);
