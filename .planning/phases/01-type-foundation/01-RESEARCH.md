# Phase 1: Type Foundation - Research

**Researched:** 2026-06-01
**Domain:** TypeScript interface design, domain entity typing, public API surface
**Confidence:** HIGH

---

## Summary

Phase 1 introduces a clean, fully-typed public API surface for the library. The work is scoped to TypeScript `interface` definitions and class field annotations — no runtime behavior changes. The codebase already has interface definitions for `AssessmentLayout`, `AssessmentConstructor`, `QuestionContent`, `QuestionConstructor`, and `Reference` in the domain layer, but each contains `any` annotations on fields that are actually used during rendering. Eliminating those `any` annotations is the core work.

The five success criteria map cleanly to two clusters of files: (1) the `AssessmentInput` type file does not exist yet and must be created as the new public entry point, and (2) the existing domain types in `src/domain/Assessment.ts` and `src/domain/Question.ts` must have their `any` fields replaced with concrete types derived from what the Handlebars templates actually access.

The project explicitly keeps `"strict": false` and `"noImplicitAny": false` globally — this phase must not change `tsconfig.json`. All typing improvements are additive: replace `any` on specific fields with concrete types, export `AssessmentInput` from `src/index.ts`, and verify `tsc --noEmit` stays clean. No new packages are needed; no build tooling changes are required.

**Primary recommendation:** Create `src/types/AssessmentInput.ts` with the new public interfaces, update `Question` and `Assessment` domain classes to use concrete types on all rendering-path fields, and add the export to `src/index.ts`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INPUT-01 | Library accepts a clean `AssessmentInput` type as the primary input — contains only fields the renderer actually uses, with no backend DB shape leakage | New `AssessmentInput` interface file; fields identified by tracing `LayoutAvaliacao._mapToEntity()` |
| INPUT-02 | `AssessmentInput` defines typed sub-interfaces for layout config, questions, and attachments — no `any` on the public API boundary | Sub-interface shapes derived from templates and `_mapToEntity()` access patterns |
| TYPES-01 | Domain entities (`Assessment`, `Question`) use explicit typed interfaces — no `any` on fields accessed during rendering | All rendering-path fields audited; concrete types specified in findings below |
| TYPES-02 | `QuestionContent` interface covers all fields rendered by Handlebars templates: textoBase, comando, instrucao, fonte, alternativas, afirmacoes, associacoes, assercoes | Full template audit completed — all 8 fields catalogued with their types |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `AssessmentInput` type definition | Library public API | — | The type is the contract consumers import; it lives in `src/types/` and is re-exported from `src/index.ts` |
| `QuestionContent` interface | Domain layer | — | Describes the parsed JSON from `visualizaQuestao`; belongs in `src/domain/Question.ts` where the entity lives |
| `AssessmentLayout` typed fields | Domain layer | — | Already in `src/domain/Assessment.ts`; only needs `any` → concrete type substitutions |
| `tsc --noEmit` clean compile | Build pipeline | — | No code path changes; just interface alignment; TypeScript compiler is the verification tool |
| Public export of `AssessmentInput` | Library entry point | — | `src/index.ts` re-exports; `dist/avaliacao-layout.d.ts` carries it out via `rollup-plugin-dts` |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 (installed) | Static typing, interface declarations | Already the project's compiler; no change |

### Supporting
None — Phase 1 is pure type definitions. No new runtime or dev dependencies are introduced.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual `interface` definitions | `zod` schemas with `.infer<>` | Zod adds runtime validation (out of scope for this phase); pure interfaces are zero-overhead and match the project's current approach |
| Concrete interfaces for `AssessmentLayout` fields | Keep `[key: string]: any` index signature | Index signature makes the type almost useless for consumers; removing it and listing only the fields the renderer uses is the correct minimal-surface approach |

**Installation:** No new packages required.

---

## Package Legitimacy Audit

