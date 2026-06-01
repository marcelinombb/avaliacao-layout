# Architecture

## Overview
`avaliacao-layout` is a TypeScript library that converts a raw JSON assessment model (`provaModelo`) into a paginated PDF-ready HTML document. It is distributed as a bundled library (ESM + CJS + UMD) consumed by a host application that renders the output in a browser using Paged.js.

The pipeline has three distinct phases:
1. **Configuration** — caller uses `LayoutAvaliacaoBuilder` (fluent API) to configure options
2. **HTML Generation** — `LayoutAvaliacao` maps raw data → domain entities → Handlebars-rendered HTML string
3. **Pagination** — host app passes the HTML + CSS vars to `PagedJsRenderer` which drives Paged.js to produce paginated DOM output

## Component Map

| Module | Responsibility |
|---|---|
| `LayoutAvaliacaoBuilder` | Fluent builder; public API entry point; produces a frozen config + `layoutHtml` |
| `LayoutAvaliacao` | Orchestrator; maps raw JSON → entities → calls renderer |
| `domain/Assessment` | Domain entity: wraps the full assessment |
| `domain/Question` | Domain entity: wraps a single question with all its fields |
| `domain/ReferenceService` | Processes shared reference/annexe blocks across questions |
| `rendering/AssessmentHtmlRenderer` | Top-level HTML assembler; calls QuestionRenderer per question |
| `rendering/QuestionRenderer` | Renders a single question via Handlebars templates |
| `rendering/QuadroRespostaRenderer` | Renders answer-box component for open-ended questions |
| `rendering/PagedJsRenderer` | Browser-only; injects HTML into DOM and runs Paged.js pagination |
| `rendering/handlers/ColumnHandler` | Paged.js hook: applies 2-column layout via internal pagedjs API |
| `rendering/handlers/HeaderFooterHandler` | Paged.js hook: injects per-page header/footer with height correction |
| `rendering/handlers/OrderHandler` | Paged.js hook: applies alternative ordering to answer options |
| `rendering/handlers/TwoColumnsHandler` | Paged.js hook: handles two-column question layout |
| `rendering/handlers/WatermarkHandler` | Paged.js hook: applies watermark CSS vars per page |
| `rendering/handlers/PreventEmptyPageHandler` | Paged.js hook: intended to remove blank trailing pages (currently inactive) |
| `rendering/utils/latexParser` | Parses LaTeX math expressions and converts via KaTeX |
| `rendering/utils/util` | Shared utility functions |

## Data Flow

```
provaModelo (JSON)
  └─► LayoutAvaliacao._mapToEntity()
        ├─► Assessment (entity)
        └─► Question[] (entities)
              └─► ReferenceService.processReferences()
                    └─► AssessmentHtmlRenderer.render()
                          └─► QuestionRenderer (per question)
                                └─► Handlebars templates (.hbs)
                                      └─► HTML string
                                            └─► LayoutAvaliacaoBuilder.build()
                                                  └─► { layoutHtml, cssVars, folhaDeRosto, ... }
                                                        └─► PagedJsRenderer (browser)
                                                              └─► Paginated DOM / PDF
```

## Design Patterns Used
- **Fluent Builder** (`LayoutAvaliacaoBuilder`) — chainable setters culminating in `.build()`
- **Template Method / Strategy** — Handlebars `.hbs` templates per question type
- **Hook/Handler pattern** — Paged.js lifecycle hooks, each in its own handler class
- **Entity mapping** — raw JSON mapped to domain objects before rendering
- **Frozen return value** — `Object.freeze()` on `build()` output prevents mutation

## Entry Points
- `src/index.ts` — re-exports `LayoutAvaliacaoBuilder` and `LayoutAvaliacao`
- `src/LayoutAvaliacaoBuilder.ts` — primary public API

## Build / Output Artifacts
| File | Format | Purpose |
|---|---|---|
| `dist/avaliacao-layout.esm.js` | ESM | Modern bundlers |
| `dist/avaliacao-layout.cjs` | CJS | Node.js require |
| `dist/avaliacao-layout.umd.js` | UMD | Browser `<script>` tag |
| `dist/avaliacao-layout.d.ts` | TypeScript declarations | Type checking |
| `dist/index.d.ts` | Re-export declarations | Package types entry |
