# avaliacao-layout

## What This Is

A TypeScript library that converts a JSON assessment model into a paginated, PDF-ready HTML document. It renders assessment questions (multiple choice, open-ended, assertions, associations) using Handlebars templates and KaTeX for math, paginated in the browser via Paged.js. Currently consumed by a single host application that owns the backend producing the input data.

## Core Value

Given any well-formed assessment input, produce a pixel-perfect, print-ready HTML document — every question rendered correctly, every page laid out properly.

## Requirements

### Validated

- ✓ Renders multiple-choice questions (alternativas) — existing
- ✓ Renders open-ended questions with answer lines — existing
- ✓ Renders assertions (afirmacoes), associations, and statement-based questions — existing
- ✓ Renders LaTeX math expressions via KaTeX — existing
- ✓ 2-column layout support via Paged.js handler — existing
- ✓ Watermark rendering (institution logo, scratch paper) — existing
- ✓ Per-page header/footer injection — existing
- ✓ Alternative answer ordering (shuffle, ascending, descending) — existing
- ✓ Fluent builder API (`LayoutAvaliacaoBuilder`) — existing
- ✓ Distributed as ESM + CJS + UMD bundles — existing

### Active

- [ ] Clean, minimal TypeScript input interface — only fields the renderer uses, no backend DB shape leakage
- [ ] `fromProvaModelo3()` adapter — maps current deep backend JSON to the new clean input
- [ ] Strict TypeScript types — eliminate `any` on all public API surfaces and domain entities
- [ ] Builder API cleanup — fix `marcaDagua` typo/duplicate, remove dead `pagina` field, fix `handlers: []` always empty
- [ ] Public API documentation (README) — documents the new input contract, builder methods, and adapter usage

### Out of Scope

- Changing `visualizaQuestao` structure — remains a JSON string embedded in the question object; the lib continues to parse it internally
- Server-side / Node.js rendering — `PagedJsRenderer` is browser-only and stays that way
- Backend API changes — adapter handles the translation; backend migration is optional and gradual
- Test infrastructure — no test framework will be added in this milestone

## Context

The library was built to consume `provaModelo3`, the raw JSON response shape from the Exitus backend API. This shape is a direct database serialization: it includes 50+ fields the renderer never uses (institution metadata, pagination cursors, status codes, list relationships), a `layout` object with 25+ fields many carrying `#PLACEHOLDER#` tokens already interpolated by the backend, and `visualizaQuestao` as a JSON string inside the outer JSON (parsed via `JSON.parse` in `_mapToEntity`).

The host application and backend are owned by the same team, so a new clean input contract is feasible. The `fromProvaModelo3()` adapter allows gradual migration — existing consumers keep working while new integrations use the clean shape.

Key technical facts:
- TypeScript strict mode is OFF (`noImplicitAny: false`) — the new interfaces should enforce types without requiring a strict-mode migration
- The `LayoutAvaliacaoBuilder.build()` always returns `handlers: []` — custom Paged.js handler injection exists in the return shape but is wired up externally by the host app, not through the builder
- `marcaDaguaRascunho()` and `marcaDaquaRascunho()` are duplicate methods (typo variant) that partially overlap
- The `pagina` field on the builder is initialized but never used in `build()`

## Constraints

- **Compatibility**: `fromProvaModelo3()` must accept the exact current `provaModelo3` shape without changes — the backend does not need to change
- **No breaking changes to rendering output**: the HTML output for the same logical question must remain pixel-identical after the refactor
- **No test framework**: validation is manual via the browser dev harness (`npm run dev`)
- **Bundle targets**: ESM + CJS + UMD must all continue to be built and exported

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep `visualizaQuestao` as JSON string | User explicitly chose not to change this structure | The lib continues to `JSON.parse` it internally in `_mapToEntity` |
| New input + adapter pattern | Enables gradual migration; backend doesn't need to change immediately | `fromProvaModelo3()` exported as a named function from the package |
| TypeScript types without strict mode migration | Scope constraint — only public API surfaces need typed interfaces | Use explicit interfaces; don't enable `strict` or `noImplicitAny` globally |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-01 after initialization*
