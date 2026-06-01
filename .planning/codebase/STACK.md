# Technology Stack

**Analysis Date:** 2026-06-01

## Languages

**Primary:**
- TypeScript 5.9.x — all source code under `src/`
- JavaScript — build config `rollup.config.js`, compiled output in `dist/`

**Template Language:**
- Handlebars (.hbs) — HTML templates under `src/rendering/templates/`

## Runtime / Environment

**Environment:**
- Node.js v22.21.0 (confirmed from local runtime)
- Browser (primary target) — library is designed to run inside a browser context; depends on `document`, `window`, and DOM APIs

**Module System:**
- ES Modules (`"type": "module"` in `package.json`)
- Outputs: ESM (`dist/avaliacao-layout.esm.js`), CJS (`dist/avaliacao-layout.cjs`), UMD (`dist/avaliacao-layout.umd.js`)
- Global UMD name: `AvaliacaoLayout`

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present — not tracked but implied by `node_modules/`)

## Frameworks & Libraries

**Core:**
- `pagedjs` ^0.4.3 — paged media rendering engine; drives pagination, page layout, and the Handler extension system used throughout `src/rendering/handlers/`
- `handlebars` ^4.7.8 — logic-less HTML templating for question/assessment layout fragments

**Math Rendering:**
- `katex` ^0.16.22 — client-side LaTeX math rendering; used in `src/rendering/utils/latexParser.ts`

**HTML Utilities:**
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

**TypeScript Config:** `tsconfig.json`
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

```bash
npm run build    # Full production build: ESM + CJS + UMD + .d.ts
npm run dev      # Watch mode: UMD only + dev server on port 10001 + livereload
```

Production builds omit source maps. Watch/dev builds include source maps.

---

*Stack analysis: 2026-06-01*
