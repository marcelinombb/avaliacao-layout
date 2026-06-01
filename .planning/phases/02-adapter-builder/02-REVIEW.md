---
phase: 02-adapter-builder
reviewed: 2026-06-01T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/adapter/ProvaModelo3Adapter.ts
  - src/LayoutAvaliacao.ts
  - src/LayoutAvaliacaoBuilder.ts
  - src/index.ts
  - src/types/AssessmentInput.ts
findings:
  critical: 3
  warning: 2
  info: 2
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This phase introduced a `ProvaModelo3Adapter`, updated `LayoutAvaliacao._mapToEntity()` to consume `AssessmentInput`, and updated `LayoutAvaliacaoBuilder.build()` to accept `AssessmentInput`. The refactor is structurally sound on paper, but three critical defects prevent it from working correctly in the browser dev harness:

1. The harness (`index.html`) was not updated — it still calls `build(provaModelo3)` with the raw object and still calls the deleted `marcaDaquaRascunho()` method. The harness will throw a `TypeError` at runtime when the draft-watermark checkbox is checked, and will silently render empty questions when it is not.
2. The adapter incorrectly sources `listaProvaAnexo` from the wrong level of the input object — it is nested inside `prova`, not at the root.

All three critical issues would be caught immediately by the "npm run dev" human-verify gate defined in Plan 02-02, but they were not caught because the gate was not executed before the review was submitted.

---

## Critical Issues

### CR-01: Dev harness passes raw `provaModelo3` to `build()` instead of the adapted `AssessmentInput`

**File:** `index.html:262`
**Issue:** `layoutBuilder.build(provaModelo3)` passes the raw backend object directly. After this refactor, `build()` hands the argument to `new LayoutAvaliacao(input, ...)`, which calls `_mapToEntity(input)`. `_mapToEntity` now reads `input.questions` (which is `undefined` on the raw object — the raw key is `listaProvaQuestao` at the top level), so `listaProvaQuestao = rawQuestions || []` becomes `[]`, silently producing a zero-question assessment. Every question is lost. The rendering appears to succeed (no exception thrown) but outputs a blank document.

Additionally, `build()` reads `input.layout?.quebraQuestao` — on the raw object this path resolves to `undefined` because the raw object does not have a top-level `layout` key (`quebraQuestao` lives at `provaModelo3.prova.quebraQuestao`). The correct call would also mutate `provaModelo3.prova.quebraQuestao` via `provaModelo3.prova.quebraQuestao = quebraQuestao` at line 229, which the adapter would then surface via `prova?.layout?.quebraQuestao` — but `quebraQuestao` is a field of `prova` itself, not of `prova.layout`, so even after routing through the adapter this value would be lost.

**Fix:** Update `index.html` to use the adapter:
```javascript
// import or access fromProvaModelo3 from the UMD bundle
const assessmentInput = AvaliacaoLayout.fromProvaModelo3(provaModelo3);
let layoutResult = layoutBuilder.build(assessmentInput);
```
Also verify whether `quebraQuestao` should be read from `prova.quebraQuestao` or `prova.layout.quebraQuestao` in the fixture, and update the adapter mapping accordingly.

---

### CR-02: Dev harness calls deleted method `marcaDaquaRascunho()` — runtime TypeError

**File:** `index.html:251`
**Issue:** The harness calls `layoutBuilder.marcaDaquaRascunho(...)` at line 251. Plan 02-02 renamed this method to `marcaDaguaRascunho` (correct spelling) as a hard rename with no deprecated alias. The old name no longer exists on `LayoutAvaliacaoBuilder`. When the "Rascunho" watermark checkbox is checked, this line throws `TypeError: layoutBuilder.marcaDaquaRascunho is not a function`, crashing the render.

This is an external consumer breaking change that was not propagated to the harness.

**Fix:** Update `index.html` line 251:
```javascript
// Before (broken):
layoutBuilder.marcaDaquaRascunho("public/assets/marcadagua/marcadagua_semfundo.png");

// After:
layoutBuilder.marcaDaguaRascunho("public/assets/marcadagua/marcadagua_semfundo.png");
```

---

### CR-03: Adapter reads `listaProvaAnexo` from wrong level — attachments always silently empty

**File:** `src/adapter/ProvaModelo3Adapter.ts:4,23`
**Issue:** The adapter destructures `listaProvaAnexo` from the root of `provaModelo3`:
```typescript
const { prova, listaProvaQuestao, listaProvaAnexo } = provaModelo3;
```
In the actual fixture (and in the real backend shape), `listaProvaAnexo` is a property of `prova`, not of the top-level object. The top-level keys of `provaModelo3` are: `prova`, `nome`, `fonteTamanho`, `listaProvaQuestao`, `rascunho`, `usuario`. There is no top-level `listaProvaAnexo`.

