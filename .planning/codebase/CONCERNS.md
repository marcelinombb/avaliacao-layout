# Codebase Concerns

## Technical Debt

- **Loose TypeScript config** — `strict: false` and `noImplicitAny: false` in `tsconfig.json`; 89+ `any` annotations throughout the codebase. Type safety is effectively opt-in.
- **Duplicated constant** — `TIPO_ORDENACAO` is defined in both `src/LayoutAvaliacaoBuilder.ts` and `src/rendering/handlers/OrderHandler.ts`. They must stay in sync manually.
- **Internal pagedjs import** — `ColumnHandler.ts` imports from `node_modules/pagedjs/src/chunker/layout.js` via `@ts-ignore`, bypassing the public API. Will break on any pagedjs version bump.
- **Dead builder field** — `pagina` property in `LayoutAvaliacaoBuilder` is initialized in the constructor but never used in `build()`.
- **API naming inconsistency** — two overlapping methods: `marcaDaguaRascunho()` and `marcaDaquaRascunho()` (typo variant). Both exist and partially duplicate each other.
- **`build()` always returns `handlers: []`** — despite the property existing in the output, there is no way for consumers to inject custom Paged.js handlers through the public API.

## Code Smells / Anti-patterns

- **`PreventEmptyPageHandler` is dead code** — core logic is commented out; only a `console.log` is active. The file ships in the build with no functional contribution.
- **`util.ts` has no type annotations** — despite being a `.ts` file, it contains plain JavaScript with no TypeScript annotations.
- **Handlebars prototype protection disabled** — `allowProtoPropertiesByDefault: true` and `allowProtoMethodsByDefault: true` used in template calls, bypassing Handlebars' built-in prototype pollution protection.
- **`HeaderFooterHandler.calculateRealHeight()`** — double-counts padding/border (acknowledged in a comment but marked unresolved).

## Security Concerns

- **Unsanitized `innerHTML`** — HTML from server-provided data is assigned directly to `innerHTML` in `HeaderFooterHandler`, `PagedJsRenderer`, and `AssessmentHtmlRenderer` without sanitization. If the input data is user-controlled, this is an XSS vector.
- **Prototype pollution risk** — Handlebars' prototype access protections are explicitly disabled (see above).

## Performance Concerns

- **Stateful regex in `latexParser`** — uses a `/g` flag regex with `.exec()` in a loop without resetting `lastIndex` between calls. Risk of skipping matches on repeated invocations of the same regex instance.
- **DOM node leak in `OrderHandler.getMeasureRoot()`** — creates an offscreen DOM node for measurement; if a render error occurs, the node may not be removed.

## Outdated Dependencies

- **`pagedjs: ^0.4.3`** — should be pinned to an exact version given the direct internal import in `ColumnHandler.ts`. A minor update could silently break column layout.
- **`@types/handlebars`** — deprecated; Handlebars has bundled its own types since v4.1+. Creates a potential type conflict.
- **`typescript: ^5.9.3`** — this version does not exist (TypeScript is at 5.7.x as of mid-2025). The `^` range may resolve to an unexpected version or fail on a clean install.

## TODO / FIXME Items (from code comments)
- `HeaderFooterHandler`: commented note about unresolved double-counting of padding/border in height calculation
- `PreventEmptyPageHandler`: entire implementation is commented out

## Architectural Risks

- **`public/prova-modelo.js` ships in the package** — listed in `package.json` `files` array and has uncommitted modifications on the current branch (`refatoracao`). This is a dev/test fixture being distributed to consumers.
- **No input validation on `provaModelo`** — `LayoutAvaliacao._mapToEntity()` does not validate the shape of the input; malformed JSON silently produces empty or broken output (caught via `try/catch` only for `visualizaQuestao` parsing).
- **Browser-only `PagedJsRenderer`** — depends on `window`/DOM APIs, making it non-testable in Node.js. The library has no SSR/headless path.

## Missing Pieces

- **Zero automated tests** — no test framework, no test files of any kind. All validation is manual via the browser dev harness.
- **No CI pipeline** — no GitHub Actions or equivalent for build verification or test runs.
- **No input schema / validation** — `provaModelo` JSON shape is undocumented and unvalidated at runtime.
- **No changelog or versioning strategy** — version is `1.0.0` with no documented breaking-change policy.