> No new packages are introduced in this phase. Section not applicable.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Consumer (host app)
  └─► import { AssessmentInput } from 'avaliacao-layout'    ← NEW export
         │
         ▼
  src/types/AssessmentInput.ts                               ← NEW file
  ├── AssessmentInput (top-level)
  │     ├── layout: AssessmentLayoutInput
  │     ├── questions: QuestionInput[]
  │     └── attachments: AttachmentInput[]
  │
  └── re-exported via src/index.ts → dist/avaliacao-layout.d.ts

  src/domain/Question.ts
  └── QuestionContent (EXISTING, fields tightened)
        ├── textoBase?: string
        ├── comando?: string
        ├── instrucao?: string
        ├── fonte?: string
        ├── alternativas?: string[]
        ├── afirmacoes?: AfirmacaoItem[]                     ← NEW sub-type
        ├── associacoes?: AssociacoesContent | null           ← NEW sub-type
        └── assercoes?: AssercoesContent | null               ← NEW sub-type

  src/domain/Assessment.ts
  └── AssessmentLayout (EXISTING, any fields narrowed)
```

### Recommended Project Structure

```
src/
├── types/
│   └── AssessmentInput.ts   # NEW — public input contract
├── domain/
│   ├── Assessment.ts        # MODIFY — narrow any fields in AssessmentLayout
│   └── Question.ts          # MODIFY — narrow QuestionContent, add sub-types
├── index.ts                 # MODIFY — add AssessmentInput export
└── ... (all other files unchanged)
```

### Pattern 1: Concrete Sub-Interfaces for Nested Objects

**What:** Replace `any` with a named interface that lists exactly the fields the renderer reads. Fields the renderer never touches are omitted.

**When to use:** Any field typed `any` that is accessed by name in a Handlebars template or in a rendering class.

**Example:**
```typescript
// Before (in Question.ts)
assercoes?: any;

// After — only the fields templates access
export interface AssercoesContent {
  assercao1?: string;   // used in assertions.hbs: {{{object.assercao1}}}
  assercao2?: string;   // used in assertions.hbs: {{{object.assercao2}}}
}

// In QuestionContent
assercoes?: AssercoesContent | null;
```

### Pattern 2: Minimal AssessmentInput as Separate Type File

**What:** `AssessmentInput` is a clean re-projection of the internal entity fields needed by `LayoutAvaliacao._mapToEntity()`. It is not the same as `AssessmentConstructor` (which is the domain entity constructor arg). The public type describes the input the consumer provides; it should not expose DB-leaked backend fields.

**When to use:** Any time a new public API type is introduced that consumers will `import`.

**Example:**
```typescript
// src/types/AssessmentInput.ts

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

### Pattern 3: Keep Index Signatures Only Where Truly Needed

**What:** `[key: string]: any` index signatures in `AssessmentLayout` and `Attachment` exist to absorb unknown backend fields. For the public `AssessmentInput` types, these must be removed. For the internal domain `AssessmentLayout`, the index signature can be removed by explicitly listing all fields the renderer reads.

**When to use:** Replace index signatures on types that have a known, bounded field set used during rendering.

**Anti-Patterns to Avoid**
- **Typing `QuestionContent` fields as `any[]` when the element shape is known:** `afirmacoes: any[]` forces callers and templates to cast. The fixture shows `afirmacoes` items have `{ item, descricao }` shape (same as associations). Define `AfirmacaoItem`.
- **Reusing the domain `AssessmentConstructor` as the public `AssessmentInput`:** They overlap but differ. `AssessmentConstructor` takes `Question[]` (domain entities); `AssessmentInput` should take `QuestionInput[]` (plain data). Conflating them leaks domain internals.
- **Widening a concrete type with `| any`:** Adding `| any` to a type makes it equivalent to `any`. Every replacement must be a real type.
- **Changing `tsconfig.json`:** The CLAUDE.md constraint says do not enable `strict` or `noImplicitAny` globally. Phase 1 types only the new interfaces and the specific fields listed in the success criteria.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deriving `QuestionContent` field types | Manual inspection of HTML output | Read Handlebars templates directly | Templates are the ground truth — every field accessed in `.hbs` files is a rendering dependency |
| Knowing `tipoLinha` shape | Guessing from type annotation | Read `prova-modelo.js` fixture | Fixture is the real backend payload; Question.ts had `tipoLinha?: string | null` but the actual data is `{ codigo: number; nome: string } \| null` |
| Verifying compile stays clean | Manual file-by-file review | `npx tsc --noEmit` | Compiler is authoritative; currently exits with zero errors and must stay that way |

