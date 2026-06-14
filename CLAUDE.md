<!-- GSD:project-start source:PROJECT.md -->
## Project

**avaliacao-layout**

A TypeScript library that converts a JSON assessment model into a paginated, PDF-ready HTML document. It renders assessment questions (multiple choice, open-ended, assertions, associations) using Handlebars templates and KaTeX for math, paginated in the browser via Paged.js. Currently consumed by a single host application that owns the backend producing the input data.

**Core Value:** Given any well-formed assessment input, produce a pixel-perfect, print-ready HTML document — every question rendered correctly, every page laid out properly.

### Constraints

- **Compatibility**: `fromProvaModelo()` must accept the exact current `provaModelo3` shape without changes — the backend does not need to change
- **No breaking changes to rendering output**: the HTML output for the same logical question must remain pixel-identical after the refactor
- **No test framework**: validation is manual via the browser dev harness (`npm run dev`)
- **Bundle targets**: ESM + CJS + UMD must all continue to be built and exported
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.x — all source code under `src/`
- JavaScript — build config `rollup.config.js`, compiled output in `dist/`
- Handlebars (.hbs) — HTML templates under `src/rendering/templates/`
## Runtime / Environment
- Node.js v22.21.0 (confirmed from local runtime)
- Browser (primary target) — library is designed to run inside a browser context; depends on `document`, `window`, and DOM APIs
- ES Modules (`"type": "module"` in `package.json`)
- Outputs: ESM (`dist/avaliacao-layout.esm.js`), CJS (`dist/avaliacao-layout.cjs`), UMD (`dist/avaliacao-layout.umd.js`)
- Global UMD name: `AvaliacaoLayout`
- npm
- Lockfile: `package-lock.json` (present — not tracked but implied by `node_modules/`)
## Frameworks & Libraries
- `pagedjs` ^0.4.3 — paged media rendering engine; drives pagination, page layout, and the Handler extension system used throughout `src/rendering/handlers/`
- `handlebars` ^4.7.8 — logic-less HTML templating for question/assessment layout fragments
- `katex` ^0.16.22 — client-side LaTeX math rendering; used in `src/rendering/utils/latexParser.ts`
- `entities` ^6.0.1 — HTML entity decoding (`decodeHTML`); used in `src/rendering/utils/latexParser.ts`
## Build Tools
| Tool | Version | Purpose |
|------|---------|---------|
| `rollup` | ^4.49.0 | Module bundler — produces ESM, CJS, UMD, and `.d.ts` outputs |
| `@rollup/plugin-typescript` | ^12.3.0 | TypeScript compilation via Rollup |
| `@rollup/plugin-node-resolve` | ^16.0.1 | Resolves `node_modules` imports in bundle |
| `@rollup/plugin-commonjs` | ^28.0.6 | Converts CJS deps to ESM for bundling |
| `@rollup/plugin-json` | ^6.1.0 | Allows JSON file imports |
| `@rollup/plugin-terser` | ^0.4.4 | Minification for production builds |
| `rollup-plugin-dts` | ^6.2.3 | Generates `dist/avaliacao-layout.d.ts` type declarations |
| `rollup-plugin-serve` | ^3.0.0 | Dev server on port 10001 (watch mode only) |
| `rollup-plugin-livereload` | ^2.0.5 | Live reload in watch/dev mode |
| Custom `hbsPlugin` | — | Inline Rollup plugin in `rollup.config.js`; precompiles `.hbs` templates at build time via `Handlebars.precompile` |
- Target: ES2019
- Module: ESNext
- `moduleResolution: "bundler"`
- `strict: false`, `noImplicitAny: false`
- No declaration output from tsc (handled by `rollup-plugin-dts`)
## Key Dependencies (Runtime)
| Package | Version | Role |
|---------|---------|------|
| `pagedjs` | ^0.4.3 | Core pagination engine; `Previewer`, `Handler`, `registeredHandlers` |
| `handlebars` | ^4.7.8 | Template engine for HTML layout fragments |
| `katex` | ^0.16.22 | Math/LaTeX rendering to HTML string |
| `entities` | ^6.0.1 | HTML entity decode before LaTeX parsing |
## Dev Dependencies
| Package | Version | Role |
|---------|---------|------|
| `rollup` | ^4.49.0 | Bundler |
| `@rollup/plugin-commonjs` | ^28.0.6 | CJS interop |
| `@rollup/plugin-json` | ^6.1.0 | JSON import support |
| `@rollup/plugin-node-resolve` | ^16.0.1 | Node module resolution |
| `@rollup/plugin-terser` | ^0.4.4 | Minification |
| `@rollup/plugin-typescript` | ^12.3.0 | TS→JS compilation |
| `@types/handlebars` | ^4.0.40 | Type definitions for Handlebars |
| `@types/node` | ^25.2.3 | Node.js type definitions |
| `rollup-plugin-dts` | ^6.2.3 | `.d.ts` bundling |
| `rollup-plugin-livereload` | ^2.0.5 | Dev live reload |
| `rollup-plugin-serve` | ^3.0.0 | Dev HTTP server |
| `tslib` | ^2.8.1 | TypeScript runtime helpers |
| `typescript` | ^5.9.3 | TypeScript compiler |
## Build Scripts
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language / Style
- **TypeScript** (strict mode OFF — `"strict": false`, `"noImplicitAny": false`)
- Target: **ES2019**, module system: **ESNext**
- No linter config found (no `.eslintrc`, no `.prettierrc`) — formatting is informal
## Naming Conventions
- **Classes**: PascalCase (`LayoutAvaliacao`, `AssessmentHtmlRenderer`, `QuestionRenderer`)
- **Files**: PascalCase matching the exported class (`QuestionRenderer.ts`, `OrderHandler.ts`)
- **Handlers** suffix for page-manipulation classes (`ColumnHandler`, `OrderHandler`, `WatermarkHandler`)
- **Renderer** suffix for HTML-generation classes (`AssessmentHtmlRenderer`, `QuestionRenderer`)
- **Builder** suffix for fluent builder class (`LayoutAvaliacaoBuilder`)
- Template files: **camelCase** with `.hbs` extension (`responseBox.hbs`, `question.hbs`)
## File Organization
## Linting & Formatting
- No ESLint or Prettier configuration present
- TypeScript compiler is lenient (`noImplicitAny: false`, `strict: false`)
## Comment Style
- Inline comments used sparingly, mostly in Portuguese or English
- No JSDoc documentation style
- Rollup config has one descriptive comment explaining the custom HBS plugin
## Import / Module Patterns
- ES module imports (`import ... from`)
- Handlebars templates imported directly as precompiled functions via custom Rollup HBS plugin
- `index.ts` re-exports the public surface (`LayoutAvaliacaoBuilder`, `LayoutAvaliacao`)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Overview
## Component Map
| Module | Responsibility |
|---|---|
| `LayoutAvaliacaoBuilder` | Fluent builder; public API entry point; produces a frozen config + `layoutHtml` |
| `LayoutAvaliacao` | Orchestrator; maps raw JSON → entities → calls renderer |
| `domain/Assessment` | Domain entity: wraps the full assessment |
| `domain/Question` | Domain entity: wraps a single question with all its fields |
| `domain/ReferenceService` | Processes shared reference/annexe blocks across questions |
| `rendering/AssessmentHtmlRenderer` | Top-level HTML assembler; calls QuestionRenderer per question |
| `rendering/QuestionRenderer` | Renders a single question via Handlebars templates |
| `rendering/QuadroRespostaRenderer` | Renders answer-box component for open-ended questions |
| `rendering/PagedJsRenderer` | Browser-only; injects HTML into DOM and runs Paged.js pagination |
| `rendering/handlers/ColumnHandler` | Paged.js hook: applies 2-column layout via internal pagedjs API |
| `rendering/handlers/HeaderFooterHandler` | Paged.js hook: injects per-page header/footer with height correction |
| `rendering/handlers/OrderHandler` | Paged.js hook: applies alternative ordering to answer options |
| `rendering/handlers/TwoColumnsHandler` | Paged.js hook: handles two-column question layout |
| `rendering/handlers/WatermarkHandler` | Paged.js hook: applies watermark CSS vars per page |
| `rendering/handlers/PreventEmptyPageHandler` | Paged.js hook: intended to remove blank trailing pages (currently inactive) |
| `rendering/utils/latexParser` | Parses LaTeX math expressions and converts via KaTeX |
| `rendering/utils/util` | Shared utility functions |
## Data Flow
```
```
## Design Patterns Used
- **Fluent Builder** (`LayoutAvaliacaoBuilder`) — chainable setters culminating in `.build()`
- **Template Method / Strategy** — Handlebars `.hbs` templates per question type
- **Hook/Handler pattern** — Paged.js lifecycle hooks, each in its own handler class
- **Entity mapping** — raw JSON mapped to domain objects before rendering
- **Frozen return value** — `Object.freeze()` on `build()` output prevents mutation
## Entry Points
- `src/index.ts` — re-exports `LayoutAvaliacaoBuilder` and `LayoutAvaliacao`
- `src/LayoutAvaliacaoBuilder.ts` — primary public API
## Build / Output Artifacts
| File | Format | Purpose |
|---|---|---|
| `dist/avaliacao-layout.esm.js` | ESM | Modern bundlers |
| `dist/avaliacao-layout.cjs` | CJS | Node.js require |
| `dist/avaliacao-layout.umd.js` | UMD | Browser `<script>` tag |
| `dist/avaliacao-layout.d.ts` | TypeScript declarations | Type checking |
| `dist/index.d.ts` | Re-export declarations | Package types entry |
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| refactoring-patterns | 'Apply named refactoring transformations to improve code structure without changing behavior. Use when the user mentions "refactor this", "code smells", "extract method", "replace conditional", or "technical debt". Covers smell-driven refactoring, safe transformation sequences, and testing guards. For code quality foundations, see clean-code. For managing complexity, see software-design-philosophy.' | `.agents/skills/refactoring-patterns/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

# Complexity Rules

## Function Complexity

* Maximum Cyclomatic Complexity: 10
* Maximum Cognitive Complexity: 15
* Maximum Nesting Depth: 3
* Maximum Function Length: 80 lines

## Refactoring Requirements

When a function exceeds any complexity limit:

1. Extract responsibilities into private functions.
2. Replace conditional chains with Strategy Pattern when applicable.
3. Prefer polymorphism over large switch/if-else chains.
4. Use guard clauses to reduce nesting.
5. Split orchestration from business logic.

## Anti-Patterns

Avoid:

* Nested if statements deeper than 3 levels.
* Switch statements with more than 5 cases.
* Methods containing multiple business responsibilities.
* God Services.
* Large orchestrator methods.

## Preferred Patterns

* Strategy
* Factory
* Specification
* Command
* Domain Services
* Pure Functions

All generated code must respect these limits.
