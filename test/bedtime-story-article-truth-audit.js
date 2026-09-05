#!/usr/bin/env node

const fs = require('node:fs');

const source = fs.readFileSync(
  'content/blog/how-to-read-bedtime-stories-to-a-baby.md',
  'utf8',
);

const expected = [
  '**Care → Bedtime Stories**',
  '**Choose a bedtime story**',
  '**Track → More logs → Bedtime Story** tile records a story-time moment',
  'The library contains **12 original, curated stories**',
  'Neither can observe your baby or guarantee sleep.',
  '**[Make story time easy to return to →](/app.html?utm_source=bedtime_story_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_bedtime_story)**',
];

for (const marker of expected) {
  if (!source.includes(marker)) throw new Error(`Missing bedtime-story truth marker: ${marker}`);
}

if (/open \*\*Track → Story\*\*/.test(source)) {
  throw new Error('The Track story-time log must not be described as a library route');
}

const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');
for (const asset of [
  'obubba-bedtime-story-baby-wont-sit-still.jpg',
  'obubba-bedtime-stories-library-app.jpg',
]) {
  if (!fs.existsSync(asset)) throw new Error(`Missing bedtime-story source asset: ${asset}`);
  if (!renderer.includes(`'${asset}'`)) throw new Error(`Renderer does not publish bedtime-story asset: ${asset}`);
}

const route = '/app.html?utm_source=bedtime_story_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260906_bedtime_story';
if (source.split(route).length - 1 !== 1) {
  throw new Error('Bedtime-story article must carry one fixed attributable CTA');
}

console.log('Bedtime-story article truth audit passed: current library and logging routes remain distinct.');