**Key insight:** The templates are the authoritative spec for `QuestionContent`. Every `question.visualizaQuestaoParsed.<field>` access in a `.hbs` file is a required field. Any field not accessed in templates is irrelevant to TYPES-02.

---

## Common Pitfalls

### Pitfall 1: `tipoLinha` Type Mismatch
**What goes wrong:** `Question.tipoLinha` is declared `string | null` in the class, but in `prova-modelo.js` the field is `{ codigo: number; nome: string } | null`. The `responseBox.hbs` template accesses `question.tipoLinha.codigo`. With `strict: false` and `noImplicitAny: false` the compiler does not catch this, but the type in the class is factually wrong.
**Why it happens:** The property was annotated without checking the actual fixture shape.
**How to avoid:** Define `TipoLinha` interface; update the class field. The template access pattern confirms the `.codigo` sub-field is required.
**Warning signs:** `tipoLinha?: string | null` in the class vs. `"tipoLinha": { "codigo": 5, "nome": "..." }` in the fixture.

### Pitfall 2: Removing the Index Signature Causes Compile Errors
**What goes wrong:** `AssessmentLayout` has `[key: string]: any` which suppresses errors on any unknown-field access. Removing it may surface accesses to fields not yet listed in the interface.
**Why it happens:** Downstream code (handlers, `util.ts`, `replacePlaceholders`) may read layout fields not in the explicitly typed set.
**How to avoid:** Run `tsc --noEmit` after each interface change. Add fields that surface as errors before removing the index signature. The goal is that the compiler stays green — if an unknown field is accessed, either add it to the interface or leave the index signature and note it as out of scope.
**Warning signs:** Compile errors on `assessmentLayout.<fieldname>` in handlers after index signature removal.

### Pitfall 3: `AssessmentInput` vs `AssessmentConstructor` Confusion
**What goes wrong:** The planner creates tasks that conflate the new `AssessmentInput` public type with the existing `AssessmentConstructor` internal type, causing the builder or entity constructors to be incorrectly modified.
**Why it happens:** Both describe an assessment structure. They serve different purposes: `AssessmentConstructor` is for instantiating the `Assessment` domain entity (takes `Question[]` already-mapped entities); `AssessmentInput` is for consumers passing raw data into the library.
**How to avoid:** `AssessmentInput` is a new, separate type in `src/types/`. It does not replace `AssessmentConstructor`. Phase 2 will wire up the adapter that converts `AssessmentInput` to what `LayoutAvaliacao` expects. Phase 1 only creates the type definition.
**Warning signs:** Any plan task that modifies `LayoutAvaliacaoBuilder.build()` or `LayoutAvaliacao._mapToEntity()` to accept `AssessmentInput` — that is Phase 2 work.

