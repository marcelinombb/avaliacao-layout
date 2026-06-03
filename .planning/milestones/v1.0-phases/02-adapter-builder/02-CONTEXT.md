# Phase 2: Adapter & Builder - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement `fromProvaModelo()` as a named export that maps the raw `provaModelo3` backend shape → `AssessmentInput`, update `build()` and `LayoutAvaliacao._mapToEntity()` to accept `AssessmentInput` as the canonical input type, and clean up the builder API (resolve the `marcaDagua` duplication, remove the dead `pagina` field).

</domain>

<decisions>
## Implementation Decisions

### Adapter: fromProvaModelo()
- **D-01:** New file at `src/adapter/ProvaModelo3Adapter.ts` in a new `src/adapter/` directory — mirrors the `src/domain/` and `src/types/` pattern
- **D-02:** `fromProvaModelo()` is the only export from the adapter file — no `ProvaModelo3` type exported; the raw backend shape is an internal implementation detail
- **D-03:** The adapter maps raw → `AssessmentInput` fields (top-level mapping only). `visualizaQuestao` passes through as a JSON string — `_mapToEntity()` continues to `JSON.parse` it internally. No change to parsing location.
- **D-04:** Exported as a named function from `src/index.ts`: `export { fromProvaModelo } from './adapter/ProvaModelo3Adapter'`

### Builder: build() signature
- **D-05:** `build()` is updated to accept `AssessmentInput` — `build(input: AssessmentInput)` is the new signature
- **D-06:** `LayoutAvaliacao._mapToEntity()` is updated to accept `AssessmentInput` directly — reads `input.layout`, `input.questions[]`, `input.attachments[]` instead of `provaModelo.prova`, `.listaProvaQuestao`, `.listaProvaAnexo`. The `visualizaQuestao` JSON string parsing stays inside `_mapToEntity()` unchanged.
- **D-07:** Usage pattern: `builder.build(fromProvaModelo(raw))` — adapter produces the input, builder consumes it

### Builder: marcaDagua resolution
- **D-08:** Two methods are kept, both with correct spelling:
  - `marcaDaguaRascunho(url: string)` — sets the CSS watermark URL (`--layout-watermark-rascunho`). This is the correctly-named URL-setter that replaces the old typo variant `marcaDaquaRascunho`.
  - `habilitarMarcaDaguaRascunho(enabled: boolean)` — sets the boolean flag `comMarcaDaguaRascunho` in `build()` output. Renamed from the old `marcaDaguaRascunho(bool)`.
- **D-09:** Old typo variant `marcaDaquaRascunho(url)` hard-removed — no deprecated alias. Host app (same team) updates the call site.
- **D-10:** Old boolean method `marcaDaguaRascunho(bool)` renamed to `habilitarMarcaDaguaRascunho(bool)` — hard-removed, no deprecated alias.

### Builder: dead field removal
- **D-11:** `pagina` field removed from `LayoutAvaliacaoBuilder` — removed from constructor initialization and class property declaration. It is initialized but never used in `build()`.

### Claude's Discretion
- How `_mapToEntity()` internally handles the `AssessmentInput` field mapping (field names, null coalescing) — follow existing patterns in the method
- Whether `src/adapter/ProvaModelo3Adapter.ts` needs any internal helper functions — Claude decides based on complexity of the mapping

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Type Contract (Phase 1 output)
- `src/types/AssessmentInput.ts` — The `AssessmentInput` interface that `fromProvaModelo()` must return and `build()` must accept. All 5 interfaces defined here: `AssessmentInput`, `AssessmentLayoutInput`, `QuestionInput`, `AttachmentInput`, `ReferenceInput`
- `src/index.ts` — Current public exports; new exports (`fromProvaModelo`) must be added here

### Builder (target of changes)
- `src/LayoutAvaliacaoBuilder.ts` — Full builder source; contains both `marcaDagua` methods, the dead `pagina` field, and the `build()` method to retype
- `src/LayoutAvaliacao.ts` — Contains `_mapToEntity()` which must be updated to accept `AssessmentInput`

### Requirements
- `.planning/REQUIREMENTS.md` — Requirements INPUT-03, BUILDER-01, BUILDER-02 are in scope for this phase
- `.planning/ROADMAP.md` §Phase 2 — Success criteria for this phase

### Fixture (validation reference)
- `public/prova-modelo.js` — The `provaModelo3` fixture used in the browser dev harness; `fromProvaModelo(provaModelo3)` must produce output that renders identically to the previous raw-input path

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/AssessmentInput.ts` — Pure interfaces file (no runtime code); `fromProvaModelo()` returns these types directly
- `src/domain/Question.ts` — Exports `AfirmacaoItem`, `AssociacaoItem`, `AssociacoesContent`, `AssercoesContent`, `TipoLinha` — the adapter may reference these for field shaping if needed

### Established Patterns
- **Pure-types file pattern**: `src/types/AssessmentInput.ts` has no imports and no runtime code — adapter file should have runtime code and import `AssessmentInput` types
- **Named re-export via index**: `src/index.ts` uses `export type { AssessmentInput, ... }` for types and `export { LayoutAvaliacaoBuilder, LayoutAvaliacao }` for classes — `fromProvaModelo` is a function export, same pattern as the class exports
- **`_mapToEntity()` field access pattern**: reads `q.questao.visualizaQuestao` (JSON string), `q.questao.codigo`, `q.ordem`, `q.titulo`, `q.questao.tipoQuestao`, etc. — the adapter maps these from the raw shape into `QuestionInput` fields
- **TypeScript strict OFF**: no type annotations required on internal variables; explicit types only on public API boundaries (function signature)

### Integration Points
- `src/LayoutAvaliacaoBuilder.ts` `build()` → calls `new LayoutAvaliacao(provaModelo, layoutOptions)` — after change, passes `input: AssessmentInput` instead
- `src/LayoutAvaliacao.ts` constructor accepts raw data today — must accept `AssessmentInput` after the change
- `LayoutAvaliacao._mapToEntity()` reads 3 top-level keys from raw data (`prova`, `listaProvaQuestao`, `listaProvaAnexo`) → maps to `AssessmentInput` fields (`layout`, `questions[]`, `attachments[]`, `title`, `id`)
- `provaModelo.prova.quebraQuestao` is currently read in `build()` directly (line 169 of builder): `quebraQuestao: provaModelo.prova.quebraQuestao` — after change, this reads from `input.layout.quebraQuestao` or equivalent field in `AssessmentLayoutInput`

</code_context>

<specifics>
## Specific Ideas

- The `provaModelo.prova.quebraQuestao` read in `build()` (not in `_mapToEntity()`) will need to come from `AssessmentLayoutInput` after the type change — planner should check `AssessmentLayoutInput` for the `quebraQuestao` field and add it if missing
- The adapter is "Option 1": maps raw → `AssessmentInput` with `visualizaQuestao` as a pass-through JSON string; does NOT do any HTML parsing or sanitization — that stays in `_mapToEntity()`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-adapter-builder*
*Context gathered: 2026-06-01*
