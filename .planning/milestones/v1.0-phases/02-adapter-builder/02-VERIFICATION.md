---
phase: 02-adapter-builder
verified: 2026-06-02T00:00:00Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
gap_closure_note: "Gaps from initial verification (2026-06-01) were resolved by plan 02-03 (commits c9a8b99 and 6898702): adapter listaProvaAnexo path corrected, quebraQuestao mapped, index.html wired to fromProvaModelo3, marcaDaquaRascunho typo fixed."
gaps:
  - truth: "Calling fromProvaModelo3(provaModelo3) in the browser dev harness produces an AssessmentInput that renders identically to the previous raw-input path (pixel-identical HTML output)"
    status: failed
    reason: "The browser dev harness (index.html:262) still passes raw provaModelo3 directly to build() instead of going through fromProvaModelo3(). The harness was never updated. Additionally, the adapter reads listaProvaAnexo from the wrong level (root of provaModelo3) while the fixture places it at prova.listaProvaAnexo — attachments are always silently empty. The quebraQuestao field is at prova.quebraQuestao in the fixture but the adapter maps prova.layout to layout, so input.layout?.quebraQuestao is always undefined."
    artifacts:
      - path: "index.html"
        issue: "Line 262: layoutBuilder.build(provaModelo3) — passes raw object, bypassing the adapter entirely. Line 251: layoutBuilder.marcaDaquaRascunho(...) — calls a deleted method that no longer exists on LayoutAvaliacaoBuilder, causing a TypeError when the watermark checkbox is checked."
      - path: "src/adapter/ProvaModelo3Adapter.ts"
        issue: "Line 4: destructures listaProvaAnexo from provaModelo3 root, but the fixture places it at prova.listaProvaAnexo. Line 25: maps prova?.layout to layout, but quebraQuestao lives at prova.quebraQuestao not prova.layout.quebraQuestao."
    missing:
      - "Update index.html line 262 to: const assessmentInput = AvaliacaoLayout.fromProvaModelo3(provaModelo3); let layoutResult = layoutBuilder.build(assessmentInput);"
      - "Update index.html line 251 to: layoutBuilder.marcaDaguaRascunho(...) (correct spelling)"
      - "Fix ProvaModelo3Adapter.ts: change listaProvaAnexo source from root destructure to prova?.listaProvaAnexo"
      - "Fix ProvaModelo3Adapter.ts: map quebraQuestao from prova?.quebraQuestao into layout, e.g. layout = { ...(prova?.layout || {}), quebraQuestao: prova?.quebraQuestao }"
  - truth: "fromProvaModelo3() is callable from a browser dev harness and returns an AssessmentInput-shaped object with questions[], attachments[], layout, id, and title"
    status: partial
    reason: "The function exists and returns the correct shape structurally (id, title, questions, attachments, layout fields all present). However, attachments is always [] due to incorrect listaProvaAnexo source path (root vs prova.listaProvaAnexo). The browser dev harness does not call fromProvaModelo3() at all — it still passes raw provaModelo3 to build()."
    artifacts:
      - path: "src/adapter/ProvaModelo3Adapter.ts"
        issue: "listaProvaAnexo read from root of provaModelo3, but fixture places it at prova.listaProvaAnexo — always resolves to undefined, falls back to []"
    missing:
      - "Change destructure on line 4 to const { prova, listaProvaQuestao } = provaModelo3 and then const listaProvaAnexo = prova?.listaProvaAnexo"
human_verification:
  - test: "Run npm run dev and open http://localhost:10001 in a browser"
    expected: "After the harness is updated to call fromProvaModelo3(provaModelo3) and then build(assessmentInput), the assessment renders with all questions visible, pagination works, and output is pixel-identical to Phase 1 output"
    why_human: "Browser rendering, pagination layout, and visual pixel-comparison cannot be automated — Paged.js rendering requires a real DOM and browser layout engine"
  - test: "Check DevTools console on page load after harness update"
    expected: "No JavaScript errors, no TypeError for missing methods, no silent empty-questions symptom"
    why_human: "Runtime errors in browser context cannot be verified by grep or tsc"
  - test: "Verify attachments render correctly (questions with annexe references)"
    expected: "Reference/annexe blocks appear alongside their questions after the listaProvaAnexo source path fix"
    why_human: "Requires visual inspection of rendered questions that have prova.listaProvaAnexo entries"
