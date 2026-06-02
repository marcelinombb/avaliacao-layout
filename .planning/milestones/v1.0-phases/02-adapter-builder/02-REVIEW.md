---
phase: 02-adapter-builder
reviewed: 2026-06-01T12:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/adapter/ProvaModelo3Adapter.ts
  - src/LayoutAvaliacao.ts
  - src/LayoutAvaliacaoBuilder.ts
  - src/index.ts
  - index.html
findings:
  critical: 1
  warning: 4
  info: 5
  total: 10
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-01T12:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five source files from the adapter/builder refactor were reviewed. The three previously identified critical defects (CR-01 harness not using adapter, CR-02 method name mismatch, CR-03 wrong `listaProvaAnexo` path) have all been resolved in the current code. One new critical defect was found: a `JSON.parse(null)` path in `_mapToEntity` that silently overwrites `parsedContent` with `null` and then crashes outside the `try/catch` block. Four warnings and five informational findings round out the review.

---

## Critical Issues

### CR-01: `JSON.parse(null)` writes `null` to `parsedContent`, crashing outside the `try/catch`

**File:** `src/LayoutAvaliacao.ts:49-75`
**Issue:** When `q.visualizaQuestaoRaw` is `null` (allowed by the `QuestionInput` type — `visualizaQuestaoRaw?: string | null`), `JSON.parse(null)` returns `null` without throwing. The `try/catch` at lines 50-54 does **not** fire. `parsedContent` is then reassigned to `null` instead of remaining `{}`. Execution continues past the `catch` block to line 71, where:

```typescript
htmlFields.forEach(field => {
    if (parsedContent[field]) {   // TypeError: Cannot read properties of null
```

`null['instrucao']` throws `TypeError: Cannot read properties of null (reading 'instrucao')`. This uncaught exception propagates out of the `.map()` callback, crashing the entire `_mapToEntity()` call and preventing any HTML from being produced. Any question whose `visualizaQuestaoRaw` field is `null` in the backend payload will bring down the whole render.

**Fix:** Assert that the parsed value is an object before assigning it, or reset to `{}` on a non-object result:

```typescript
let parsedContent: Record<string, any> = {};
try {
    const parsed = JSON.parse(q.visualizaQuestaoRaw);
    if (parsed !== null && typeof parsed === 'object') {
        parsedContent = parsed;
    }
} catch (e) {
    console.error("Error parsing question content", e);
}
```

---

## Warnings

### WR-01: `comMarcaDaguaRascunho` and `quantidadeFolhasRascunho` are not initialized in the constructor

**File:** `src/LayoutAvaliacaoBuilder.ts:26-27` and constructor (lines 29-48)
**Issue:** The class declares both `comMarcaDaguaRascunho: any` and `quantidadeFolhasRascunho: any` as public class properties. Neither is initialized in the constructor — they remain `undefined`. The constructor does initialize the obsolete `numeroFolhasRascunho = null` (see IN-02), but not the two fields that are actually used.

- `comMarcaDaguaRascunho` is surfaced directly in the frozen `build()` return object (line 187). Consumers comparing `result.comMarcaDaguaRascunho === false` will get `undefined !== false` — a latent truthiness bug if the downstream handler ever uses strict equality.
- `quantidadeFolhasRascunho` is passed as `layoutOptions.quantidadeFolhasRascunho` (line 163). `AssessmentHtmlRenderer` at line 16 computes `.repeat(this.options.quantidadeFolhasRascunho || 0)`. `undefined || 0` is `0`, so no draft pages render — this is safe but misleads: a consumer might call `.rascunhoHtml(html)` without calling `.rascunho(n)` and wonder why nothing appears.

**Fix:**
```typescript
constructor() {
    // ...
    this.comMarcaDaguaRascunho = false;
    this.quantidadeFolhasRascunho = 0;
    // remove the stale: this.numeroFolhasRascunho = null;
}
```

---

### WR-02: `q.questao` accessed without null guard in adapter — crashes on malformed input

