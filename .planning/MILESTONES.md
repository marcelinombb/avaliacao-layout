# Milestones

## v1.0 Type-Safe API (Shipped: 2026-06-02)

**Phases completed:** 3 phases, 7 plans, 8 tasks

**Key accomplishments:**

- Five clean TypeScript interfaces (AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput, ReferenceInput) added as the library's new public input contract with no `any` fields.
- Five typed sub-interfaces added to Question.ts and all any fields eliminated from AssessmentLayout/Attachment — tsc --noEmit exits 0
- Pure-transform adapter `fromProvaModelo()` extracts typed `AssessmentInput` from raw backend shape; `LayoutAvaliacao` updated to consume `AssessmentInput` with `QuestionInput` field names throughout.
- LayoutAvaliacaoBuilder.build() now accepts typed AssessmentInput; marcaDagua method duplication resolved and pagina dead field removed, completing the builder side of the adapter integration.
- ProvaModelo3Adapter corrected to read listaProvaAnexo and quebraQuestao from their actual fixture locations; dev harness wired through fromProvaModelo adapter end-to-end
- README with AssessmentInput contract (5 interfaces), 16 builder methods, build() return shape, and fromProvaModelo migration guide from raw provaModelo3 backend shape
- JSDoc block comments added to all 16 public LayoutAvaliacaoBuilder methods, enabling IDE hover documentation for every builder call with param types, valid values, and optional/required status.

---
