---
phase: 01-type-foundation
plan: 02
subsystem: domain
tags: [typescript, interfaces, domain-entities, type-narrowing]

# Dependency graph
requires: []
provides:
  - Five new exported interfaces in Question.ts: AfirmacaoItem, AssociacaoItem, AssociacoesContent, AssercoesContent, TipoLinha
  - QuestionContent with all rendering-path fields typed concretely (no any)
  - Question class fields narrowed: afimacoes, associacoes, assercoes, tipoLinha
  - AssessmentLayout with no index signature and no any fields
  - Attachment interface with no index signatures
affects: [01-03, phase-02, phase-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Concrete sub-interfaces for nested rendering-path fields (AfirmacaoItem, AssociacoesContent, etc.)
    - unknown instead of any for fields never accessed in rendering path (mapa, identificado)
    - Preserve class property typos (afimacoes) to avoid Phase 2 rename scope creep

key-files:
  created: []
  modified:
    - src/domain/Question.ts
    - src/domain/Assessment.ts

key-decisions:
  - "Remove visualizaQuestaoParsed?: any from QuestionContent — the class already has visualizaQuestaoParsed: QuestionContent | null as a typed class property"
  - "Use unknown (not any) for mapa and identificado in AssessmentLayout — they have no renderer access"
  - "Preserve class property typo afimacoes (not afirmacoes) — renaming requires updating all call sites, scoped to Phase 2"
  - "Leave content?: any and content: any in QuestionConstructor and Question class — internal implementation detail, not on the public rendering path"

patterns-established:
  - "Sub-interface before parent: declare AfirmacaoItem before QuestionContent that references it (declaration order = dependency order)"
  - "Concrete type narrowing: any[] -> ConcreteType[], any -> ConcreteType | null for nullable objects"

requirements-completed: [TYPES-01, TYPES-02]

# Metrics
duration: 20min
completed: 2026-06-01
---

# Phase 01 Plan 02: Type Foundation Domain Narrowing Summary

**Five typed sub-interfaces added to Question.ts and all any fields eliminated from AssessmentLayout/Attachment — tsc --noEmit exits 0**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-01T14:30:00Z
- **Completed:** 2026-06-01T14:50:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added AfirmacaoItem, AssociacaoItem, AssociacoesContent, AssercoesContent, TipoLinha interfaces to src/domain/Question.ts
- Replaced all any-typed rendering-path fields in QuestionContent, QuestionConstructor, and Question class with concrete types
- Fixed the TipoLinha type mismatch: Question.tipoLinha was string|null but fixture and template access confirmed it is { codigo: number; nome: string } | null
- Removed all [key: string]: any index signatures from AssessmentLayout and Attachment
- Narrowed 7 any fields in AssessmentLayout to concrete types (string|null, boolean|null, number|null, unknown)
- Compiler (tsc --noEmit) and npm run build both exit 0 after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add typed sub-interfaces and narrow any fields in Question.ts** - `13a1611` (feat)
2. **Task 2: Remove index signatures and narrow any fields in Assessment.ts** - `953f73d` (feat)

## Files Created/Modified

- `src/domain/Question.ts` — Added 5 new exported interfaces; narrowed QuestionContent.afirmacoes/associacoes/assercoes; fixed tipoLinha to TipoLinha|null; narrowed Reference.instituicao and totalRegistros; removed visualizaQuestaoParsed?: any
- `src/domain/Assessment.ts` — Removed 3 index signatures from AssessmentLayout and Attachment; narrowed 7 any fields to concrete types; Assessment class constructor unchanged

## Decisions Made

- Removed `visualizaQuestaoParsed?: any` from `QuestionContent`: the `Question` class already has `visualizaQuestaoParsed: QuestionContent | null` as a typed class property; having it in `QuestionContent` would create a recursive type that is never needed
- Used `unknown` (not `any`) for `mapa` and `identificado` in `AssessmentLayout`: neither field appears in any rendering path (handlers, templates, util.ts) — `unknown` requires explicit narrowing before use, which is safer than `any`
- Preserved the existing class property typo `afimacoes` (not `afirmacoes`) in the `Question` class: renaming it would require updating all call sites across the codebase and is explicitly Phase 2 scope per the plan
- Left `content?: any` and `content: any` in `QuestionConstructor` and `Question` class: an internal implementation detail not on the public rendering path, per RESEARCH.md Pitfall 3

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. The TypeScript compiler remained at zero errors throughout all stages. No handler or utility code accessed `AssessmentLayout` fields by name through TypeScript's type system (the `QuestionRenderer` holds `assessmentLayout: any` and passes it directly to Handlebars, so removing the index signature posed no risk).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/domain/Question.ts` exports AfirmacaoItem, AssociacaoItem, AssociacoesContent, AssercoesContent, TipoLinha — ready for plan 01-03 (AssessmentInput type file)
- `src/domain/Assessment.ts` AssessmentLayout is fully typed — ready for plan 01-03 and Phase 2 adapter work
- tsc and build pass cleanly — no blockers for next plan

---
*Phase: 01-type-foundation*
*Completed: 2026-06-01*

## Self-Check: PASSED

- FOUND: src/domain/Question.ts (modified)
- FOUND: src/domain/Assessment.ts (modified)
- FOUND: .planning/phases/01-type-foundation/01-02-SUMMARY.md (created)
- FOUND commit: 13a1611 (Task 1 — Question.ts narrowing)
- FOUND commit: 953f73d (Task 2 — Assessment.ts index signature removal)
- SUMMARY.md commit: skipped (parallel agent restriction on .planning/ — orchestrator manages this write)