**File:** `src/adapter/ProvaModelo3Adapter.ts:8,13,14,16,19`
**Issue:** The adapter accesses `q.questao.codigo`, `q.questao.tipoQuestao`, `q.questao.referencia`, `q.questao.visualizaQuestao`, and `q.questao.visualizaResposta` inside the `.map()` on line 7. If any element in `listaProvaQuestao` has a missing or null `questao` property, every one of these property accesses throws `TypeError: Cannot read properties of null (reading 'codigo')` (or similar), crashing the entire adapter call.

The backend is the only current consumer and presumably always provides well-formed data, but the CLAUDE.md constraint is "given any well-formed assessment input" — a missing `questao` sub-object is an observable failure mode that is not protected.

**Fix:**
```typescript
const questions: QuestionInput[] = (listaProvaQuestao || [])
    .filter(q => q.questao != null)   // skip items with no questao
    .map(q => ({
        id: q.questao.codigo,
        // ...rest unchanged
    }));
```
Or use optional chaining throughout:
```typescript
id: q.questao?.codigo,
type: q.questao?.tipoQuestao,
// ...
```

---

### WR-03: CSS custom-property values are not sanitized — CSS injection via `_identificacao` and watermark URLs

**File:** `src/LayoutAvaliacaoBuilder.ts:173-181`
**Issue:** Three CSS custom-property values are constructed by direct string interpolation without escaping:

```typescript
"--layout-watermark-rascunho": this._marcaDaquaRascunho
    ? `url("${this._marcaDaquaRascunho}")`  // line 175
    : "none",
"--layout-watermark-instituicao": this._marcaDaguaInstituicao
    ? `url("${this._marcaDaguaInstituicao}")` // line 178
    : "none",
"--layout-identificacao": this._identificacao
    ? `"${this._identificacao}"`             // line 182
    : "none",
```

A URL containing `")` followed by arbitrary CSS, or an identification string containing `"`, can escape the quoted value and inject additional CSS declarations. For example, a `_marcaDaquaRascunho` value of `test") } body { background: red; } .x {` produces a valid CSS injection. These values are then applied via `document.documentElement.style.setProperty()` (PagedJsRenderer line 24), which executes them in the rendered document.

While this library is consumed by a single trusted backend today, the value of these fields ultimately traces back to user-configurable data (watermark URLs, institution identification strings) and the pattern is a latent escalation risk.

**Fix:** Strip or encode characters that are meaningful in CSS `url()` or string contexts before interpolation:
```typescript
const safeCssString = (s: string) => s.replace(/["\\]/g, '\\$&');
const safeCssUrl = (u: string) => u.replace(/[")]/g, encodeURIComponent);

"--layout-watermark-rascunho": this._marcaDaquaRascunho
    ? `url("${safeCssUrl(this._marcaDaquaRascunho)}")`
    : "none",
"--layout-identificacao": this._identificacao
    ? `"${safeCssString(this._identificacao)}"`
    : "none",
```

---

### WR-04: `rascunhoHtml()` accepts `null` without guard — produces literal `"null"` string in rendered HTML

**File:** `src/LayoutAvaliacaoBuilder.ts:96-99`
**Issue:** The `rascunhoHtml(rascunhoHtml)` method has no validation and assigns the argument directly:
```typescript
rascunhoHtml(rascunhoHtml) {
    this._rascunhoHtml = rascunhoHtml;  // null/undefined accepted silently
    return this;
}
```
The index.html harness calls `.rascunhoHtml(provaModelo3.prova.layout.rascunho)`. If `rascunho` is absent from the layout object, this assigns `undefined` to `_rascunhoHtml`. In `AssessmentHtmlRenderer`:
```typescript
const draftsHtml = `<div class="rascunho">${this.options.rascunho}</div>`.repeat(...)
```
Template literal coercion turns `null` → `"null"` and `undefined` → `"undefined"`, rendering visible garbage in every draft page. The repeat guard (`|| 0`) prevents this only when `.rascunho()` was never called. If `.rascunho(1)` is called without setting HTML content, one draft page with literal `"undefined"` text is rendered.

