# avaliacao-layout

## What This Is

A TypeScript library that converts a typed `AssessmentInput` into a paginated, PDF-ready HTML document. It renders assessment questions (multiple choice, open-ended, assertions, associations) using Handlebars templates and KaTeX for math, paginated in the browser via Paged.js. The public API accepts a clean `AssessmentInput` type — no backend DB shape leakage — with a `fromProvaModelo()` adapter for existing consumers migrating from the raw backend shape.

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
- ✓ Clean `AssessmentInput` type contract — no `any` on public API surfaces — v1.0
- ✓ `fromProvaModelo()` adapter — maps current backend shape to typed `AssessmentInput` — v1.0
- ✓ Strict TypeScript types on domain entities — `Assessment`, `Question`, `QuestionContent` — v1.0
- ✓ Builder API cleanup — `marcaDagua` typo resolved, dead `pagina` field removed — v1.0
- ✓ README documents full input contract, builder API, and adapter migration guide — v1.0
- ✓ JSDoc on all 16 public `LayoutAvaliacaoBuilder` methods — v1.0

### Active

*(No active requirements — ready for next milestone planning)*

### Out of Scope

- Changing `visualizaQuestao` structure — remains a JSON string embedded in the question object; the lib continues to parse it internally
- Server-side / Node.js rendering — `PagedJsRenderer` is browser-only and stays that way
- Backend API changes — adapter handles the translation; backend migration is optional and gradual
- Test infrastructure — no test framework added in v1.0; deferred to v2.0
- `handlers: []` clarification (BUILDER-03) — always empty in builder output; host app wires Paged.js handlers externally; deferred to v2.0
- TypeScript `strict` / `noImplicitAny` global enablement — deferred to v2.0

## Context

**Shipped v1.0** on 2026-06-02 — 3 phases, 7 plans, ~490 net LOC added in TypeScript.

The library now has a clean two-path input model:
1. **New path:** `createLayout().build(assessmentInput)` — uses the typed `AssessmentInput` contract
2. **Migration path:** `createLayout().build(fromProvaModelo(raw))` — adapter translates the legacy backend shape

Tech stack: TypeScript 5.9 (strict OFF), Handlebars templates, KaTeX, Paged.js, Rollup bundles (ESM + CJS + UMD).

Key constraints still in force:
- TypeScript strict mode remains OFF — `noImplicitAny: false` globally
- Validation is manual via `npm run dev` browser harness — no automated test framework
- `visualizaQuestaoRaw` is a JSON string parsed internally — structure not changed

## Constraints

- **Compatibility**: `fromProvaModelo()` must accept the exact current `provaModelo3` shape without changes — the backend does not need to change
- **No breaking changes to rendering output**: the HTML output for the same logical question must remain pixel-identical after any refactor
- **No test framework**: validation is manual via the browser dev harness (`npm run dev`)
- **Bundle targets**: ESM + CJS + UMD must all continue to be built and exported

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep `visualizaQuestao` as JSON string | User explicitly chose not to change this structure | The lib continues to `JSON.parse` it internally in `_mapToEntity` |
| New input + adapter pattern | Enables gradual migration; backend doesn't need to change immediately | `fromProvaModelo()` exported as named function from the package — v1.0 ✓ |
| TypeScript types without strict mode migration | Scope constraint — only public API surfaces need typed interfaces | Explicit interfaces added; `strict`/`noImplicitAny` remain OFF globally — v1.0 ✓ |
| Keep `_marcaDaquaRascunho` private field (D-09) | Internal implementation detail; only the public method spelling was corrected | Private field `_marcaDaquaRascunho` retained; public method is `marcaDaguaRascunho` — v1.0 ✓ |
| `handlers: []` always empty in build() output | Host app wires Paged.js handlers externally by design | Documented in README; clarification/refactor deferred to v2.0 |

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
*Last updated: 2026-06-02 after v1.0 milestone*
