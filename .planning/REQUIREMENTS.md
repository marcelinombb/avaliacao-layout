# Requirements: avaliacao-layout

**Defined:** 2026-06-01
**Core Value:** Given any well-formed assessment input, produce a pixel-perfect, print-ready HTML document — every question rendered correctly, every page laid out properly.

## v1 Requirements

### Input Contract

- [ ] **INPUT-01**: Library accepts a clean `AssessmentInput` type as the primary input — contains only fields the renderer actually uses, with no backend DB shape leakage
- [ ] **INPUT-02**: `AssessmentInput` defines typed sub-interfaces for layout config, questions, and attachments — no `any` on the public API boundary
- [ ] **INPUT-03**: `fromProvaModelo3()` adapter exported from the package — accepts the current `provaModelo3` backend shape and returns `AssessmentInput`, enabling gradual migration

### Type Safety

- [ ] **TYPES-01**: Domain entities (`Assessment`, `Question`) use explicit typed interfaces — no `any` on fields accessed during rendering (textoBase, comando, alternativas, afirmacoes, etc.)
- [ ] **TYPES-02**: `QuestionContent` interface covers all fields rendered by Handlebars templates: `textoBase`, `comando`, `instrucao`, `fonte`, `alternativas`, `afirmacoes`, `associacoes`, `assercoes`

### Builder Cleanup

- [ ] **BUILDER-01**: `marcaDaguaRascunho()` / `marcaDaquaRascunho()` duplication resolved — single correctly-named method; old typo variant deprecated or removed
- [ ] **BUILDER-02**: Dead `pagina` field removed from `LayoutAvaliacaoBuilder` — it is initialized in the constructor but never used in `build()`

### Documentation

- [ ] **DOCS-01**: README documents the new `AssessmentInput` interface with a complete minimal example showing how to call the library
- [ ] **DOCS-02**: README documents `fromProvaModelo3()` usage for existing consumers migrating from the old backend shape
- [ ] **DOCS-03**: Builder methods are documented (JSDoc comments) — what each method does, valid values, and which are optional

## v2 Requirements

Deferred to a future milestone.

### Deferred

- **BUILDER-03**: Clarify `handlers: []` in `build()` output — document what it's for or remove from the return shape (currently always empty; handlers injected externally by host app)
- **TESTING**: Add a test framework and unit tests for the rendering pipeline and the `fromProvaModelo3()` adapter
- **STRICT-TYPES**: Enable TypeScript `strict` mode and `noImplicitAny` globally — requires broader refactor

## Out of Scope

| Feature | Reason |
|---------|--------|
| Change `visualizaQuestao` to flat/nested fields | Explicitly chosen not to change this structure — lib continues to `JSON.parse` it internally |
| Server-side / Node.js rendering | `PagedJsRenderer` is browser-only; no SSR path in this milestone |
| Backend API changes | Adapter pattern handles translation; backend migration is optional |
| New question types | No new rendering capabilities in this milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPUT-01 | Phase 1 | Pending |
| INPUT-02 | Phase 1 | Pending |
| INPUT-03 | Phase 2 | Pending |
| TYPES-01 | Phase 1 | Pending |
| TYPES-02 | Phase 1 | Pending |
| BUILDER-01 | Phase 2 | Pending |
| BUILDER-02 | Phase 2 | Pending |
| DOCS-01 | Phase 3 | Pending |
| DOCS-02 | Phase 3 | Pending |
| DOCS-03 | Phase 3 | Pending |
