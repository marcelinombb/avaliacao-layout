---
phase: 01-type-foundation
plan: "01"
subsystem: types
tags: [typescript, interfaces, public-api, input-contract]
dependency_graph:
  requires: []
  provides:
    - AssessmentInput
    - AssessmentLayoutInput
    - QuestionInput
    - AttachmentInput
    - ReferenceInput
  affects:
    - src/index.ts
    - dist/avaliacao-layout.d.ts
tech_stack:
  added: []
  patterns:
    - "Pure-types file (no runtime code, no imports) in src/types/"
    - "export type { ... } for type-only re-exports from index.ts"
key_files:
  created:
    - src/types/AssessmentInput.ts
  modified:
    - src/index.ts
    - .gitignore
decisions:
  - "tipoLinha typed as { codigo: number; nome: string } | null — fixture prova-modelo.js confirms object shape, not string"
  - "ReferenceInput declared with all-optional fields — mirrors Reference but without requiring exact shape from callers"
  - ".gitignore anchored to /types (was unanchored 'types') — prevents src/types/ from being inadvertently ignored"
metrics:
  duration: "2 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 01 Plan 01: AssessmentInput Type Contract Summary

**One-liner:** Five clean TypeScript interfaces (AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput, ReferenceInput) added as the library's new public input contract with no `any` fields.

## What Was Built

Created `src/types/AssessmentInput.ts` — a pure-types file declaring five exported interfaces in dependency order:

1. `ReferenceInput` — optional-field mirror of the internal `Reference` shape
2. `AssessmentLayoutInput` — 21 explicitly typed layout fields, no index signature
3. `AttachmentInput` — two fields; `anexo` inline object with no index signature
4. `QuestionInput` — 14 fields; `tipoLinha` correctly typed as `{ codigo: number; nome: string } | null`
5. `AssessmentInput` — top-level consumer-facing contract

Wired all five types into `src/index.ts` via a single `export type { ... }` line, making them importable from the package surface and included in `dist/avaliacao-layout.d.ts` via `rollup-plugin-dts`.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create src/types/AssessmentInput.ts | 985bfa5 | src/types/AssessmentInput.ts, .gitignore |
| 2 | Wire AssessmentInput export into src/index.ts | 59b3be6 | src/index.ts |

## Verification

- `src/types/AssessmentInput.ts` exists with exactly 5 `export interface` declarations
- Zero `: any` fields across all five interfaces
- Zero `[key: string]` index signatures
- `tipoLinha` typed as `{ codigo: number; nome: string } | null` (confirmed from `prova-modelo.js` fixture)
- `npx tsc --noEmit` exits 0 after all changes
- Existing exports in `src/index.ts` unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed unanchored .gitignore pattern**
- **Found during:** Task 1 commit attempt
- **Issue:** `.gitignore` contained `types` (unanchored), which matched `src/types/` recursively, causing git to ignore the newly created `src/types/AssessmentInput.ts`. The entry was intended to ignore the build-output `types/` directory at the repo root.
- **Fix:** Changed `types` to `/types` in `.gitignore` to anchor the pattern to the repo root only. Verified that root-level `types/` is still ignored; `src/types/AssessmentInput.ts` is now tracked.
- **Files modified:** `.gitignore`
- **Commit:** 985bfa5

## Known Stubs

None — this plan creates type definitions only. No runtime data flows or UI rendering involved.

## Threat Flags

None — pure TypeScript interface declarations; no runtime behavior, no network endpoints, no file access.

## Self-Check: PASSED

- `src/types/AssessmentInput.ts` exists: FOUND
- Five `export interface` declarations: VERIFIED
- No `: any` fields: CLEAN
- No index signatures: CLEAN
- `export type { AssessmentInput ... }` in `src/index.ts`: VERIFIED (1 match)
- Commits 985bfa5 and 59b3be6: PRESENT in git log
- `tsc --noEmit` exit 0: CONFIRMED
