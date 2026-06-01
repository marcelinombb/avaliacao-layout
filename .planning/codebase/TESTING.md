# Testing

## Test Framework(s)
- **None configured.** No test framework is listed in `package.json` devDependencies.
- No test runner (Jest, Vitest, Mocha, etc.) found.

## Test Structure
- No test files (`*.test.ts`, `*.spec.ts`, `*.test.js`, `*.spec.js`) exist in the repository.

## Test Coverage
- **0%** — no automated tests of any kind.

## Testing Patterns
- Manual testing via `public/prova-modelo.js` and `index.html` (browser-based dev harness).
- `rollup -c -w` (watch mode) with `rollup-plugin-serve` + `rollup-plugin-livereload` provides a local dev server for visual/manual verification of PDF layout output.

## How to Run Tests
- No test command available (`npm test` is not defined in `package.json`).
- Manual verification: `npm run dev` starts the dev server; open `index.html` in browser to visually inspect PDF rendering.

## Gaps / Missing Coverage
- No unit tests for domain models (`Assessment`, `Question`, `ReferenceService`)
- No unit tests for rendering pipeline (`AssessmentHtmlRenderer`, handlers, components)
- No integration tests for the builder API (`LayoutAvaliacaoBuilder`)
- No snapshot or visual regression tests for PDF output
- No CI pipeline for automated test runs
- Library is distributed without any test guarantees — all validation is manual
