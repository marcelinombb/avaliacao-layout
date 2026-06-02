# Phase 1: Type Foundation - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 4 (1 new, 3 modified)
**Analogs found:** 3 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/AssessmentInput.ts` | type/model | — (pure types, no runtime) | `src/domain/Assessment.ts` | role-match (same interface-declaration style) |
| `src/domain/Question.ts` | model | — (pure types + entity class) | `src/domain/Assessment.ts` | exact (same file structure: interfaces + class) |
| `src/domain/Assessment.ts` | model | — (pure types + entity class) | `src/domain/Question.ts` | exact (same file structure: interfaces + class) |
| `src/index.ts` | entry-point / re-export | — | `src/index.ts` (self) | exact |

---

## Pattern Assignments

### `src/types/AssessmentInput.ts` (new file — pure type definitions)

**Analog:** `src/domain/Assessment.ts`

This file does not exist yet. Model it on the interface-declaration style used in `src/domain/Assessment.ts`.

**Imports pattern** — Assessment.ts lines 1-1 (no runtime imports needed for a type-only file):
```typescript
// No imports required — all types are primitives or locally defined sub-interfaces.
// If ReferenceInput needs to reference the Reference interface, import it:
// import type { Reference } from '../domain/Question';
```

**Interface declaration style** (`src/domain/Assessment.ts` lines 3-43):
```typescript
export interface Attachment {
    ordem?: number;
    anexo?: {
        texto?: string;
        [key: string]: any;  // ← Phase 1 removes this pattern; shown here as the BEFORE
    };
    [key: string]: any;      // ← remove for AssessmentInput
}

export interface AssessmentLayout {
    codigo?: number;
    nome?: string;
    // ... each field explicit, no index signature
}
```

**Target pattern for `AssessmentInput.ts`** — concrete interfaces with no `any`, no index signatures:
```typescript
export interface AssessmentLayoutInput {
    codigo?: number;
    nome?: string;
    cabecalho?: string;
    rodape?: string;
    folhaRosto?: string;
    paginacao?: string;
    tipoFolha?: string;
    margem?: number;
    cabecalhoQuestao?: string;
    cabecalhoPrimeiraQuestao?: string;
    orientacaoFolha?: string;
    rodapeRosto?: string | null;
    rascunho?: string;
    colunas?: number;
    marcaDagua?: string;
    fonte?: string;
    fonteTamanho?: number;
    origemQuestao?: boolean;
    ordemQuestaoPersonalizada?: boolean;
    tipoAlternativa?: number;
    quebraQuestao?: boolean;
}

export interface AttachmentInput {
    ordem?: number;
    anexo?: {
        texto?: string;
    };
}

export interface ReferenceInput {
    codigo?: number | null;
    descricao?: string | null;
    autor?: string;
    texto?: string | null;
    fonte?: {
        codigo: number;
        descricao: string;
        anoFonte?: number;
    } | null;
}

export interface QuestionInput {
    id?: number | string;
    order: number;
    customOrder?: number | null;
    value: number;
    type: string;
    reference?: ReferenceInput | null;
    visualizaQuestaoRaw?: string | null;
    orderAlternative?: number;
    title?: string | null;
    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: { codigo: number; nome: string } | null;
    numeroLinhas?: number;
}

export interface AssessmentInput {
    id?: number | string;
    title?: string;
    questions?: QuestionInput[];
    attachments?: AttachmentInput[];
    layout?: AssessmentLayoutInput;
}
```

---

### `src/domain/Question.ts` (modify — narrow `any` fields)

**Analog:** `src/domain/Assessment.ts` (same pattern: interfaces at top, class below)

**Current interface with `any` fields** (`src/domain/Question.ts` lines 17-28):
```typescript
export interface QuestionContent {
    fonte?: string;
    instrucao?: string;
    textoBase?: string;
    comando?: string;
    justificarFalsas?: boolean;
    alternativas?: string[];
    afirmacoes?: any[];       // ← replace
    associacoes?: any;        // ← replace
    assercoes?: any;          // ← replace
    visualizaQuestaoParsed?: any; // ← replace or remove
}
```

**Target pattern — add sub-interfaces before `QuestionContent`:**
```typescript
export interface AfirmacaoItem {
    item: string;
    descricao: string;
}

export interface AssociacaoItem {
    item: string;
    descricao: string;
}

export interface AssociacoesContent {
    coluna1: AssociacaoItem[];
    coluna2: AssociacaoItem[];
}

export interface AssercoesContent {
    assercao1?: string;
    assercao2?: string;
}

export interface TipoLinha {
    codigo: number;
    nome: string;
}

