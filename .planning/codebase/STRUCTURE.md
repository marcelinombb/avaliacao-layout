# Project Structure

## Directory Tree (annotated)

```
avaliacao-layout/
├── src/                          # Source code
│   ├── index.ts                  # Public API re-exports
│   ├── LayoutAvaliacaoBuilder.ts # Fluent builder — primary public API
│   ├── LayoutAvaliacao.ts        # Orchestrator: maps data → HTML
│   ├── declarations.d.ts         # Ambient declarations (e.g. .hbs module types)
│   ├── domain/                   # Core domain models
│   │   ├── Assessment.ts         # Assessment entity
│   │   ├── Question.ts           # Question entity
│   │   └── ReferenceService.ts   # Reference/annexe processing logic
│   └── rendering/                # Rendering pipeline
│       ├── AssessmentHtmlRenderer.ts  # Top-level HTML assembler
│       ├── PagedJsRenderer.ts         # Browser-only: runs Paged.js
│       ├── Hbs.ts                     # Handlebars runtime helper
│       ├── components/
│       │   ├── QuestionRenderer.ts    # Per-question HTML renderer
│       │   └── QuadroRespostaRenderer.ts  # Answer box renderer
│       ├── handlers/                  # Paged.js lifecycle hooks
│       │   ├── index.ts
│       │   ├── ColumnHandler.ts
│       │   ├── HeaderFooterHandler.ts
│       │   ├── OrderHandler.ts
│       │   ├── PreventEmptyPageHandler.ts
│       │   ├── TwoColumnsHandler.ts
│       │   └── WatermarkHandler.ts
│       ├── templates/                 # Handlebars templates
│       │   ├── alternatives.hbs
│       │   ├── assertions.hbs
│       │   ├── associations.hbs
│       │   ├── body.hbs
│       │   ├── header.hbs
│       │   ├── question.hbs
│       │   ├── reference.hbs
│       │   ├── responseBox.hbs
│       │   └── statements.hbs
│       └── utils/
│           ├── latexParser.ts    # LaTeX → KaTeX conversion
│           └── util.ts           # Shared utility functions
├── dist/                         # Build output (generated)
├── types/                        # Supplementary type declarations
├── public/                       # Dev harness assets (ships in package)
│   └── prova-modelo.js           # Example assessment model for testing
├── layout-builder/               # Supplementary tooling directory
├── rollup.config.js              # Build config (ESM + CJS + UMD + .d.ts)
├── tsconfig.json                 # Main TypeScript config
├── tsconfig.types.json           # Separate config for .d.ts generation
├── package.json
├── index.html                    # Dev harness HTML page
├── json_to_sql.py                # Utility script (not part of library)
├── HANDLEBARS.md                 # Handlebars usage documentation
└── layout-output.json            # Sample output artifact
```

## Key Files

| File | Role |
|---|---|
| `src/index.ts` | Package entry point — what consumers import |
| `src/LayoutAvaliacaoBuilder.ts` | Primary public API — start here |
| `src/LayoutAvaliacao.ts` | Core orchestration logic |
| `src/rendering/AssessmentHtmlRenderer.ts` | HTML generation pipeline |
| `src/rendering/PagedJsRenderer.ts` | Browser-side pagination |
| `src/rendering/templates/body.hbs` | Central dispatcher template (question type switch) |
| `rollup.config.js` | Defines all 4 build outputs + custom HBS precompile plugin |

## Module Boundaries

- **`domain/`** — pure data models and business rules, no rendering concerns
- **`rendering/`** — everything related to HTML generation and pagination
- **`rendering/handlers/`** — stateless Paged.js hooks, each focused on one concern
- **`rendering/templates/`** — Handlebars view templates, precompiled at build time

## Configuration Files

| File | Purpose |
|---|---|
| `tsconfig.json` | Compilation config (`strict: false`, target ES2019) |
| `tsconfig.types.json` | Declaration-only build for type exports |
| `rollup.config.js` | Bundling: ESM, CJS, UMD, and `.d.ts` outputs |
| `package.json` | Package metadata, scripts, dependencies |
