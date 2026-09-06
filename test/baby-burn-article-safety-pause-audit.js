import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const articlePath = 'content/blog/what-to-do-baby-burn-scald-first-aid.md';
const outputPath = 'blog/what-to-do-baby-burn-scald-first-aid.html';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');

assert.match(article, /^status: paused$/m, 'the baby-burn article must remain paused');
assert.match(
  article,
  /^pauseReason: .*separates 111, A&E and 999 routes.*$/m,
  'the pause reason must preserve the emergency-routing conflict',
);
assert.ok(
  renderer.indexOf("post.status === 'paused'") < renderer.indexOf("BLOG_INCLUDE_SCHEDULED === '1') return true"),
  'paused posts must be excluded before scheduled preview',
);

execFileSync('node', ['tools/render-seo.mjs'], {
  env: { ...process.env, BLOG_INCLUDE_SCHEDULED: '1' },
  stdio: 'pipe',
});

assert.equal(
  fs.existsSync(outputPath),
  false,
  'the baby-burn article must be absent even from a scheduled preview build',
);

console.log('Baby-burn article safety-pause audit passed');