### Pitfall 4: `afirmacoes` Shape vs `associacoes` Shape Confusion
**What goes wrong:** Both use `{ item, descricao }` items but in different container structures. `afirmacoes` is a flat array; `associacoes` is `{ coluna1: Item[], coluna2: Item[] }`. The `assercoes` object is `{ assercao1: string, assercao2: string }` — a completely different structure.
**Why it happens:** All three are typed `any` so their real shapes are not documented.
**How to avoid:** Derive types from the templates:
- `statements.hbs`: iterates `{{#each object}}` → array of `{ item: string; descricao: string }` → `AfirmacaoItem[]`
- `associations.hbs`: accesses `object.coluna1` and `object.coluna2` → `{ coluna1: AssociacaoItem[]; coluna2: AssociacaoItem[] }`
- `assertions.hbs`: accesses `object.assercao1` and `object.assercao2` → `{ assercao1?: string; assercao2?: string }`
**Warning signs:** Single `any[]` type used for all three fields.

### Pitfall 5: Rollup `dts` Bundle and New `src/types/` Folder
**What goes wrong:** The new `src/types/AssessmentInput.ts` file must be reachable by `rollup-plugin-dts` for the type declarations to appear in `dist/avaliacao-layout.d.ts`. If the file is not imported (directly or transitively) from `src/index.ts`, it will be omitted from the output.
**Why it happens:** `rollup-plugin-dts` bundles types by following the import graph from the entry point.
**How to avoid:** The `src/index.ts` re-export of `AssessmentInput` (and its sub-interfaces) is the essential last step. The build script in `package.json` generates `dist/index.d.ts` as `export * from './avaliacao-layout'`, so the chain is: `index.ts` → `types/AssessmentInput.ts` → re-exported via `rollup-plugin-dts` → `dist/avaliacao-layout.d.ts` → `dist/index.d.ts`.
**Warning signs:** Consumer's IDE cannot find `AssessmentInput` after `npm build` despite the source file existing.

---

## Code Examples

All types derived from direct template and fixture inspection. [VERIFIED via codebase grep]

### Complete Field Inventory: QuestionContent Fields Used in Templates

From `body.hbs` (the authoritative template): [VERIFIED: codebase read]

```typescript
// src/domain/Question.ts — updated QuestionContent

export interface AfirmacaoItem {
  item: string;        // {{this.item}} in statements.hbs
  descricao: string;   // {{this.descricao}} in statements.hbs
}

export interface AssociacaoItem {
  item: string;        // {{this.item}} in associations.hbs
  descricao: string;   // {{this.descricao}} in associations.hbs
}

export interface AssociacoesContent {
  coluna1: AssociacaoItem[];   // {{#each object.coluna1}} in associations.hbs
  coluna2: AssociacaoItem[];   // {{#each object.coluna2}} in associations.hbs
}

export interface AssercoesContent {
  assercao1?: string;   // {{{object.assercao1}}} in assertions.hbs
  assercao2?: string;   // {{{object.assercao2}}} in assertions.hbs
}

export interface QuestionContent {
  fonte?: string;                                // {{{question.visualizaQuestaoParsed.fonte}}}
  instrucao?: string;                            // {{{question.visualizaQuestaoParsed.instrucao}}}
  textoBase?: string;                            // {{{question.visualizaQuestaoParsed.textoBase}}}
  comando?: string;                              // {{{question.visualizaQuestaoParsed.comando}}}
  justificarFalsas?: boolean;                    // passed to statements partial
  alternativas?: string[];                       // {{#each object}} in alternatives.hbs — HTML strings
  afirmacoes?: AfirmacaoItem[];                  // {{#each object}} in statements.hbs
  associacoes?: AssociacoesContent | null;       // object.coluna1 / coluna2 in associations.hbs
  assercoes?: AssercoesContent | null;           // object.assercao1/assercao2 in assertions.hbs
}
```

### TipoLinha Interface (corrects existing type mismatch)

From `prova-modelo.js` fixture and `responseBox.hbs` template: [VERIFIED: codebase read]

```typescript
// src/domain/Question.ts

export interface TipoLinha {
  codigo: number;   // accessed as question.tipoLinha.codigo in responseBox.hbs helper
  nome: string;
}

// In Question class:
tipoLinha?: TipoLinha | null;   // was: string | null (incorrect)
```

