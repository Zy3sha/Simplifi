#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/how-to-read-bedtime-stories-to-a-baby.md',
  'utf8',
);
const page = fs.readFileSync(
  'blog/how-to-read-bedtime-stories-to-a-baby.html',
  'utf8',
);

const imagePath = '/obubba-bedtime-story-baby-wont-sit-still.jpg';
const absoluteImage = `https://obubba.com${imagePath}`;

if (!source.includes(`ogImage: ${imagePath}`)) {
  throw new Error('Bedtime-story source must select its purpose-made share image');
}

for (const marker of [
  `<meta property="og:image" content="${absoluteImage}"`,
  `<meta name="twitter:image" content="${absoluteImage}"`,
  `"image": "${absoluteImage}"`,
]) {
  if (!page.includes(marker)) {
    throw new Error(`Missing bedtime-story share-preview marker: ${marker}`);
  }
}

if (page.includes('<meta property="og:image" content="https://obubba.com/og-image.png"')) {
  throw new Error('Bedtime-story share preview must not fall back to the generic site image');
}

console.log('Bedtime-story share preview audit passed: Open Graph, Twitter and article schema use the purpose-made artwork.');
