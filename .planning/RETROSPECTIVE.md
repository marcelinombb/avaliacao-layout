# Retrospective: avaliacao-layout

## Milestone: v1.0 — Type-Safe API

**Shipped:** 2026-06-02
**Phases:** 3 | **Plans:** 7 | **Timeline:** 2 days

### What Was Built

- `AssessmentInput` public type contract with 5 typed sub-interfaces (no `any` on public API surfaces)
- `Question.ts` and domain entities narrowed — all `any` fields on rendering paths eliminated
- `fromProvaModelo()` adapter — pure transform from raw backend shape to `AssessmentInput`
- `LayoutAvaliacaoBuilder` cleaned: typed `build(input: AssessmentInput)`, `marcaDagua` typo resolved, dead `pagina` field removed
- README with full input contract, builder reference, `build()` return shape, and migration guide
- JSDoc on all 16 public builder methods (IDE hover docs)

### What Worked

- **Gap-closure plan pattern** (02-03): When Phase 02 verification found adapter data-path defects, the verifier created a targeted gap-closure plan with exactly the 4 lines that needed changing. This avoided re-running the whole phase.
- **Parallel worktree execution for Phase 03**: Both documentation plans (README + JSDoc) ran simultaneously in isolated worktrees since they touched different files — halved the wall-clock time.
- **Verification-before-archival**: The pre-close artifact audit caught a stale VERIFICATION.md status before milestone close, surfacing that gaps were already fixed by a prior plan. Quick fix rather than reopening work.

### What Was Inefficient

- **Stale VERIFICATION.md**: The verification file reflected the state *before* plan 02-03 ran. The verifier was not re-run after the gap-closure plan, leaving `status: gaps_found` in the artifact. Future: re-run `/gsd-verify-work` after any gap-closure plan completes.
- **Untracked SUMMARY.md on main tree**: When the phase-plan creation workflow wrote a placeholder SUMMARY.md to the main tree, it blocked the worktree merge. A 1-line rm fixed it but required investigation.

### Patterns Established

- **Adapter pattern for backward compat**: `fromProvaModelo()` as a pure named function (not a method) makes it tree-shakeable and easy to test in isolation.
- **Gap-closure plans as first-class artifacts**: Inserting 02-03 as a proper plan (rather than an ad-hoc fix) kept the audit trail clean and STATE.md consistent.
- **README structure**: Installation → Quick Start → Reference (AssessmentInput, Builder Methods, build() Return) → Migration Guide — this ordering works for both new consumers and existing ones.

### Key Lessons

1. **Re-verify after gap-closure plans** — don't rely on the original VERIFICATION.md status after targeted fixes are applied.
2. **Check fixture vs adapter shape early** — the `listaProvaAnexo` root-vs-nested issue was invisible until runtime. Add a data-path spot-check to plan acceptance criteria when a new adapter is created.
3. **Declare SUMMARY.md in .gitignore or plan creation** — the untracked file collision is a structural issue; the planning tools should not write SUMMARY placeholders to the main tree.

### Cost Observations

- Sessions: 3
- Notable: Phase 03 (documentation) ran entirely in parallel worktrees — both plans completed in ~4 minutes wall-clock despite being sequential in prior phases.

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 3 |
| Plans | 7 |
| Timeline (days) | 2 |
| Gap-closure plans | 1 |
| Verification re-runs needed | 1 |
