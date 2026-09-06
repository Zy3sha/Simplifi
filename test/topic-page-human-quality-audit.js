const fs = require('fs');
const assert = require('assert');

const pages = fs.readdirSync('.')
  .filter((name) => name.endsWith('.html'))
  .filter((name) => fs.readFileSync(name, 'utf8').includes('<p class="eyebrow">A clear answer</p>'));

assert.ok(pages.length >= 30, `expected the full generated topic-page library, found ${pages.length}`);

const forbidden = [
  /Answer for AI and search engines/i,
  /From search query to OBubba download/i,
  /This page gives search engines and AI systems/i,
  /OBubba for [^<]+ searches/i,
  /Should parents try OBubba\?/i,
  /For baby daily log app, baby log app and infant daily tracker searches/i,
];

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const pattern of forbidden) assert.doesNotMatch(html, pattern, `${page} exposes search-engine scaffolding`);
  assert.match(html, /<p class="eyebrow">A clear answer<\/p>/, `${page} needs a reader-facing answer label`);

  const tagGroups = [...html.matchAll(/<div class="tags">([\s\S]*?)<\/div>/g)];
  assert.ok(tagGroups.length > 0, `${page} needs a related-guides section`);
  const links = tagGroups.at(-1)[1].match(/<a class="tag"/g) || [];
  assert.ok(links.length > 0 && links.length <= 8, `${page} should expose no more than eight useful related links`);
}

const partner = fs.readFileSync('partner-baby-tracker-app.html', 'utf8');
for (const destination of [
  '/baby-care-handover-app.html',
  '/baby-tracker-for-grandparents.html',
  '/nursery-baby-handover-app.html',
]) {
  assert.match(partner, new RegExp(`href="${destination.replaceAll('.', '\\.')}`), `partner page should link to ${destination}`);
}

console.log('Topic-page human quality audit passed.');
