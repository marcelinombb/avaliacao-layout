---
phase: 01-type-foundation
status: findings
reviewed: 2026-06-01
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/types/AssessmentInput.ts
  - src/index.ts
  - src/domain/Question.ts
  - src/domain/Assessment.ts
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
---

# Phase 01: Type Foundation — Code Review Report

**Reviewed:** 2026-06-01
**Depth:** standard
**Files Reviewed:** 4
**Status:** findings

## Summary

Four files were reviewed: the new `AssessmentInput.ts` public type contract, a modified `index.ts` export line, and the narrowed domain entities `Question.ts` and `Assessment.ts`. No security surface is introduced (pure type definitions and domain entities with no I/O). No critical bugs were found.

The primary issues are: (1) a field-name typo in the `Question` class that silently discards all affirmation data (`afimacoes` vs `afirmacoes`); (2) `QuestionInput` missing fields that `LayoutAvaliacao._mapToEntity` reads directly from the raw payload at runtime, meaning the public contract does not describe the actual wire format consumed; (3) `AssessmentInput` is structurally misaligned with the real `provaModelo3` shape — the library entry point `build()` receives `provaModelo3` but `AssessmentInput` models only a sub-shape of it; and (4) several `any` fields survive in `QuestionConstructor` and the `Question` class body despite this phase's stated goal.

---

## Warnings

### WR-01: Typo in `Question` class — `afimacoes` silently drops all affirmation data

**File:** `src/domain/Question.ts:80`

**Issue:** The class property is declared as `afimacoes` (missing the `r`) but the constructor parameter is `afirmacoes` and the assignment on line 123 writes to `this.afimacoes`. Every caller that reads `question.afimacoes` gets the data; every caller that reads `question.afirmacoes` (the correctly spelled name used everywhere else — `QuestionConstructor`, `AfirmacaoItem[]`, Handlebars template `statements.hbs` via `visualizaQuestaoParsed.afirmacoes`) gets `undefined`. The constructor default `afirmacoes = []` is consumed correctly, but the property stored on the instance has the wrong name, making it unreachable through the typed surface.

At runtime the `statements.hbs` template reads `question.visualizaQuestaoParsed.afirmacoes` (from the parsed JSON, not from the class property), so rendering currently works by accident via the parsed content bag rather than the typed field. However, any code that accesses the class property directly (`question.afimacoes`) will receive the data while TypeScript believes the correct field is `afimacoes` — this will break if any future accessor uses the typed name.

**Fix:**
```typescript
// src/domain/Question.ts line 80 — rename the class property
afirmacoes: AfirmacaoItem[];   // was: afimacoes
// line 123 — update the assignment
this.afirmacoes = afirmacoes || [];  // was: this.afimacoes
```

---

### WR-02: `QuestionInput` omits fields that `_mapToEntity` reads from the raw payload

**File:** `src/types/AssessmentInput.ts:44-59`

**Issue:** `LayoutAvaliacao._mapToEntity` destructures the raw data as `{ prova, listaProvaQuestao, listaProvaAnexo }` and accesses:
- `q.questao.codigo` (mapped to `id`)
- `q.questao.tipoQuestao` (mapped to `type`)
- `q.questao.referencia` (mapped to `reference`)
- `q.questao.visualizaQuestao` (the JSON string, mapped to `visualizaQuestaoRaw`)
- `q.questao.visualizaResposta` (mapped to `visualizaResposta`)
- `q.ordemPersonalizada` (mapped to `customOrder`)
- `q.valor` (mapped to `value`)
- `q.ordem` (mapped to `order`)
- `q.titulo` (mapped to `title`)
- `q.ordemAlternativa` (mapped to `orderAlternative`)
- `q.tipoLinha` (mapped to `tipoLinha`)
- `q.linhasBranco` (mapped to `linhasBranco`)
- `q.numeroLinhas` (mapped to `numeroLinhas`)
- `q.quebraPagina` (mapped to `quebraPagina`)

`QuestionInput` as defined models the *output/constructor shape* rather than the *wire input shape*. There is no `questao` sub-object, no `valor`, no `ordem`, no `ordemPersonalizada`, etc. The public type `AssessmentInput` therefore does not describe what `build(provaModelo)` actually accepts, defeating the goal of eliminating `any` on the public API.

**Fix:** `QuestionInput` should model the raw `listaProvaQuestao[n]` element shape, with a nested `questao` object. Alternatively, if the intent is to keep `QuestionInput` as an intermediate shape (not the wire format), then `AssessmentInput` must not be the type passed to `build()` and that distinction needs to be documented or enforced with a separate `ProvaModeloInput` type.

---

### WR-03: `AssessmentInput` models a sub-shape, not the actual `build()` argument shape

**File:** `src/types/AssessmentInput.ts:61-67`

**Issue:** `LayoutAvaliacaoBuilder.build(provaModelo)` receives an object with the shape `{ prova, listaProvaQuestao, listaProvaAnexo, nome, fonteTamanho, ... }` (the `provaModelo3` structure). `AssessmentInput` has `{ id, title, questions, attachments, layout }` — this is closer to the `Assessment` entity shape than to the wire input. As a result, consumers who import `AssessmentInput` and type their call to `build()` will pass a structurally incompatible object, and TypeScript will not catch it because `build()` still accepts `any` (`provaModelo: any` in `LayoutAvaliacaoBuilder`).