export interface QuestionContent {
    fonte?: string;
    instrucao?: string;
    textoBase?: string;
    comando?: string;
    justificarFalsas?: boolean;
    alternativas?: string[];
    afirmacoes?: AfirmacaoItem[];
    associacoes?: AssociacoesContent | null;
    assercoes?: AssercoesContent | null;
}
```

**Current `any` fields on `QuestionConstructor`** (lines 30-45) — same narrowing applies:
```typescript
export interface QuestionConstructor {
    // ...
    content?: any;        // ← keep as-is or type as QuestionContent; not on public path
    alternatives?: string[];
    afirmacoes?: any[];   // ← AfirmacaoItem[]
    associacoes?: any;    // ← AssociacoesContent | null
    assercoes?: any;      // ← AssercoesContent | null
    // ...
}
```

**Current class fields with `any`** (lines 47-71) — match constructor types:
```typescript
export class Question {
    // ...
    afimacoes: any[];     // ← AfirmacaoItem[]
    associacoes: any;     // ← AssociacoesContent | null
    assercoes: any;       // ← AssercoesContent | null
    tipoLinha?: string | null;  // ← TipoLinha | null  (type mismatch — fixture shows object)
    // ...
}
```

**Reference interface `any` fields** (lines 1-15) — narrow two fields:
```typescript
export interface Reference {
    // ...
    instituicao?: any;       // ← string | null (never accessed in rendering path)
    totalRegistros?: any;    // ← number | null (backend pagination, not rendering)
}
```

---

### `src/domain/Assessment.ts` (modify — narrow `any` fields, remove index signature)

**Analog:** `src/domain/Question.ts` (same pattern; both are being narrowed in this phase)

**Current `any` fields in `AssessmentLayout`** (lines 12-43):
```typescript
export interface AssessmentLayout {
    // ...
    instituicao?: any;          // ← string | null
    ativo?: any;                // ← boolean | null
    rodapeUltimaPagina?: any;   // ← string | null
    espacamentoLinhas?: any;    // ← string | null
    mapa?: any;                 // ← unknown (not accessed in rendering path)
    identificado?: any;         // ← unknown (not accessed in rendering path)
    totalRegistros?: any;       // ← number | null
    [key: string]: any;         // ← REMOVE index signature
}
```

**Current `any` fields in `Attachment`** (lines 3-10):
```typescript
export interface Attachment {
    ordem?: number;
    anexo?: {
        texto?: string;
        [key: string]: any;   // ← REMOVE
    };
    [key: string]: any;       // ← REMOVE
}
```

**Class constructor pattern** (lines 53-66) — unchanged; only interface fields change:
```typescript
constructor({ id, title, questions = [], attachments = [], layout = {} }: AssessmentConstructor) {
    this.id = id;
    this.title = title;
    this.questions = questions;
    this.attachments = attachments;
    this.layout = layout;
}
```

---

### `src/index.ts` (modify — add export)

**Analog:** `src/index.ts` (self — extend existing export list)

**Current export pattern** (lines 1-9):
```typescript
import { LayoutAvaliacaoBuilder } from './LayoutAvaliacaoBuilder';
import { PagedJsRenderer as LayoutRenderer } from './rendering/PagedJsRenderer';
import latexParser from './rendering/utils/latexParser';
import { replacePlaceholders } from './rendering/utils/util';
const createLayout = () => new LayoutAvaliacaoBuilder();

export {
    createLayout, LayoutAvaliacaoBuilder, replacePlaceholders, latexParser, LayoutRenderer
}
```

**Target addition — type-only export appended after existing exports:**
```typescript
export type { AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput, ReferenceInput } from './types/AssessmentInput';
```

Use `export type { ... }` (not `export { ... }`) — preserves the pattern that runtime values use the value-export form while pure types use the type-export form. This also ensures tree-shaking eliminates the import entirely in CJS/UMD bundles.

---

## Shared Patterns

### Interface-only file structure
**Source:** `src/domain/Assessment.ts` and `src/domain/Question.ts`
**Apply to:** `src/types/AssessmentInput.ts`

Pattern: interfaces are declared with `export interface`, each field on its own line with `?:` for optional fields. Sub-interfaces for nested objects are declared above the interface that references them (declaration order = dependency order). No class definitions in a pure-types file.

### `export type` for re-exporting types
**Source:** TypeScript convention; `src/index.ts` currently uses value exports only
**Apply to:** The new export line in `src/index.ts`

```typescript
export type { AssessmentInput, ... } from './types/AssessmentInput';
```

Using `export type` is the correct form for type-only exports under `moduleResolution: "bundler"` and ensures `rollup-plugin-dts` picks them up correctly.

### Compiler verification after each file change
**Source:** RESEARCH.md pitfall documentation
**Apply to:** Every task that modifies a `.ts` file

Run `npx tsc --noEmit` after each file is modified. If new errors surface (especially after removing `[key: string]: any` from `AssessmentLayout`), add the accessed field to the interface rather than re-adding the index signature. The compiler must remain at zero errors throughout.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/types/AssessmentInput.ts` | model/types | — | Directory `src/types/` does not exist yet; file is entirely new. Pattern derived from `src/domain/Assessment.ts` interface style, but the content (public input contract, no index signatures, no `any`) has no existing equivalent in the codebase. |

---

## Metadata

**Analog search scope:** `src/domain/`, `src/index.ts`
**Files scanned:** 4 (Assessment.ts, Question.ts, index.ts, ReferenceService.ts implied)
**Pattern extraction date:** 2026-06-01
