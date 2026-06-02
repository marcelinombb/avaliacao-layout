---
phase: 02-adapter-builder
fix_date: 2026-06-01
findings_fixed:
  critical: 1
  warning: 4
  total: 5
status: fixed
---

# Phase 02: Code Review Fixes

## Fixes Applied

### CR-01: JSON.parse(null) crash in _mapToEntity
- **File:** `src/LayoutAvaliacao.ts:50-54`
- **Fix:** Introduced a local `parsed` variable and added a guard `if (parsed !== null && typeof parsed === 'object')` before assigning to `parsedContent`. When `visualizaQuestaoRaw` is `null`, `JSON.parse(null)` returns `null` without throwing — the guard now prevents that `null` from overwriting `parsedContent`, so the `htmlFields.forEach` below never receives a null receiver. Removed the `console.error` call (silent fallback via comment).
- **Commit:** a950812

### WR-01: comMarcaDaguaRascunho and quantidadeFolhasRascunho not initialized in constructor
- **File:** `src/LayoutAvaliacaoBuilder.ts:28-48`
- **Fix:** Added `this.comMarcaDaguaRascunho = false` and `this.quantidadeFolhasRascunho = 0` at the end of the constructor. Removed the stale `this.numeroFolhasRascunho = null` initialization (dead field) and its corresponding class property declaration.
- **Commit:** 43dd8db

### WR-02: q.questao accessed without null guard in adapter
- **File:** `src/adapter/ProvaModelo3Adapter.ts:7-8`
- **Fix:** Added `.filter(q => q.questao != null)` between the `(listaProvaQuestao || [])` array and the `.map()` call. Items whose `questao` sub-object is missing or null are silently skipped rather than crashing the entire adapter call.
- **Commit:** 3d4e592

### WR-03: CSS injection via unescaped watermark URLs and _identificacao
- **File:** `src/LayoutAvaliacaoBuilder.ts:158-186`
- **Fix:** Added two sanitizer helpers inside `build()`: `safeCssUrl` (encodes `"`, `)`, `\`, newline, carriage-return via `encodeURIComponent`) and `safeCssString` (backslash-escapes `"` and `\`). Applied `safeCssUrl` to both watermark URL values and `safeCssString` to `_identificacao` before interpolating into CSS custom-property values.
- **Commit:** a965b65

### WR-04: rascunhoHtml() accepts null without guard
- **Files:** `src/LayoutAvaliacaoBuilder.ts:96-99`, `src/rendering/AssessmentHtmlRenderer.ts:16`
- **Fix:**
  - In `rascunhoHtml()`: Changed `this._rascunhoHtml = rascunhoHtml` to `this._rascunhoHtml = rascunhoHtml ?? ""` so `null` and `undefined` are normalised to an empty string at the setter.
  - In `AssessmentHtmlRenderer.render()`: Extracted `const rascunhoContent = this.options.rascunho || ""` and used that variable in the template literal, preventing `null` or `undefined` from being coerced to the strings `"null"` or `"undefined"` in rendered draft pages.
- **Commit:** 99a7b54

## Verification
- `tsc --noEmit`: passed (0 errors)
- Files modified: 4
  - `src/LayoutAvaliacao.ts`
  - `src/LayoutAvaliacaoBuilder.ts`
  - `src/adapter/ProvaModelo3Adapter.ts`
  - `src/rendering/AssessmentHtmlRenderer.ts`
