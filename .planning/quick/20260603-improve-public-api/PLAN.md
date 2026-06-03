---
id: 260603-g1j
slug: improve-public-api
date: 2026-06-03
title: Improve Public API
---

# Improve Public API

## Goal
Make the public API more ergonomic and type-safe without breaking existing consumers.

## Tasks

### T1 — Export TIPO_ORDENACAO constants
- In `src/LayoutAvaliacaoBuilder.ts`: change `const TIPO_ORDENACAO` to `export const TIPO_ORDENACAO`
- In `src/index.ts`: add `export { TIPO_ORDENACAO } from './LayoutAvaliacaoBuilder'`

### T2 — Add TypeScript types to untyped builder method parameters
In `src/LayoutAvaliacaoBuilder.ts`, add parameter types to:
- `pageHeader(header)` → `pageHeader(header: string)`
- `pageFooter(footer)` → `pageFooter(footer: string)`
- `marcaDaguaInstituicao(marcaDaguaUrl)` → `marcaDaguaInstituicao(marcaDaguaUrl: string | null)`
- `fonteTamanho(tamanho)` → `fonteTamanho(tamanho: number)`
- `rascunho(quantidadeFolhasRascunho)` → `rascunho(quantidadeFolhasRascunho: number)`
- `rascunhoHtml(rascunhoHtml)` → `rascunhoHtml(rascunhoHtml: string)`
- `colunas(quantidade)` → `colunas(quantidade: number)`
- `ordemAlternativa(tipoOrdenacao)` → `ordemAlternativa(tipoOrdenacao: number)`
- `tipoAlternativa(tipoAlternativa)` → `tipoAlternativa(tipoAlternativa: number | null)`
- `folhaDeRosto({ header, content, footer })` → destructured params typed as `string`

### T3 — Export a named BuildResult type
- In `src/LayoutAvaliacaoBuilder.ts`: define and export `BuildResult` interface
- In `src/index.ts`: re-export `BuildResult` as a type

### T4 — Discover and export TIPO_ALTERNATIVA constant
- Search `src/` for any `tipoAlternativa` values used in templates/renderers to determine valid values
- If a finite set is found, define and export `TIPO_ALTERNATIVA` constant from builder and index

### T5 — Make paginacao() and gabarito() accept optional boolean
- `paginacao(enabled: boolean = true)` — sets `this.paginacaoAtiva = enabled`
- `gabarito(enabled: boolean = true)` — sets `this._gabarito = enabled`
- Both remain backward compatible: zero-arg calls still enable the feature

## Verification
- `npm run build` must succeed with no TypeScript errors
- Spot-check `dist/avaliacao-layout.d.ts` to confirm new types appear
