const fs = require('node:fs');

const expectations = [
  ['privacy.html', 'https://obubba.com/privacy.html'],
  ['terms.html', 'https://obubba.com/terms.html'],
];

for (const [file, canonical] of expectations) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    throw new Error(`${file} is missing its exact canonical URL`);
  }
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || '';
  if (description.length < 70 || description.length > 160) {
    throw new Error(`${file} has an invalid search-description length: ${description.length}`);
  }
}

const terms = fs.readFileSync('terms.html', 'utf8');
if (terms.includes('href="/privacy"')) {
  throw new Error('Terms still links to the non-canonical privacy route');
}

console.log('trust page SEO audit passed');
