# Phase 2: Adapter & Builder - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 3 new/modified files
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/adapter/ProvaModelo3Adapter.ts` | utility/adapter | transform | `src/LayoutAvaliacao.ts` `_mapToEntity()` | role-match (field mapping logic is identical shape) |
| `src/LayoutAvaliacaoBuilder.ts` | builder | request-response | self (modifications only) | exact |
| `src/LayoutAvaliacao.ts` | orchestrator | request-response | self (modifications only) | exact |

---

## Pattern Assignments

### `src/adapter/ProvaModelo3Adapter.ts` (new file, utility/adapter, transform)

**Analog:** `src/LayoutAvaliacao.ts` lines 41–107 (`_mapToEntity`)

**Imports pattern** — model from `src/index.ts` lines 1–4 and `src/LayoutAvaliacao.ts` lines 1–4:
```typescript
import { AssessmentInput, QuestionInput, AttachmentInput, AssessmentLayoutInput } from '../types/AssessmentInput';
```
- Only named imports from `../types/AssessmentInput`
- No runtime dependencies — pure transform function
- No default export; single named function export only

**Core transform pattern** — derived from `src/LayoutAvaliacao.ts` lines 41–107:
```typescript
export function fromProvaModelo3(provaModelo3): AssessmentInput {
    const { prova, listaProvaQuestao, listaProvaAnexo } = provaModelo3;

    const questions: QuestionInput[] = (listaProvaQuestao || []).map(q => ({
        id: q.questao.codigo,
        order: q.ordem,
        title: q.titulo,
        customOrder: q.ordemPersonalizada,
        value: q.valor,
        type: q.questao.tipoQuestao,
        reference: q.questao.referencia,
        orderAlternative: q.ordemAlternativa,
        visualizaQuestaoRaw: q.questao.visualizaQuestao,
        linhasBranco: q.linhasBranco,
        quebraPagina: q.quebraPagina,
        visualizaResposta: q.questao.visualizaResposta,
        tipoLinha: q.tipoLinha,
        numeroLinhas: q.numeroLinhas,
    }));

    const attachments: AttachmentInput[] = listaProvaAnexo || [];

    const layout: AssessmentLayoutInput = prova?.layout || {};

    return {
        id: prova?.id,
        title: prova?.descricao,
        questions,
        attachments,
        layout,
    };
}
```

Key rules:
- `visualizaQuestaoRaw` is passed through as-is (raw JSON string); NO `JSON.parse` here — that stays in `_mapToEntity()`
- `listaProvaAnexo` maps directly to `attachments` — the `AttachmentInput` shape already matches the raw shape
- `prova.layout` maps directly to `layout` — same shape as `AssessmentLayoutInput`
- Optional chaining (`?.`) for `prova` fields — copy pattern from `src/LayoutAvaliacao.ts` lines 100–106

**Error handling pattern** — no try/catch in the adapter; errors propagate naturally (same as all domain files in this project — no defensive error wrapping at the transform layer)

---

### `src/LayoutAvaliacaoBuilder.ts` (modified, builder, request-response)

**Analog:** self — read `src/LayoutAvaliacaoBuilder.ts` in full above

**Change 1: rename `marcaDaquaRascunho` → `marcaDaguaRascunho` (URL setter)**

Old lines 74–77 to REMOVE:
```typescript
marcaDaquaRascunho(marcaDaguaUrl) {
    this._marcaDaquaRascunho = marcaDaguaUrl;
    return this;
}
```

Replace with (correct spelling, same body):
```typescript
marcaDaguaRascunho(marcaDaguaUrl: string) {
    this._marcaDaquaRascunho = marcaDaguaUrl;
    return this;
}
```

**Change 2: rename boolean `marcaDaguaRascunho` → `habilitarMarcaDaguaRascunho`**

Old lines 54–57 to REMOVE:
```typescript
marcaDaguaRascunho(comMarcaDagua) {
    this.comMarcaDaguaRascunho = comMarcaDagua;
    return this;
}
```

Replace with:
```typescript
habilitarMarcaDaguaRascunho(enabled: boolean) {
    this.comMarcaDaguaRascunho = enabled;
    return this;
}
```

**Change 3: remove dead `pagina` field**

Remove from class property declaration (line 15):
```typescript
pagina: any;
```

Remove from constructor initialization (lines 38–41):
```typescript
this.pagina = {
    header: "",
    footer: "",
};
```

**Change 4: update `build()` signature and `quebraQuestao` read**

Old signature (line 162):
```typescript
build(provaModelo) {
```

New signature:
```typescript
build(input: AssessmentInput) {
```

Old `quebraQuestao` read inside `build()` (line 169):
```typescript
quebraQuestao: provaModelo.prova.quebraQuestao,
```

New read (field already exists in `AssessmentLayoutInput` — `src/types/AssessmentInput.ts` line 34):
```typescript
quebraQuestao: input.layout?.quebraQuestao,
```

Old constructor call (lines 163–172):
```typescript
const layoutAvaliacao = new LayoutAvaliacao(provaModelo, {
```

New constructor call:
```typescript
const layoutAvaliacao = new LayoutAvaliacao(input, {
```

**Import addition** — add `AssessmentInput` import at top of file:
```typescript
import { AssessmentInput } from './types/AssessmentInput';
```

Pattern: follow `src/LayoutAvaliacao.ts` lines 1–4 style (named ES module import, relative path).

---

### `src/LayoutAvaliacao.ts` (modified, orchestrator, request-response)

**Analog:** self — read in full above

**Change 1: add `AssessmentInput` import**

After existing imports (lines 1–4), add:
```typescript
import { AssessmentInput } from './types/AssessmentInput';
```

**Change 2: retype constructor and property**

Old class property (line 18):
```typescript
provaModelo: any;
```

New:
```typescript
input: AssessmentInput;
```

Old constructor (lines 21–24):
```typescript
constructor(provaModelo: any, layoutOptions: any) {
    this.provaModelo = provaModelo;
```

New:
```typescript
constructor(input: AssessmentInput, layoutOptions: any) {
    this.input = input;
```

**Change 3: update `avalicaoHtml()` call to `_mapToEntity`**

Old (line 28):
```typescript
const assessment = this._mapToEntity(this.provaModelo);
```

New:
```typescript
const assessment = this._mapToEntity(this.input);
```

**Change 4: update `_mapToEntity()` to accept `AssessmentInput`**

Old signature (line 41):
```typescript
_mapToEntity(rawData) {
```

New signature:
```typescript
_mapToEntity(input: AssessmentInput) {
```

Old destructure (line 42):
```typescript
const { prova, listaProvaQuestao, listaProvaAnexo } = rawData;
```

New destructure — map `AssessmentInput` fields to the local variable names used throughout the method:
```typescript
const { questions: rawQuestions, attachments: listaProvaAnexo, layout: prova, id, title } = input;
const listaProvaQuestao = rawQuestions || [];
```

Note: the rest of the method body reads `q.questao.codigo`, `q.ordem`, etc. — but after the adapter change, `_mapToEntity` now receives `QuestionInput[]` (already-mapped fields), so the internal `q.*` field reads must be updated to read from `QuestionInput` fields directly:

Old per-question mapping (lines 46–64) reads raw shape:
```typescript
id: q.questao.codigo,
order: q.ordem,
title: q.titulo,
customOrder: q.ordemPersonalizada,
value: q.valor,
type: q.questao.tipoQuestao,
reference: q.questao.referencia,
orderAlternative: q.ordemAlternativa,
visualizaQuestaoRaw: q.questao.visualizaQuestao
```

New reads from `QuestionInput` (field names from `src/types/AssessmentInput.ts` lines 44–59):
```typescript
id: q.id,
order: q.order,
title: q.title,
customOrder: q.customOrder,
value: q.value,
type: q.type,
reference: q.reference,
orderAlternative: q.orderAlternative,
visualizaQuestaoRaw: q.visualizaQuestaoRaw
```

The `JSON.parse(q.questao.visualizaQuestao)` line (line 49) becomes:
```typescript
parsedContent = JSON.parse(q.visualizaQuestaoRaw);
```

Post-`new Question()` field assignments (lines 77–82) become:
```typescript
question.linhasBranco = q.linhasBranco;
question.quebraPagina = q.quebraPagina;
question.visualizaResposta = q.visualizaResposta;
question.tipoLinha = q.tipoLinha;
question.numeroLinhas = q.numeroLinhas;
```
(Field names already match `QuestionInput` — no change needed here.)

`new Assessment()` call (lines 100–106) becomes:
```typescript
return new Assessment({
    id: input.id,
    title: input.title,
    questions: questions,
    attachments: listaProvaAnexo || [],
    layout: input.layout || {}
});
```

---

### `src/index.ts` (modified, config/entry, request-response)

**Analog:** self — read in full above (`src/index.ts` lines 1–10)

**Change: add `fromProvaModelo3` named export**

Current exports pattern (lines 7–10):
```typescript
export {
    createLayout, LayoutAvaliacaoBuilder, replacePlaceholders, latexParser, LayoutRenderer
}
export type { AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput, ReferenceInput } from './types/AssessmentInput';
```

Add import at top of file:
```typescript
import { fromProvaModelo3 } from './adapter/ProvaModelo3Adapter';
```

Add to the value exports block:
```typescript
export {
    createLayout, LayoutAvaliacaoBuilder, replacePlaceholders, latexParser, LayoutRenderer, fromProvaModelo3
}
```

Alternatively (per D-04 decision), use direct re-export:
```typescript
export { fromProvaModelo3 } from './adapter/ProvaModelo3Adapter';
```

The re-export form (`export { X } from './...'`) matches the type-export pattern already in the file (line 10) and avoids an extra import statement. Prefer this form.

---

## Shared Patterns

### Fluent builder method pattern
**Source:** `src/LayoutAvaliacaoBuilder.ts` lines 54–57, 59–62, 69–72, 74–77
**Apply to:** All builder method changes
```typescript
methodName(param) {
    this._field = param;
    return this;
}
```
Every setter returns `this` for chaining.

### Optional chaining for nullable nested fields
**Source:** `src/LayoutAvaliacao.ts` lines 100–106
**Apply to:** `fromProvaModelo3()` adapter and updated `_mapToEntity()`
```typescript
id: prova?.id,
title: prova?.descricao,
layout: prova?.layout || {}
```
Use `?.` for fields that may be absent; use `|| []` / `|| {}` for array/object defaults.

### Named export, no default export
**Source:** `src/index.ts` lines 7–10, `src/LayoutAvaliacao.ts` line 17, `src/LayoutAvaliacaoBuilder.ts` line 10
**Apply to:** `src/adapter/ProvaModelo3Adapter.ts`
All modules use named exports only — no `export default`. The adapter must follow this: `export function fromProvaModelo3(...)`.

### Relative import paths
**Source:** `src/LayoutAvaliacao.ts` lines 1–4, `src/LayoutAvaliacaoBuilder.ts` line 1
**Apply to:** All new imports added in this phase
```typescript
import { Assessment } from "./domain/Assessment";
import { LayoutAvaliacao } from "./LayoutAvaliacao";
```
Relative paths with no path aliases — use `./` or `../` prefix.

---

## No Analog Found

No files in this phase lack an analog. The adapter pattern is novel in the codebase but the field mapping logic is fully derivable from the existing `_mapToEntity()` body in `src/LayoutAvaliacao.ts`.

---

## Metadata

**Analog search scope:** `src/` (all files)
**Files scanned:** 4 key files read in full
**Pattern extraction date:** 2026-06-01
