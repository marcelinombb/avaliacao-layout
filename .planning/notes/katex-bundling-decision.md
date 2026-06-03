---
name: katex-bundling-decision
title: KaTeX bundling decision
date: 2026-06-02
context: Explored whether to bundle KaTeX CSS/fonts into the library output
---

## Decision

KaTeX JS is bundled into the library. KaTeX CSS and fonts are intentionally left as a consumer responsibility.

## Rationale

- KaTeX JS is a runtime dependency already included in the bundle — consumers don't install it
- KaTeX CSS + fonts are not inlined because it keeps the bundle lean and gives consumers flexibility over font delivery (CDN, self-hosted, npm)
- The "cost" to the consumer is a single `<link>` tag — acceptable friction
- Inlining fonts as base64 would significantly bloat the bundle with no practical benefit for this use case

## What this means for consumers

They must load KaTeX CSS before rendering. The simplest way is a CDN link:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css">
```