---

# Phase 02: Adapter & Builder Verification Report

**Phase Goal:** Consuming developers can pass a raw `provaModelo3` backend response through `fromProvaModelo3()` and receive a valid `AssessmentInput`; the builder API exposes no dead or duplicated methods
**Verified:** 2026-06-01T00:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `fromProvaModelo3()` exported as named function from the package | VERIFIED | `src/index.ts:11` — `export { fromProvaModelo3 } from './adapter/ProvaModelo3Adapter'`; function signature `export function fromProvaModelo3(provaModelo3): AssessmentInput` confirmed in `src/adapter/ProvaModelo3Adapter.ts:2` |
| 2 | `fromProvaModelo3()` callable from browser harness and returns AssessmentInput-shaped object with correct fields | PARTIAL — FAILED | Function exists with correct structural shape (id, title, questions, attachments, layout). However: (a) harness never calls it — still uses raw object; (b) `listaProvaAnexo` always resolves to `undefined` because the fixture places it at `prova.listaProvaAnexo`, not root level, so `attachments` is always `[]` |
| 3 | `_mapToEntity()` reads QuestionInput fields instead of raw backend fields | VERIFIED | `src/LayoutAvaliacao.ts:42-109` — `_mapToEntity(input: AssessmentInput)` reads `q.id`, `q.order`, `q.type`, `q.visualizaQuestaoRaw`, etc. Zero occurrences of `q.questao.codigo`, `q.questao.visualizaQuestao`, or `q.ordem` (raw backend paths) |
| 4 | `JSON.parse(q.visualizaQuestaoRaw)` inside `_mapToEntity()`, no `JSON.parse` in adapter | VERIFIED | `src/LayoutAvaliacao.ts:51` — `parsedContent = JSON.parse(q.visualizaQuestaoRaw)`; zero occurrences of `JSON.parse` in `src/adapter/ProvaModelo3Adapter.ts` |
| 5 | `builder.build(fromProvaModelo3(raw))` compiles and executes without error | PARTIAL — FAILED | Compiles: `tsc --noEmit` exits 0. Runtime: the usage pattern itself (adapter → build) would silently lose all attachments (wrong source path) and always produce undefined for quebraQuestao. The harness does not test this pattern at all — still passes raw object. A real integration run via `npm run dev` would produce a blank-document or incomplete document, not pixel-identical output |
| 6 | `LayoutAvaliacaoBuilder` exposes `habilitarMarcaDaguaRascunho(boolean)` and `marcaDaguaRascunho(string)`; no `marcaDaquaRascunho` typo variant | VERIFIED | `src/LayoutAvaliacaoBuilder.ts:50` — `habilitarMarcaDaguaRascunho(enabled: boolean)` present. Line 70 — `marcaDaguaRascunho(marcaDaguaUrl: string)` present. Zero public methods named `marcaDaquaRascunho` — only the private field `_marcaDaquaRascunho` (internal implementation detail, intentionally kept per D-09) |
| 7 | Dead `pagina` field absent from `LayoutAvaliacaoBuilder` class body and constructor | VERIFIED | Zero matches for standalone `\bpagina\b` in `src/LayoutAvaliacaoBuilder.ts`. Only `paginacaoAtiva`, `paginacao()` remain — these are the unrelated pagination-active feature, not the dead pagina field |

