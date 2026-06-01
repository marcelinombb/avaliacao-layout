# Roadmap: avaliacao-layout

## Overview

This milestone refactors the library's public API surface: first establishing a clean, typed input contract and enforcing strict types on domain entities, then wiring up the `fromProvaModelo3()` adapter and fixing known builder defects, and finally documenting the new contract so consuming developers can integrate without inspecting source code.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Type Foundation** - Define `AssessmentInput` and typed domain entities, eliminating `any` on all public API surfaces (completed 2026-06-01)
- [ ] **Phase 2: Adapter & Builder** - Implement `fromProvaModelo3()` adapter and clean up the builder API
- [ ] **Phase 3: Documentation** - Write README contract docs and JSDoc for the builder

## Phase Details

### Phase 1: Type Foundation

**Goal**: Consuming developers can import and use a fully typed `AssessmentInput` interface with no `any` on any public boundary
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INPUT-01, INPUT-02, TYPES-01, TYPES-02
**Success Criteria** (what must be TRUE):

  1. Developer can import `AssessmentInput` from the package and TypeScript resolves all its fields without `any`
  2. `AssessmentInput` has typed sub-interfaces for layout config, questions, and attachments — no field is typed as `any`
  3. `domain/Assessment` and `domain/Question` entities expose no `any`-typed fields on paths accessed during rendering (textoBase, comando, alternativas, afirmacoes, etc.)
  4. `QuestionContent` interface covers all fields rendered by Handlebars templates: textoBase, comando, instrucao, fonte, alternativas, afirmacoes, associacoes, assercoes
  5. TypeScript compilation (`tsc --noEmit`) succeeds with no type errors introduced by the new interfaces

**Plans**: 2 plans

Plans:

- [x] 01-01-PLAN.md — Create AssessmentInput public type contract and wire into index.ts (INPUT-01, INPUT-02)
- [x] 01-02-PLAN.md — Narrow any fields in Question and Assessment domain entities (TYPES-01, TYPES-02)

### Phase 2: Adapter & Builder

**Goal**: Consuming developers can pass a raw `provaModelo3` backend response through `fromProvaModelo3()` and receive a valid `AssessmentInput`; the builder API exposes no dead or duplicated methods
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: INPUT-03, BUILDER-01, BUILDER-02
**Success Criteria** (what must be TRUE):

  1. `fromProvaModelo3()` is exported as a named function from the package and accepts the current `provaModelo3` backend shape without any changes to the backend
  2. Calling `fromProvaModelo3(provaModelo3)` in the browser dev harness produces an `AssessmentInput` that renders identically to the previous raw-input path (pixel-identical HTML output)
  3. `LayoutAvaliacaoBuilder` exposes exactly one watermark-rascunho method with the correct spelling (`marcaDaguaRascunho`); the typo variant is removed or deprecated
  4. The dead `pagina` field is removed from `LayoutAvaliacaoBuilder` — it no longer appears in the constructor or type signature

**Plans**: TBD

### Phase 3: Documentation

**Goal**: A developer new to the library can understand the full input contract and builder API from the README and JSDoc alone, without reading source code
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):

  1. README contains a complete minimal example showing how to construct an `AssessmentInput` and call the library — all required fields are shown
  2. README contains a `fromProvaModelo3()` usage section explaining how existing consumers can migrate from the raw backend shape
  3. Every public builder method has a JSDoc comment stating what it does, what values are valid, and whether it is optional

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Type Foundation | 2/2 | Complete   | 2026-06-01 |
| 2. Adapter & Builder | 0/? | Not started | - |
| 3. Documentation | 0/? | Not started | - |
