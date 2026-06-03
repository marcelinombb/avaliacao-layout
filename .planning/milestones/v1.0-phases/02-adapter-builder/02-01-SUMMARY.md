---
phase: "02-adapter-builder"
plan: 01
subsystem: "adapter"
tags: ["adapter", "type-mapping", "refactor", "AssessmentInput"]
dependency_graph:
  requires: []
  provides: ["fromProvaModelo", "LayoutAvaliacao.input:AssessmentInput", "LayoutAvaliacao._mapToEntity(AssessmentInput)"]
  affects: ["src/index.ts", "src/LayoutAvaliacao.ts"]
tech_stack:
  added: []
  patterns: ["pure-transform-adapter", "named-export-no-default", "type-safe-orchestrator"]
key_files:
  created:
    - src/adapter/ProvaModelo3Adapter.ts
  modified:
    - src/LayoutAvaliacao.ts
    - src/index.ts
decisions:
  - "Used direct re-export form (export { fromProvaModelo } from './adapter/...') per D-04 to avoid extra import statement in index.ts"
  - "Adapter passes visualizaQuestaoRaw through as-is (no JSON.parse); JSON.parse responsibility stays in _mapToEntity()"
  - "_mapToEntity destructures input.layout directly into layout var (unused locally); Assessment() receives input.layout"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-01"
  tasks_completed: 2
  files_changed: 3
---

# Phase 02 Plan 01: ProvaModelo3Adapter and LayoutAvaliacao Update Summary

**One-liner:** Pure-transform adapter `fromProvaModelo()` extracts typed `AssessmentInput` from raw backend shape; `LayoutAvaliacao` updated to consume `AssessmentInput` with `QuestionInput` field names throughout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ProvaModelo3Adapter and re-export from index | d07b7c2 | src/adapter/ProvaModelo3Adapter.ts (created), src/index.ts (modified) |
| 2 | Update LayoutAvaliacao to accept AssessmentInput | 5ef9228 | src/LayoutAvaliacao.ts (modified) |

## What Was Built

### src/adapter/ProvaModelo3Adapter.ts (new)

A pure-transform adapter function `fromProvaModelo(provaModelo3): AssessmentInput` that maps raw backend fields to the typed `AssessmentInput` interface:

- Destructures `prova`, `listaProvaQuestao`, `listaProvaAnexo` from the raw input
- Maps each `listaProvaQuestao` entry to a `QuestionInput` object using raw backend field paths (`q.questao.codigo`, `q.ordem`, etc.)
- `visualizaQuestaoRaw` is `q.questao.visualizaQuestao` passed through as-is — no JSON.parse in the adapter
- Returns `{ id, title, questions, attachments, layout }` matching `AssessmentInput`

### src/LayoutAvaliacao.ts (modified)

Four changes applied:
1. Added `import { AssessmentInput } from './types/AssessmentInput'`
2. Class property renamed from `provaModelo: any` to `input: AssessmentInput`
3. Constructor parameter updated from `provaModelo: any` to `input: AssessmentInput`
4. `_mapToEntity()` signature updated to `_mapToEntity(input: AssessmentInput)`; all internal `q.questao.*` and `q.ordem`-style field reads replaced with `QuestionInput` field names (`q.id`, `q.order`, `q.type`, etc.); `new Assessment()` call updated to use `input.id`, `input.title`, `input.layout`

### src/index.ts (modified)

Added direct re-export: `export { fromProvaModelo } from './adapter/ProvaModelo3Adapter';`

## Verification

- `npx tsc --noEmit` exits with code 0 — no type errors introduced
- No `q.questao.*` reads remain in `LayoutAvaliacao.ts`
- No `JSON.parse` in adapter file
- `fromProvaModelo` exported from package entry point

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — this plan introduces no new network endpoints, auth paths, file access patterns, or schema changes beyond what the plan's threat model covers.

## Self-Check: PASSED

- [x] src/adapter/ProvaModelo3Adapter.ts exists
- [x] src/LayoutAvaliacao.ts updated
- [x] src/index.ts has fromProvaModelo re-export
- [x] Commit d07b7c2 exists
- [x] Commit 5ef9228 exists
- [x] tsc --noEmit exits 0
