import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const article = readFileSync(
  new URL('../content/blog/should-i-dream-feed-my-baby.md', import.meta.url),
  'utf8',
);

test('scheduled dream-feed article pins the current app behavior', () => {
  assert.match(article, /during ongoing night sleep without a full wake/);
  assert.match(article, /More[^\n]*separate \*\*Night wake\*\* from \*\*Dream feed\*\*/);
  assert.match(article, /leaves the sleep timer running/);
  assert.match(article, /does not add a false night wake/);
  assert.match(article, /excluded from the baseline used for genuine wake-driven night-weaning plans/);
  assert.match(article, /does not inflate daytime feed counts or anchor a daytime feed reminder/);
  assert.match(article, /excluded from reverse-cycling volume comparisons/);
  assert.match(article, /survives CSV export and re-import as a distinct feed type/);
});

test('scheduled dream-feed article pins the current comparison thresholds', () => {
  assert.match(article, /from \*\*14 weeks corrected age\*\*/);
  assert.match(article, /up to \*\*21 recent nights\*\*/);
  assert.match(article, /at least \*\*four nights with a dream feed and four without\*\*/);
  assert.match(article, /deduplicated genuine-wake count/);
  assert.match(article, /at least \*\*0\.5 wakes per night\*\*/);
  assert.match(article, /five-night trial without the feed/);
  assert.match(article, /useful pattern detection, not causal proof/);
});

test('scheduled dream-feed article states entitlement and one attributable CTA', () => {
  assert.match(article, /Dream-feed logging in \*\*Track\*\* is free/);
  assert.match(article, /personalised dream-feed comparison in \*\*Guidance\*\* is a Premium feature/);
  assert.match(article, /during pregnancy and through the first two corrected-age months/);
  assert.match(article, /Find out whether the dream feed earns its place/);
  const url = '/app.html?utm_source=dream_feed_article&utm_medium=owned_search&utm_campaign=from_bump_to_baby_auto&utm_content=auto_20260929_dream_feed';
  assert.equal(article.split(url).length - 1, 1);
});

test('scheduled dream-feed article keeps responsive-feeding and safer-sleep boundaries', () => {
  assert.match(article, /never force a sleepy baby to feed/);
  assert.match(article, /never force a baby to finish/i);
  assert.match(article, /A larger volume does not guarantee a longer sleep/);
  assert.match(article, /place them on their back in their own firm, flat, clear sleep space/);
  assert.match(article, /Never sleep with a baby on a sofa or armchair/);
  assert.match(article, /not medical advice/);
});
