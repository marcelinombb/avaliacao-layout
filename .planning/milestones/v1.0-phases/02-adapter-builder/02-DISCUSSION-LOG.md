# Phase 2: Adapter & Builder - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 2-adapter-builder
**Areas discussed:** Adapter file location, marcaDagua duplicate resolution, build() input type

---

## Adapter file location

| Option | Description | Selected |
|--------|-------------|----------|
| `src/adapter/ProvaModelo3Adapter.ts` | New `src/adapter/` directory, mirrors the `src/domain/` and `src/types/` pattern | ✓ |
| `src/fromProvaModelo3.ts` | Flat at `src/` root, no new directory | |
| `src/types/AssessmentInput.ts` | Co-located with the type it produces | |

**User's choice:** `src/adapter/ProvaModelo3Adapter.ts`
**Notes:** Function-only export — no `ProvaModelo3` raw-shape type exported; backend shape is an internal detail. `visualizaQuestao` passes through as JSON string; `_mapToEntity()` stays unchanged and continues to `JSON.parse` it internally (Option 1 out of two choices presented).

---

## marcaDagua duplicate resolution

### Method structure question

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both, fix the typo | Two separate methods with correct, distinct names | ✓ |
| Merge into one method | `marcaDaguaRascunho(url)` implicitly enables the boolean flag | |
| Remove boolean flag entirely | Breaking change — only safe if host app doesn't use it | |

**User's choice:** Keep both, fix the typo.

### Boolean-flag method rename

| Option | Description | Selected |
|--------|-------------|----------|
| `habilitarMarcaDaguaRascunho(bool)` | Explicit "enable" verb, Portuguese naming | ✓ |
| `comMarcaDaguaRascunho(bool)` | Mirrors the property name it sets | |

**User's choice:** `habilitarMarcaDaguaRascunho(bool)`

### Backward compatibility

| Option | Description | Selected |
|--------|-------------|----------|
| Hard-remove old names | Clean break — host app (same team) updates call sites | ✓ |
| Keep as deprecated alias | `console.warn` shim — safer for unknown call sites | |

**User's choice:** Hard-remove. No deprecated aliases.
**Notes:** Both the typo variant `marcaDaquaRascunho(url)` and the old boolean-flag `marcaDaguaRascunho(bool)` are hard-removed.

---

## build() input type

### build() signature

| Option | Description | Selected |
|--------|-------------|----------|
| `build(input: AssessmentInput)` | Clean end-state — one typed contract | ✓ |
| Keep `build(provaModelo: any)` | No breaking change; adapter is the migration path | |

**User's choice:** `build(input: AssessmentInput)`

### _mapToEntity() update strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Update `_mapToEntity(input: AssessmentInput)` | Reads from `AssessmentInput` fields directly | ✓ |
| Add a shim in `build()` | Re-shapes `AssessmentInput` back to the old raw shape | |

**User's choice:** Update `_mapToEntity()` to accept `AssessmentInput` directly.
**Notes:** `JSON.parse(visualizaQuestao)` stays inside `_mapToEntity()` — no change to parsing location.

---

## Claude's Discretion

- Internal field mapping implementation inside `_mapToEntity()` (null coalescing style, internal variable names)
- Whether `ProvaModelo3Adapter.ts` needs internal helper functions

## Deferred Ideas

None — discussion stayed within phase scope.