### AssessmentLayout Fields to Narrow (removing index signature)

Fields that `AssessmentLayout` carries and that the renderer accesses directly: [VERIFIED: codebase read]

```typescript
// Accessed in templates or rendering classes:
// reference.hbs:     assessmentLayout.fonte, assessmentLayout.origemQuestao
// alternatives.hbs:  assessmentLayout.tipoAlternativa
// body.hbs:          (no direct layout access — comes through options)
// AssessmentHtmlRenderer.renderAttachments(): attachments only
// QuestionRenderer: passes assessmentLayout to context

// Fields to remove `any` from in AssessmentLayout:
instituicao?: string | null;    // was: any — only used as null check in reference.hbs
ativo?: boolean | null;         // was: any — never accessed in rendering path
rodapeUltimaPagina?: string | null; // was: any — never accessed in rendering path
espacamentoLinhas?: string | null;  // was: any — never accessed in rendering path
mapa?: unknown;                 // was: any — never accessed in rendering path
identificado?: unknown;         // was: any — never accessed in rendering path
totalRegistros?: number | null; // was: any — backend pagination field not used in rendering
```

### Export Addition to src/index.ts

```typescript
// src/index.ts — add this export
export type { AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput } from './types/AssessmentInput';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A — this is additive | New `AssessmentInput` type | Phase 1 | Consumers get IntelliSense and compile-time validation on the input they pass to the library |

**Deprecated/outdated:**
- `[key: string]: any` index signatures on `AssessmentLayout` and `Attachment`: these will be narrowed or removed as part of INPUT-02 compliance.
- `any[]` on `afirmacoes`, `associacoes`, `assercoes` in `QuestionContent`: replaced with concrete sub-interfaces.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `afirmacoes` items always have `{ item, descricao }` shape matching `AssociacaoItem` | Code Examples | If some question types produce items with different fields, the interface will need a union type — but only the fixture is available for verification, and it shows this shape consistently |
| A2 | Removing the `[key: string]: any` index signature from `AssessmentLayout` will not break compile — all accessed fields are in the explicit list | Common Pitfalls / Pitfall 2 | Unknown handler/util accesses to untyped layout fields may surface as errors; plan should include a compile check step after each interface change |
| A3 | `AssessmentLayout` fields typed `unknown` (mapa, identificado) are never accessed in any rendering path | Code Examples | If a handler accesses them, the type must be narrowed; grep found no accesses but `util.ts` has no type annotations and could access them indirectly |

---

## Open Questions

1. **Should `AssessmentInput` use `QuestionInput` (plain data) or a reference to the existing `QuestionConstructor`?**
   - What we know: `QuestionConstructor` has `content?: any` and several `any[]` fields — it is not clean enough to be the public type.
   - What's unclear: Whether Phase 2's adapter will map `QuestionInput` → `QuestionConstructor` explicitly, or whether Phase 1 should already design for that handoff.
   - Recommendation: Keep them separate. `QuestionInput` in the public `AssessmentInput` should be a clean, renderer-field-only shape. Phase 2 handles the wiring.

2. **How far to narrow `AssessmentLayout`?**
   - What we know: The `[key: string]: any` index signature swallows all compile-time errors on unknown fields. Removing it is ideal for INPUT-02.
   - What's unclear: `util.ts` (no type annotations) accesses `provaModelo.prova.layout.*` fields that may not all be in the typed set.
   - Recommendation: Add a compile-check task to the plan that runs `tsc --noEmit` after each interface change. If new errors surface, either add the field or document it as intentionally out-of-scope for Phase 1.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this phase is pure TypeScript interface definitions with no new tools, services, or CLIs required).

TypeScript compiler confirmed available: [VERIFIED: codebase check]
- `tsc --noEmit` exits 0 on current codebase (confirmed by running during research)
- TypeScript 5.9.3 installed (package.json specifies `^5.9.3`, installed version confirmed as 5.9.3)

---

## Project Constraints (from CLAUDE.md)

- **No breaking changes to rendering output** — Phase 1 is interface-only; no runtime behavior changes. This constraint is satisfied by design.
- **`fromProvaModelo3()` must accept the exact current `provaModelo3` shape without changes** — Phase 1 does not touch `fromProvaModelo3()` (that is Phase 2). No risk.
- **No test framework** — CLAUDE.md explicitly states "No test framework: validation is manual via the browser dev harness (`npm run dev`)". Success criterion 5 uses `tsc --noEmit` only, not a test runner. Validation Architecture section is omitted per `nyquist_validation: false` in config.json.
- **TypeScript `strict: false`, `noImplicitAny: false`** — `tsconfig.json` must not be changed. New interfaces are valid under the lenient config.
- **Bundle targets ESM + CJS + UMD must all continue to build** — interface-only changes cannot affect the bundle. New types are erased at compile time. No risk.
- **`LayoutAvaliacaoBuilder` public API must not break** — Phase 1 does not change any builder methods or their signatures.
- **GSD workflow enforcement** — Changes must go through a GSD execution command; direct repo edits outside workflow are not permitted.

---

## Validation Architecture

> Omitted — `nyquist_validation: false` in `.planning/config.json`.

The functional equivalent for this phase is: `tsc --noEmit` must exit 0 after all interface changes. This is the sole automated check available and must be included as a verification step in every plan task that modifies a `.ts` file.

---

## Security Domain

> No authentication, session management, access control, cryptography, or external input parsing is introduced in Phase 1. This phase adds only TypeScript interface declarations. ASVS categories V2-V6 do not apply.

V5 (Input Validation): the new `AssessmentInput` type is a compile-time contract, not runtime validation. No zod/joi/pydantic validation is added. If the planner adds runtime validation, that would introduce a new concern — but it is out of scope for Phase 1 per REQUIREMENTS.md.

---

## Sources

### Primary (HIGH confidence)
- `src/domain/Assessment.ts` — existing `AssessmentLayout`, `AssessmentConstructor`, `Attachment` interfaces
- `src/domain/Question.ts` — existing `QuestionContent`, `QuestionConstructor`, `Question` class
- `src/rendering/templates/*.hbs` — authoritative field inventory for `QuestionContent`
- `public/prova-modelo.js` — authoritative fixture for `tipoLinha`, `afirmacoes`, `associacoes` shapes
- `src/index.ts` — current public export surface
- `tsconfig.json` — TypeScript compiler options
- `package.json` — build scripts and type entry points
- `.planning/codebase/CONCERNS.md` — documented existing `any` debt
- `.planning/REQUIREMENTS.md` — scoped requirements INPUT-01, INPUT-02, TYPES-01, TYPES-02
- `.planning/ROADMAP.md` — phase success criteria

### Secondary (MEDIUM confidence)
- `src/LayoutAvaliacao.ts` `_mapToEntity()` — confirms which raw fields are mapped to `Question` properties (validates `tipoLinha`, `linhasBranco`, `quebraPagina`, `visualizaResposta`, `tipoLinha`, `numeroLinhas`)
- `src/rendering/components/QuadroRespostaRenderer.ts` — confirms `tipoLinha.codigo` is used as a `number` in the `switch` statement

### Tertiary (LOW confidence)
None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — TypeScript already installed and working; no new packages needed
- Architecture: HIGH — all files read directly; interface boundaries derived from templates and fixture (ground truth)
- Pitfalls: HIGH — concrete type mismatches found and documented (tipoLinha, index signatures); not speculative
- Field shapes: HIGH for `QuestionContent` (derived from `.hbs` templates); MEDIUM for `AssessmentLayout` any-narrowing (depends on full grep coverage of handlers)

**Research date:** 2026-06-01
**Valid until:** 2026-09-01 (stable domain — no external APIs or package updates in scope)