**Score:** 5/7 truths verified (2 failed/partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/adapter/ProvaModelo3Adapter.ts` | fromProvaModelo3 adapter function | STUB (partial) | Exists, exports `fromProvaModelo3`, correct imports from `../types/AssessmentInput`, no JSON.parse. Defect: reads `listaProvaAnexo` from root (undefined in fixture); does not map `quebraQuestao` from `prova.quebraQuestao` into layout |
| `src/LayoutAvaliacao.ts` | Updated orchestrator accepting AssessmentInput | VERIFIED | `input: AssessmentInput` property, constructor parameter, and `_mapToEntity(input: AssessmentInput)` all confirmed. All raw backend field reads replaced |
| `src/index.ts` | Public package entry with fromProvaModelo3 re-export | VERIFIED | Line 11: `export { fromProvaModelo3 } from './adapter/ProvaModelo3Adapter'` |
| `src/LayoutAvaliacaoBuilder.ts` | Updated builder with clean API and AssessmentInput-typed build() | VERIFIED | `build(input: AssessmentInput)`, `habilitarMarcaDaguaRascunho`, `marcaDaguaRascunho`, no `pagina` field, no `provaModelo` references |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/adapter/ProvaModelo3Adapter.ts` | `src/types/AssessmentInput.ts` | named import | VERIFIED | Line 1: `import { AssessmentInput, QuestionInput, AttachmentInput, AssessmentLayoutInput } from '../types/AssessmentInput'` |
| `src/LayoutAvaliacao.ts` | `src/types/AssessmentInput.ts` | named import | VERIFIED | Line 5: `import { AssessmentInput } from './types/AssessmentInput'` |
| `src/index.ts` | `src/adapter/ProvaModelo3Adapter.ts` | re-export | VERIFIED | Line 11: `export { fromProvaModelo3 } from './adapter/ProvaModelo3Adapter'` — direct form per D-04 |
| `src/LayoutAvaliacaoBuilder.ts` | `src/types/AssessmentInput.ts` | named import | VERIFIED | Line 2: `import { AssessmentInput } from './types/AssessmentInput'` |
| `src/LayoutAvaliacaoBuilder.ts build()` | `src/LayoutAvaliacao.ts constructor` | `new LayoutAvaliacao(input, {...})` | VERIFIED | Line 159: `const layoutAvaliacao = new LayoutAvaliacao(input, {` |
| `index.html` | `src/adapter/ProvaModelo3Adapter.ts` | `fromProvaModelo3()` call | NOT WIRED | Harness still calls `layoutBuilder.build(provaModelo3)` raw (line 262); never calls `fromProvaModelo3()`. Also calls deleted `marcaDaquaRascunho` method (line 251) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `src/adapter/ProvaModelo3Adapter.ts` | `questions` | `listaProvaQuestao || []` from root destructure | Yes — root-level `listaProvaQuestao` is correct per fixture | FLOWING |
| `src/adapter/ProvaModelo3Adapter.ts` | `attachments` | `listaProvaAnexo || []` from root destructure | No — fixture places `listaProvaAnexo` at `prova.listaProvaAnexo`; root destructure always yields `undefined`, falls back to `[]` | DISCONNECTED |
| `src/adapter/ProvaModelo3Adapter.ts` | `layout.quebraQuestao` | `prova?.layout` (no quebraQuestao mapping) | No — fixture has `prova.quebraQuestao` not `prova.layout.quebraQuestao`; field is never mapped into `layout` | DISCONNECTED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| tsc compiles with no errors | `npx tsc --noEmit` | exit 0, no output | PASS |
| No raw backend field reads in LayoutAvaliacao | `grep -n "q\.questao\." src/LayoutAvaliacao.ts` | no matches | PASS |
| No JSON.parse in adapter | `grep -n "JSON\.parse" src/adapter/ProvaModelo3Adapter.ts` | no matches | PASS |
| fromProvaModelo3 in index.ts | `grep "fromProvaModelo3" src/index.ts` | line 11 confirmed | PASS |
| No pagina field in builder | `grep -n "\bpagina\b" src/LayoutAvaliacaoBuilder.ts` | no matches | PASS |
| No marcaDaquaRascunho public method | `grep -n "marcaDaquaRascunho" src/LayoutAvaliacaoBuilder.ts` | only private field `_marcaDaquaRascunho` lines 17,40,71,174 — no public method | PASS |
| Harness wired to adapter | `grep -n "fromProvaModelo3\|build(provaModelo3" index.html` | line 262: `build(provaModelo3)` — adapter NOT used; line 251: `marcaDaquaRascunho(...)` — deleted method called | FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INPUT-03 | 02-01, 02-02 | `fromProvaModelo3()` adapter exported from package, accepts current provaModelo3 shape, returns AssessmentInput | BLOCKED | Function exists and is exported. Three data-path defects prevent full satisfaction: (1) listaProvaAnexo reads wrong level, (2) quebraQuestao not mapped from prova, (3) harness never updated to call the adapter — rendering path not validated |
| BUILDER-01 | 02-02 | `marcaDaguaRascunho()` / `marcaDaquaRascunho()` duplication resolved | SATISFIED | `habilitarMarcaDaguaRascunho(boolean)` and `marcaDaguaRascunho(string)` both present with correct spelling. Typo variant `marcaDaquaRascunho` removed as public method. Internal private `_marcaDaquaRascunho` field kept per D-09 |
| BUILDER-02 | 02-02 | Dead `pagina` field removed from `LayoutAvaliacaoBuilder` | SATISFIED | Zero matches for `\bpagina\b` in `src/LayoutAvaliacaoBuilder.ts`. Field removed from both class declaration and constructor |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `index.html` | 262 | `layoutBuilder.build(provaModelo3)` — raw object passed, adapter bypassed | Blocker | Zero questions rendered when path expected to exercise adapter integration |
| `index.html` | 251 | `layoutBuilder.marcaDaquaRascunho(...)` — deleted method, TypeError at runtime | Blocker | Crashes harness when watermark checkbox is checked; method no longer exists |
| `src/adapter/ProvaModelo3Adapter.ts` | 4 | `listaProvaAnexo` destructured from root but fixture places it at `prova.listaProvaAnexo` | Blocker | Attachments always `[]` — silent data loss, no rendering error |
| `src/adapter/ProvaModelo3Adapter.ts` | 25 | `const layout: AssessmentLayoutInput = prova?.layout \|\| {}` — `quebraQuestao` at `prova.quebraQuestao` never mapped into layout | Warning | `input.layout?.quebraQuestao` always `undefined`; question-break feature silently disabled |

### Human Verification Required

#### 1. Browser Dev Harness Rendering (after harness fixes)

**Test:** After updating `index.html` to call `fromProvaModelo3(provaModelo3)` and pass the result to `build()`, run `npm run dev` and open http://localhost:10001

**Expected:** Assessment renders with all questions visible, correct attachments/annexe blocks, pagination works, no console errors, output is pixel-identical to Phase 1 rendering

**Why human:** Browser rendering requires a real DOM and Paged.js layout engine; pixel-comparison and pagination correctness cannot be verified by static analysis

#### 2. Console Error Check

**Test:** Open DevTools console immediately after page load

**Expected:** No `TypeError`, no JSON parse errors, no `undefined` warnings

**Why human:** Runtime browser errors require live execution in a browser context

#### 3. Attachment/Annexe Rendering

**Test:** After fixing the `listaProvaAnexo` source path in the adapter, verify that questions with references render their annexe blocks correctly

**Expected:** Reference text blocks appear alongside associated questions (if the fixture's `prova.listaProvaAnexo` has entries; if the array is empty in the test fixture, this test is moot)

**Why human:** Requires visual inspection of rendered HTML output in browser

---

## Gaps Summary

Two gaps block the phase goal:

**Gap 1: Browser harness not updated** — `index.html` still passes raw `provaModelo3` to `build()` (line 262) and still calls the deleted `marcaDaquaRascunho()` method (line 251). The end-to-end path `fromProvaModelo3(raw) → build()` is never actually exercised in the dev harness. The mandatory human-verify gate from Plan 02-02 Task 2 was not executed.

**Gap 2: Adapter data-path defects** — Two fields are silently wrong:
- `listaProvaAnexo` is read from `provaModelo3` root, but the fixture places it at `prova.listaProvaAnexo`. Attachments are always an empty array.
- `quebraQuestao` lives at `prova.quebraQuestao` in the fixture but the adapter only maps `prova.layout` into `layout`, leaving `input.layout?.quebraQuestao` always undefined.

These two gaps share the same root cause: the adapter was written against an assumed data shape that was not cross-checked against the actual fixture. Both are fixable with targeted changes to `ProvaModelo3Adapter.ts` (4 lines) and `index.html` (2 lines).

BUILDER-01 and BUILDER-02 are fully satisfied — no issues with the builder cleanup.

---

_Verified: 2026-06-01T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