As a result, `listaProvaAnexo` is always `undefined` from this destructure, and line 23 falls back to `[]` via the `|| []` guard, silently discarding all attachment data. Questions that depend on annexe references will be rendered without their reference text blocks.

**Fix:**
```typescript
// ProvaModelo3Adapter.ts line 4 — correct destructure path:
const { prova, listaProvaQuestao } = provaModelo3;
const listaProvaAnexo = prova?.listaProvaAnexo;

// ...rest of function unchanged
const attachments: AttachmentInput[] = listaProvaAnexo || [];
```

---

## Warnings

### WR-01: `quebraQuestao` mapping is unreachable via the adapter path

**File:** `src/adapter/ProvaModelo3Adapter.ts:25` and `src/LayoutAvaliacaoBuilder.ts:165`
**Issue:** `build()` reads `input.layout?.quebraQuestao` (line 165 of `LayoutAvaliacaoBuilder`). The adapter maps `prova?.layout` to `layout` (line 25 of adapter). In the fixture, `quebraQuestao` is a field of `prova` directly (`provaModelo3.prova.quebraQuestao`), not of `prova.layout`. Therefore `input.layout.quebraQuestao` will always be `undefined` even when the adapter is used correctly. The feature silently does nothing.

This is a contract mismatch between the adapter's output and `build()`'s expectation. The field `quebraQuestao` needs to either be added to `AssessmentLayoutInput` and populated by the adapter from `prova.quebraQuestao`, or be moved to a top-level field in `AssessmentInput`.

**Fix:** In `ProvaModelo3Adapter.ts`, explicitly map `quebraQuestao` from `prova`:
```typescript
const layout: AssessmentLayoutInput = {
    ...(prova?.layout || {}),
    quebraQuestao: prova?.quebraQuestao,
};
```
Or add `quebraQuestao` as a top-level field to `AssessmentInput` and read it in `build()` as `input.quebraQuestao`.

---

### WR-02: `comMarcaDaguaRascunho` and `quantidadeFolhasRascunho` are not initialized in constructor

**File:** `src/LayoutAvaliacaoBuilder.ts:27,28` and constructor (lines 29–48)
**Issue:** The class declares `comMarcaDaguaRascunho: any` and `quantidadeFolhasRascunho: any` as public properties but the constructor does not initialize either of them. They are left as `undefined` (not `null`, not `false`). The `build()` output at line 187 exposes `comMarcaDaguaRascunho` directly in the frozen return object; a consumer checking `result.comMarcaDaguaRascunho` truthily will get `undefined` instead of `false` when the method was never called. `quantidadeFolhasRascunho` is also used in the `layoutOptions` object passed to `LayoutAvaliacao` — passing `undefined` where a count is expected may produce unexpected rendering behavior in draft pages.

**Fix:** Initialize in constructor:
```typescript
this.comMarcaDaguaRascunho = false;
this.quantidadeFolhasRascunho = 0;
```

---

## Info

### IN-01: `LayoutAvaliacao.input` and `layoutOptions` are public with no visibility guard

**File:** `src/LayoutAvaliacao.ts:19,20`
**Issue:** `input: AssessmentInput` and `layoutOptions: any` are declared as public class properties. While TypeScript `strict` is off and this is intentional for the project style, these fields hold the full assessment data and layout configuration. A consumer who receives a `LayoutAvaliacao` instance (which does not happen via the public API — only `build()` return is exported) could mutate these after construction. Low risk given the single-consumer architecture, but worth noting as a pattern that conflicts with the `Object.freeze()` applied to the `build()` return value.

**Fix:** Consider `private` or `readonly` modifiers if TypeScript version permits, or at minimum document the intended access pattern with a comment.

---

### IN-02: Typo in method name `avalicaoHtml()` preserved

**File:** `src/LayoutAvaliacao.ts:27`
**Issue:** Method is spelled `avalicaoHtml` (missing 'a' — should be `avaliacaoHtml`). This is a pre-existing defect not introduced in this phase, but it is referenced internally by `build()` and therefore not part of the public API contract. Worth tracking for a future cleanup phase.

**Fix:** Rename to `avaliacaoHtml()` and update the single call site in `LayoutAvaliacaoBuilder.ts:171`. This is a safe internal rename with no public API impact.

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