**Fix:**
```typescript
rascunhoHtml(rascunhoHtml) {
    this._rascunhoHtml = rascunhoHtml ?? "";
    return this;
}
```
And in `AssessmentHtmlRenderer`, guard the template literal:
```typescript
const rascunhoContent = this.options.rascunho || "";
const draftsHtml = `<div class="rascunho">${rascunhoContent}</div>`.repeat(this.options.quantidadeFolhasRascunho || 0);
```

---

## Info

### IN-01: `LayoutAvaliacao` is not exported from `index.ts` — contradicts documented public surface

**File:** `src/index.ts:7-8`
**Issue:** `CLAUDE.md` and `ARCHITECTURE.md` state: *"`index.ts` re-exports the public surface (`LayoutAvaliacaoBuilder`, `LayoutAvaliacao`)"*. The current `index.ts` exports only `LayoutAvaliacaoBuilder`, not `LayoutAvaliacao`. The class is only used internally by `LayoutAvaliacaoBuilder.build()`. If the omission is intentional (treating `LayoutAvaliacao` as an implementation detail), the architecture docs should be updated; if it should be public, the export is missing.

**Fix:** Either add the export:
```typescript
export { LayoutAvaliacaoBuilder, LayoutAvaliacao } from './ ...';
```
Or update the architecture documentation to remove `LayoutAvaliacao` from the described public surface.

---

### IN-02: Dead field `numeroFolhasRascunho` declared, initialized, and never used

**File:** `src/LayoutAvaliacaoBuilder.ts:16,38`
**Issue:** `numeroFolhasRascunho: any` is declared as a class property (line 16) and initialized to `null` in the constructor (line 38). It is never read anywhere — neither in `build()` nor in any method. The active field is `quantidadeFolhasRascunho` (line 27), set by the `rascunho()` method. `numeroFolhasRascunho` is a stale remnant that adds noise to the class shape.

**Fix:** Remove lines 16 and 38 entirely.

---

### IN-03: Method name typo `avalicaoHtml()` — missing letter 'a'

**File:** `src/LayoutAvaliacao.ts:27`
**Issue:** The method is spelled `avalicaoHtml` (should be `avaliacaoHtml`). Both the definition and the single call site in `LayoutAvaliacaoBuilder.ts:171` use the misspelling consistently, so there is no runtime error. Because the method is internal (not on the public surface), this is a low-priority cosmetic issue, but it makes the codebase harder to grep and is confusing for future contributors.

**Fix:** Rename to `avaliacaoHtml()` and update `LayoutAvaliacaoBuilder.ts:171` accordingly.

---

### IN-04: `console.error` left in library code

**File:** `src/LayoutAvaliacao.ts:53`
**Issue:** `console.error("Error parsing question content", e)` is production code in a distributable library. It writes to the host application's console unconditionally whenever a question has malformed `visualizaQuestaoRaw` content. Library code should not produce console output without the host's knowledge or consent.

**Fix:** Either remove the log entirely and let the silent fallback to `{}` handle it, or expose an optional error callback on the builder so the host can decide how to handle parse failures:
```typescript
// Silent fallback (simplest):
} catch (_e) {
    // visualizaQuestaoRaw was not valid JSON; parsedContent stays {}
}
```

---

### IN-05: `_mapToEntity` uses underscore-private convention but is a public TypeScript method

**File:** `src/LayoutAvaliacao.ts:42`
**Issue:** The method is named `_mapToEntity` using the JavaScript `_`-prefix convention to signal "private", but TypeScript does not enforce this — the method is accessible to any caller. Given `strict: false` and the project's lenient style, this is a low-priority pattern inconsistency. Since `LayoutAvaliacao` itself is not exported from `index.ts`, external callers cannot reach it anyway, but the inconsistency is worth noting if `LayoutAvaliacao` is ever added to the public surface.

**Fix:** Add the `private` modifier: `private _mapToEntity(input: AssessmentInput)`.

---

_Reviewed: 2026-06-01T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
