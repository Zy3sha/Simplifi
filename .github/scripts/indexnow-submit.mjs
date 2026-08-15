import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const host = 'obubba.com';
const origin = `https://${host}/`;
const key = '6efaeec964d412605caae564596f4d6b';
const keyLocation = `${origin}${key}.txt`;

function isNoindexHtml(path) {
  if (!path.endsWith('.html') || !existsSync(path)) return false;
  const metaTags = readFileSync(path, 'utf8').match(/<meta\b[^>]*>/gi) || [];
  return metaTags.some((tag) =>
    /\bname\s*=\s*["']robots["']/i.test(tag)
    && /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag),
  );
}

function deployedUrl(path) {
  if (path === '404.html' || isNoindexHtml(path)) return null;
  if (path === 'index.html') return origin;
  if (/^[^/]+\.html$/.test(path)) return new URL(path, origin).href;
  if (/^blog\/[^/]+\.html$/.test(path)) return new URL(path, origin).href;
  if (/^press\/[^/]+\.pdf$/.test(path)) return new URL(path, origin).href;
  return null;
}

let changedPaths;
try {
  const suppliedPaths = process.env.INDEXNOW_CHANGED_PATHS;
  const changedPathOutput = suppliedPaths || execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACDMRT', 'HEAD^', 'HEAD'],
    { encoding: 'utf8' },
  );
  changedPaths = changedPathOutput
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

if (process.env.INDEXNOW_DRY_RUN === '1') {
  console.log(JSON.stringify({ dryRun: true, submittedUrls: urlList.length, urlList }, null, 2));
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
