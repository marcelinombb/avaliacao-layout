---
phase: "02-adapter-builder"
plan: 02
subsystem: "builder"
tags: ["builder", "type-safety", "refactor", "AssessmentInput", "api-cleanup"]
dependency_graph:
  requires: ["02-01"]
  provides: ["LayoutAvaliacaoBuilder.build(AssessmentInput)", "habilitarMarcaDaguaRascunho", "marcaDaguaRascunho(url)"]
  affects: ["src/LayoutAvaliacaoBuilder.ts"]
tech_stack:
  added: []
  patterns: ["AssessmentInput-typed-builder", "fluent-builder-renamed-methods"]
key_files:
  created: []
  modified:
    - src/LayoutAvaliacaoBuilder.ts
decisions:
  - "Renamed boolean marcaDaguaRascunho to habilitarMarcaDaguaRascunho per D-10 — hard rename, no deprecated alias"
  - "Renamed typo-named marcaDaquaRascunho (URL setter) to marcaDaguaRascunho per D-09 — hard rename, no deprecated alias"
  - "Removed pagina field entirely — dead field, no references in rendering pipeline per D-11"
  - "build() now accepts AssessmentInput typed parameter; quebraQuestao reads from input.layout?.quebraQuestao per D-05"
  - "_marcaDaquaRascunho private field name kept as-is — internal implementation detail, not a public API name"
metrics:
  duration: "~1 minute"
  completed: "2026-06-01"
  tasks_completed: 1
  files_changed: 1
---

# Phase 02 Plan 02: LayoutAvaliacaoBuilder Update Summary

**One-liner:** LayoutAvaliacaoBuilder.build() now accepts typed AssessmentInput; marcaDagua method duplication resolved and pagina dead field removed, completing the builder side of the adapter integration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Clean up LayoutAvaliacaoBuilder — fix marcaDagua methods, remove pagina, update build() signature | 8a2e893 | src/LayoutAvaliacaoBuilder.ts (modified) |

## Task 2 Status: Pending Human Verification

Task 2 is a `checkpoint:human-verify` task requiring manual browser verification. It cannot be executed by an autonomous agent.

**What to verify:**
1. Run `npm run dev` to start the browser dev harness (port 10001)
2. Open http://localhost:10001 in the browser
3. Open DevTools console — verify no errors on page load
4. Confirm the assessment renders visually (questions appear, pagination works, no blank page)
5. Compare with the previous rendering (pixel-identical output expected per Phase 2 success criterion 2)
6. Optionally: in DevTools console, run `fromProvaModelo3(provaModelo3)` and inspect that the returned object has questions[], attachments[], layout, id, and title fields

**Resume signal:** Type "approved" if rendering is pixel-identical to the previous output, or describe any visual differences.

## What Was Built

### src/LayoutAvaliacaoBuilder.ts (modified)

Five targeted changes applied per decisions D-05, D-07, D-09, D-10, D-11:

1. **AssessmentInput import added** (line 2): `import { AssessmentInput } from './types/AssessmentInput';`

2. **Dead `pagina` field removed**: Property declaration `pagina: any` removed from class body; constructor initialization block `this.pagina = { header: "", footer: "" }` removed. This field had no references in the rendering pipeline.

3. **`habilitarMarcaDaguaRascunho` method** (new, replaces boolean `marcaDaguaRascunho`): Accepts `enabled: boolean`, assigns `this.comMarcaDaguaRascunho = enabled`. Hard rename per D-10 — no deprecated alias.

4. **`marcaDaguaRascunho` method** (corrected spelling, replaces `marcaDaquaRascunho`): Accepts `marcaDaguaUrl: string`, assigns `this._marcaDaquaRascunho = marcaDaguaUrl`. Hard rename per D-09 — no deprecated alias. The private `_marcaDaquaRascunho` field is kept as-is (internal implementation detail).

5. **`build(input: AssessmentInput)`** (updated signature): Parameter renamed from `provaModelo` to `input: AssessmentInput`; `new LayoutAvaliacao(provaModelo, {` changed to `new LayoutAvaliacao(input, {`; `quebraQuestao` now reads `input.layout?.quebraQuestao` instead of `provaModelo.prova.quebraQuestao`.

## Verification

- `npx tsc --noEmit` exits with code 0 — no type errors
- No `pagina` field/property in LayoutAvaliacaoBuilder.ts class body or constructor
- No `marcaDaquaRascunho` public method in LayoutAvaliacaoBuilder.ts
- `habilitarMarcaDaguaRascunho` present as the boolean-enable method
- `marcaDaguaRascunho` present as the URL-setter method (1 match)
- `build(input: AssessmentInput)` — typed signature confirmed
- `input.layout?.quebraQuestao` — new read path confirmed
- Browser verification pending (Task 2 checkpoint)

## Deviations from Plan

None — plan executed exactly as written. The file had one additional field (`_rascunhoHtml`) and method (`rascunhoHtml()`) compared to what was described in the plan's read_first section (the plan described an older version), but these were pre-existing additions from a prior commit on refact-claude branch. They were not touched.

## Known Stubs

None.

## Threat Flags

None — this plan removes dead code (pagina field) and renames methods to fix API defects. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- [x] src/LayoutAvaliacaoBuilder.ts modified with all 5 changes
- [x] Commit 8a2e893 exists
- [x] tsc --noEmit exits 0
- [x] No `pagina` field in class body or constructor
- [x] No public `marcaDaquaRascunho` method
- [x] `habilitarMarcaDaguaRascunho` method present (1 match)
- [x] `marcaDaguaRascunho(marcaDaguaUrl: string)` method present (1 match)
- [x] `build(input: AssessmentInput)` signature present
- [x] `input.layout?.quebraQuestao` read present
- [x] `new LayoutAvaliacao(input,` call present
- [x] AssessmentInput import present
