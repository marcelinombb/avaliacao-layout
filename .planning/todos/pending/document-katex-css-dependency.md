---
name: document-katex-css-dependency
title: Document KaTeX CSS dependency in README
date: 2026-06-02
priority: medium
---

The library bundles KaTeX JS but requires the consumer to load KaTeX CSS and fonts separately. This is currently undocumented.

## What to add to README

- A "Requirements" or "Setup" section explaining that KaTeX CSS must be loaded by the consumer
- The CDN `<link>` tag to copy-paste:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css">
```

- A note that the fonts are served alongside that CSS by the CDN — no extra setup needed
- Optionally: mention that any KaTeX-compatible CSS source works (self-hosted, npm package, etc.)
