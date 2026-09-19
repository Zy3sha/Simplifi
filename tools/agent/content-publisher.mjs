// Autonomous SEO content agent. Picks the next unpublished topic from
// marketing/agent-topics.json, asks Anthropic to write a sleep-positioned article,
// and writes it to content/blog/<slug>.md as `status: draft` (a human flips it to
// publish). Then regenerates the site. The workflow commits the result.
//
// SAFETY: everything it writes is status:draft, so nothing goes live without a human
// flipping the flag. Baby content stays reviewed-before-publish.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { anthropic } from './anthropic.mjs';

const ROOT = process.cwd();
const HERO = '/obubba-baby-sleep-timer-fireflies.png';
const today = new Date().toISOString().slice(0, 10);

const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'marketing', 'agent-topics.json'), 'utf8'));
const next = topics.find((t) => !fs.existsSync(path.join(ROOT, 'content', 'blog', `${t.slug}.md`)));
if (!next) { console.log('No unpublished topics left in agent-topics.json. Nothing to do.'); process.exit(0); }

const system = `You are a warm, evidence-informed baby-sleep writer for OBubba, the best baby SLEEP app.
Lead with the OBubba angle: accurate nap prediction from the baby's own rhythm, and how the right naps plus a steady bedtime routine fix a baby's sleep. Keep "OBubba" and "Luna" (the in-app coach) as-is. Never fabricate statistics or accuracy figures. No "#1", no medical/treatment claims. British English.`;

const prompt = `Write an SEO blog article for OBubba.
Topic: "${next.title}"
Primary keyword (use in the first 100 words and a heading): "${next.keyword}"

Return ONLY a JSON object, no markdown fences, with exactly:
{"description": "<=155-char meta description, includes the primary keyword>",
 "body": "<the article body in markdown, ~700-1000 words, using ## and ### headings and - bullets, leading with the sleep-fix angle, 2-3 natural mentions of how OBubba predicts naps / Luna explains night wakes, and ending with this exact disclaimer paragraph on its own line: 'OBubba is not medical advice and does not diagnose, prevent or treat health, feeding or sleep conditions. Always speak to your midwife, health visitor, GP, doctor or qualified professional for medical concerns.'>"}
Do NOT include YAML front matter or an H1 title in the body (the site adds those).`;

const raw = await anthropic({ system, prompt, maxTokens: 4000 });
let parsed;
try { parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '')); }
catch (e) { console.error('Model did not return valid JSON. Aborting without writing.'); process.exit(1); }

const body = String(parsed.body || '').trim();
const description = String(parsed.description || '').trim().slice(0, 160);
if (body.split(/\s+/).length < 300) { console.error('Body too short, aborting.'); process.exit(1); }
if (!/not medical advice/i.test(body)) { console.error('Missing disclaimer, aborting.'); process.exit(1); }

const tags = `${next.keyword}, baby sleep, baby sleep tracker, nap predictor, bedtime routine, OBubba`;
const frontMatter = `---
title: "${next.title.replace(/"/g, "'")}"
slug: ${next.slug}
description: "${description.replace(/"/g, "'")}"
date: ${today}
updated: ${today}
author: OBubba
tags: ${tags}
heroImage: ${HERO}
status: draft
---

`;

fs.writeFileSync(path.join(ROOT, 'content', 'blog', `${next.slug}.md`), frontMatter + body + '\n');
console.log(`Wrote DRAFT content/blog/${next.slug}.md (${body.split(/\s+/).length} words). Flip status:draft to publish after review.`);

// Regenerate so sitemap/index stay consistent (draft posts are excluded from output).
execSync('node tools/render-seo.mjs', { cwd: ROOT, stdio: 'inherit' });
