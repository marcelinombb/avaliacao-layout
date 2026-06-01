# Coding Conventions

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
```
src/
  index.ts                  # Public exports
  LayoutAvaliacao.ts        # Main orchestrator class
  LayoutAvaliacaoBuilder.ts # Fluent builder (public API)
  declarations.d.ts         # Ambient type declarations
  domain/                   # Core data models
    Assessment.ts
    Question.ts
    ReferenceService.ts
  rendering/                # Rendering pipeline
    AssessmentHtmlRenderer.ts
    PagedJsRenderer.ts
    components/             # Reusable render components
    handlers/               # PagedJS hook handlers
    templates/              # Handlebars .hbs templates
    utils/                  # Shared utilities
```

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
