import { execFileSync } from 'node:child_process';

const host = 'obubba.com';
const origin = `https://${host}/`;
const key = '6efaeec964d412605caae564596f4d6b';
const keyLocation = `${origin}${key}.txt`;

function deployedUrl(path) {
  if (path === 'index.html') return origin;
  if (/^[^/]+\.html$/.test(path)) return new URL(path, origin).href;
  if (/^blog\/[^/]+\.html$/.test(path)) return new URL(path, origin).href;
  if (/^press\/[^/]+\.pdf$/.test(path)) return new URL(path, origin).href;
  return null;
}

let changedPaths;
try {
  changedPaths = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACDMRT', 'HEAD^', 'HEAD'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .map((path) => path.trim())
    .filter(Boolean);
} catch (error) {
  console.error('Unable to calculate the deployed change set.');
  throw error;
}

const urlList = [...new Set(changedPaths.map(deployedUrl).filter(Boolean))];

if (urlList.length === 0) {
  console.log('No changed canonical HTML or press PDF URLs to submit.');
  process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});
const responseBody = await response.text();

console.log(JSON.stringify({
  status: response.status,
  statusText: response.statusText,
  submittedUrls: urlList.length,
  urlList,
}, null, 2));

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed: ${response.status} ${response.statusText} ${responseBody}`);
}
