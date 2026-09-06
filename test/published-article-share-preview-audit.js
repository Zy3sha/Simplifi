#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const cutoff = process.env.OBUBBA_PUBLISH_CUTOFF || new Date().toISOString().slice(0, 10);
const sourceDir = 'content/blog';
let checked = 0;

function field(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return (match?.[1] || '').replace(/^['"]|['"]$/g, '').trim();
}

for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md'))) {
  const source = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const frontMatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const publishDate = field(frontMatter, 'date');
  if (!publishDate || publishDate > cutoff) continue;

  const slug = field(frontMatter, 'slug') || file.replace(/\.md$/, '');
  const hero = field(frontMatter, 'heroImage');
  const selected = field(frontMatter, 'ogImage') || hero;
  if (!selected) throw new Error(`${file} has no article-specific share image`);

  if (selected.startsWith('/')) {
    const asset = selected.slice(1);
    if (!fs.existsSync(asset)) throw new Error(`${file} references missing share image ${selected}`);
  }

  const absolute = selected.startsWith('http') ? selected : `https://obubba.com${selected}`;
  const page = fs.readFileSync(`blog/${slug}.html`, 'utf8');
  for (const marker of [
    `<meta property="og:image" content="${absolute}"`,
    `<meta name="twitter:image" content="${absolute}"`,
    `"image": "${absolute}"`,
  ]) {
    if (!page.includes(marker)) throw new Error(`${file} is missing generated share marker: ${marker}`);
  }
  checked += 1;
}

if (!checked) throw new Error('No published articles were checked');
console.log(`Published article share preview audit passed: ${checked} articles use present, deployable hero artwork.`);
