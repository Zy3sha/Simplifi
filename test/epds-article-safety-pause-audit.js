import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const articlePath = 'content/blog/what-is-epds-postnatal-mood-check.md';
const outputPath = 'blog/what-is-epds-postnatal-mood-check.html';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');

assert.match(article, /^status: paused$/m, 'the EPDS article must remain paused');
assert.match(article, /^pauseReason: .*required author, title and source acknowledgement.*$/m,
  'the pause reason must preserve the EPDS reproduction-attribution dependency');
assert.ok(
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"),
  'paused posts must be excluded before scheduled preview',
);

execFileSync('node', ['tools/render-seo.mjs'], {
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

assert.equal(fs.existsSync(outputPath), false,
  'the EPDS article must be absent even from a scheduled preview build');

console.log('EPDS article safety-pause audit passed');