The public export of `AssessmentInput` creates a false contract: it implies callers should construct this shape, but `build()` actually needs `provaModelo3`'s shape. This is a documentation/correctness mismatch.

**Fix:** Either (a) add a `ProvaModeloInput` type that captures the true wire shape `{ prova, listaProvaQuestao, listaProvaAnexo }` and type `build()` with it, or (b) clarify in a code comment that `AssessmentInput` is an internal intermediate and not the `build()` parameter type, and do not export it as the primary public contract.

---

### WR-04: `QuestionConstructor.content` remains `any` — stated goal not met

**File:** `src/domain/Question.ts:60` and `77`

**Issue:** `QuestionConstructor.content?: any` and `Question.content: any` survive unchanged. The `visualizaQuestaoParsed` property was correctly typed as `QuestionContent | null`, but `content` is still untyped. In `_mapToEntity`, `content` is never populated in the constructor call (the slot is omitted). Its presence as `any` means downstream code can assign arbitrary data to it without compiler feedback. The stated phase goal is "eliminating `any` on all public API surfaces."

**Fix:** Change to `content?: QuestionContent | null` or, if `content` is confirmed dead/unused, remove it entirely from `QuestionConstructor` and the class body.

---

### WR-05: `ReferenceInput.autor` is `string | undefined` but `Reference.autor` is `string` (non-optional) — structural mismatch between input and domain types

**File:** `src/types/AssessmentInput.ts:4` vs `src/domain/Question.ts:10`

**Issue:** `ReferenceInput.autor` is declared optional (`autor?: string`). The domain type `Reference.autor` is `string` (non-optional, no `null`). In `_mapToEntity`, `q.questao.referencia` is assigned directly to `reference` in the `Question` constructor (`reference: q.questao.referencia`). The real payload (confirmed from `prova-modelo.js` line 175) sends `"autor": ""` — so it is always present but may be an empty string. The mismatch between optional input and required domain field means that if a caller constructs a `ReferenceInput` without `autor` and that value is used where `Reference` is expected, TypeScript will not complain (because the input→domain mapping bypasses type checking through `any`), but runtime code that assumes `autor` is always a string will receive `undefined`.

**Fix:** Make `ReferenceInput.autor` consistently optional in both places, or add a mapping step that fills a default value:
```typescript
// In ReferenceInput keep optional as-is:
autor?: string;
// When mapping input → domain, provide a default:
autor: rawRef.autor ?? '',
```

---

## Info

### IN-01: `AssessmentLayout` has fields not present in `AssessmentLayoutInput` — dead public fields or missing coverage

**File:** `src/domain/Assessment.ts:10-40` vs `src/types/AssessmentInput.ts:13-35`

**Issue:** `AssessmentLayout` includes `instituicao`, `ativo`, `tamanhosSuportados`, `rodapeUltimaPagina`, `espacamentoLinhas`, `mapa`, `identificado`, `totalRegistros` — all of which appear in the real `provaModelo3.prova.layout` payload and are passed through `prova?.layout || {}`. None of these fields appear in `AssessmentLayoutInput`. If `AssessmentLayoutInput` is intended as the canonical public contract for the layout sub-object, it is incomplete relative to what `Assessment` actually stores.

**Fix:** Either add the missing fields to `AssessmentLayoutInput` to match `AssessmentLayout`, or document that `AssessmentLayoutInput` is a subset type and that the domain entity may receive extra fields.

---

### IN-02: `index.ts` exports `LayoutAvaliacao` indirectly as `LayoutRenderer` — confusing alias

**File:** `src/index.ts:2,8`

**Issue:** `PagedJsRenderer` is imported and immediately re-exported under the alias `LayoutRenderer`. This is pre-existing, not introduced by this phase, but the new `export type` line on line 10 increases the public surface. The alias `LayoutRenderer` is neither documented nor consistent with the project naming conventions (which use Portuguese names or descriptive English names — never opaque aliases). A consumer reading the exports will find `LayoutAvaliacaoBuilder` and `LayoutRenderer` with no indication that the latter is the Paged.js renderer.

**Fix:** No change required in this phase, but the alias should be resolved in a future cleanup phase.

---

### IN-03: `QuestionInput.id` typed `number | string` but real payload sends a string code like `"CHR-155777"`

**File:** `src/types/AssessmentInput.ts:45`

**Issue:** This is correctly typed as `number | string`. The real `questao.codigo` value from the payload is `"CHR-155777"` (a string with a vendor prefix), so the union is appropriate. However, `QuestionInput.id` sits at the wrong level — in the real payload `codigo` is on the nested `questao` sub-object, not on the `listaProvaQuestao` item itself. This is consistent with finding WR-02 and confirms the structural misalignment. Noting here for completeness.

**Fix:** Addressed by fixing WR-02.

---

_Reviewed: 2026-06-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
