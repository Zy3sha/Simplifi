import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const articlePath = 'content/blog/are-baby-leaps-real-should-use-leap-app.md';
const outputPath = 'blog/are-baby-leaps-real-should-use-leap-app.html';
const article = fs.readFileSync(articlePath, 'utf8');
const renderer = fs.readFileSync('tools/render-seo.mjs', 'utf8');

assert.match(article, /^status: paused$/m, 'the baby-leaps article must remain paused');
assert.match(
  article,
  /^pauseReason: .*Luna's current governing prompt.*wreck sleep, feeding and mood.*$/m,
  'the pause reason must preserve the causal leap-guidance conflict',
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
  'the baby-leaps article must be absent even from a scheduled preview build',
);

console.log('Baby-leaps article safety-pause audit passed');
