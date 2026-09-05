const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const files = ['index.html', 'press.html'];
const profiles = [
  'https://www.instagram.com/obubba_app/',
  'https://www.tiktok.com/@obubba_app',
  'https://www.facebook.com/people/OBubba/61583683947795/',
];

for (const file of files) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const profile of profiles) {
    const count = text.split(profile).length - 1;
    if (count !== 2) throw new Error(`${file}: expected schema and visible links for ${profile}; found ${count}`);
  }
}

const homepage = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const press = fs.readFileSync(path.join(ROOT, 'press.html'), 'utf8');
for (const text of [homepage, press]) {
  if (!text.includes('target="_blank" rel="noopener"')) throw new Error('Visible social links must open safely');
}

const renderer = fs.readFileSync(path.join(ROOT, 'tools/render-seo.mjs'), 'utf8');
for (const profile of profiles) {
  if (!renderer.includes(profile)) throw new Error(`Renderer is missing official profile ${profile}`);
}
if (!renderer.includes('...SITE.socialUrls')) throw new Error('Generated organization schema does not use the official social profile list');

console.log('Official social entity audit passed: canonical schema and visible website links use the verified OBubba profiles.');
