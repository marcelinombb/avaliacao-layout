# Integrations

**Analysis Date:** 2026-06-01

## External Services

**None detected.** This is a self-contained browser library. It makes no HTTP requests and integrates with no remote APIs, authentication providers, analytics services, or cloud platforms.

## Third-party Libraries (non-framework)

### pagedjs ^0.4.3

- **What it does:** Implements the W3C Paged Media and CSS Generated Content specs in the browser; takes HTML content and lays it out into discrete pages for print/PDF.
- **How it is used:**
  - `Previewer` class from `pagedjs` is instantiated in `src/rendering/PagedJsRenderer.ts` to render paginated content into a DOM container.
  - `Handler` base class from `pagedjs` is extended by all custom handlers in `src/rendering/handlers/`:
    - `src/rendering/handlers/HeaderFooterHandler.ts` — injects per-page headers/footers
    - `src/rendering/handlers/WatermarkHandler.ts` — injects watermark markup
    - `src/rendering/handlers/PreventEmptyPageHandler.ts` — removes trailing empty pages
    - `src/rendering/handlers/OrderHandler.ts` — reorders/shuffles alternatives
    - `src/rendering/handlers/ColumnHandler.ts` — handles 2-column layout logic
    - `src/rendering/handlers/TwoColumnsHandler.ts` — additional 2-column support
  - `registeredHandlers` array from `pagedjs` is inspected/mutated to prevent duplicate handler registration across renders.
- **Entry point:** `src/rendering/PagedJsRenderer.ts`

### handlebars ^4.7.8

- **What it does:** Logic-less templating engine; compiles `.hbs` files to template functions.
- **How it is used:**
  - Templates are precompiled at build time by the custom `hbsPlugin` in `rollup.config.js` using `Handlebars.precompile`.
  - At runtime, only `handlebars/runtime` is loaded (not the full compiler), keeping bundle size smaller.
  - Templates are registered as Handlebars partials and rendered in `src/rendering/Hbs.ts`.
  - Custom helpers registered: `repeat`, `formatHeader`, `renderResponseBox`, `formatAlternativeIndex`, `switch`/`case`/`default` (switch-case pattern).
- **Templates location:** `src/rendering/templates/` — `question.hbs`, `header.hbs`, `body.hbs`, `alternatives.hbs`, `statements.hbs`, `associations.hbs`, `assertions.hbs`, `responseBox.hbs`, `reference.hbs`
- **Entry point:** `src/rendering/Hbs.ts`

### katex ^0.16.22

- **What it does:** Renders LaTeX math expressions to HTML strings, client-side, with no server dependency.
- **How it is used:**
  - `katex.renderToString(latex, { throwOnError: false, displayMode, output: "html" })` called inside `src/rendering/utils/latexParser.ts`.
  - Supports multiple delimiters: `$$...$$`, `$...$`, `\(...\)`, `\[...\]`.
  - Scans input HTML for `<span class="math-tex">` elements and replaces content with rendered KaTeX HTML.
- **Entry point:** `src/rendering/utils/latexParser.ts`

### entities ^6.0.1

- **What it does:** Encodes/decodes HTML entities.
- **How it is used:**
  - `decodeHTML(match[1])` called in `src/rendering/utils/latexParser.ts` to normalize HTML-encoded LaTeX strings before passing to KaTeX.
- **Entry point:** `src/rendering/utils/latexParser.ts`

## Browser / Platform APIs Used

This library targets browser environments exclusively. The following browser APIs are used directly:

| API | Where Used | Purpose |
|-----|-----------|---------|
| `document.createElement` | `src/rendering/PagedJsRenderer.ts`, `src/rendering/handlers/HeaderFooterHandler.ts` | Creates DOM elements for layout injection |
| `document.documentElement.style.setProperty` | `src/rendering/PagedJsRenderer.ts` | Sets CSS custom properties (vars) on `:root` |
| `element.innerHTML` | `src/rendering/PagedJsRenderer.ts`, `src/rendering/handlers/HeaderFooterHandler.ts` | Injects HTML content into page areas |
| `element.classList` | `src/rendering/handlers/HeaderFooterHandler.ts` | Detects page type (cover vs main), adds classes |
| `element.getBoundingClientRect()` | `src/rendering/handlers/HeaderFooterHandler.ts` | Measures rendered element height for layout calculations |
| `window.getComputedStyle` | `src/rendering/handlers/HeaderFooterHandler.ts` | Reads computed margins/padding/borders for header/footer height |
| `element.style.setProperty` | `src/rendering/handlers/HeaderFooterHandler.ts` | Sets `--pagedjs-header-height` / `--pagedjs-footer-height` CSS vars per page |
| `element.querySelector` | `src/rendering/handlers/HeaderFooterHandler.ts` | Navigates Paged.js page DOM structure |
| `element.appendChild` / `insertBefore` / `remove` | `src/rendering/PagedJsRenderer.ts`, `src/rendering/handlers/HeaderFooterHandler.ts` | DOM manipulation for content injection and cleanup |

**Note:** There is no usage of `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `IndexedDB`, `WebWorkers`, `WebSockets`, or any other async browser APIs beyond Promises (used for Paged.js's `Previewer.preview()` which returns a Promise).

## Notable Patterns

### Library Distribution Pattern
The project builds three output formats from a single TypeScript source:
- ESM (`dist/avaliacao-layout.esm.js`) — for bundlers (webpack, Vite, Rollup)
- CJS (`dist/avaliacao-layout.cjs`) — for Node.js / CommonJS consumers
- UMD (`dist/avaliacao-layout.umd.js`) — for direct `<script>` tag usage; global name `AvaliacaoLayout`
- Type declarations (`dist/avaliacao-layout.d.ts`, `dist/index.d.ts`, `dist/LayoutAvaliacaoBuilder.d.ts`)

### Build-time Template Precompilation
Handlebars `.hbs` files are compiled to JavaScript template functions at build time (not runtime) via the custom `hbsPlugin` in `rollup.config.js`. This means only `handlebars/runtime` (not the full compiler) is bundled in the output, reducing final bundle size.

### Paged.js Handler Extension Model
All layout customizations (headers, footers, watermarks, column layout, ordering, empty-page prevention) are implemented as subclasses of Paged.js's `Handler` class. Handlers receive configuration through a constructor-injection pattern using anonymous subclass wrappers created in `prepareHandlers()` inside `src/rendering/PagedJsRenderer.ts`.

### CSS Custom Properties for Configuration
Layout configuration (font size, watermark URLs, identification string) is passed to the browser renderer as CSS custom properties set on `document.documentElement` rather than as inline styles, enabling CSS-level overrides downstream.

### No External Network Calls
The library is fully self-contained for runtime operation. All rendering (math, templates, pagination) is performed locally in the browser with no remote dependencies at runtime.

---

*Integration audit: 2026-06-01*
