# OBubba blog publishing

The blog is static and SEO-friendly. Source posts live in `content/blog/*.md`; generated pages are written to `blog/`, `public/blog/`, `dist/blog/` and `hosting-care/blog/`.

To publish a new blog draft:

1. Add a Markdown file in `content/blog/` with front matter:

```md
---
title: Your post title
slug: your-post-slug
description: One sentence for Google and social previews.
date: 2026-04-30
updated: 2026-04-30
author: OBubba
tags: baby tracker app, parenting app
heroImage: /obubba-happy.png
---

## First heading

Your blog content.
```

2. Run:

```sh
node tools/render-seo.mjs
```

This also refreshes `sitemap.xml`, `feed.xml`, `robots.txt` and `llms.txt`.

When you paste a blog draft to Codex, ask: "publish this to OBubba blog" and Codex should create the Markdown file, run `node tools/render-seo.mjs`, then show the new URL.
