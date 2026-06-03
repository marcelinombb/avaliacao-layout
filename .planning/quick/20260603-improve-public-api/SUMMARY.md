---
id: 260603-g1j
slug: improve-public-api
status: complete
date: 2026-06-03
---

# Summary: Improve Public API

## What was done

- **T1**: `TIPO_ORDENACAO` exported from builder and re-exported from `index.ts`
- **T2**: All untyped builder method parameters annotated: `pageHeader(header: string)`, `pageFooter(footer: string)`, `marcaDaguaInstituicao(marcaDaguaUrl: string | null)`, `fonteTamanho(tamanho: number)`, `rascunho(quantidadeFolhasRascunho: number)`, `rascunhoHtml(rascunhoHtml: string)`, `colunas(quantidade: number)`, `ordemAlternativa(tipoOrdenacao: number)`, `tipoAlternativa(tipoAlternativa: number | null)`, `folhaDeRosto({ header, content, footer }: { header: string; content: string; footer: string })`
- **T3**: `BuildResult` exported as a named type from builder and `index.ts`; `build()` return type annotation added
- **T4**: `TIPO_ALTERNATIVA` discovered (10 values in `conversorDeIndicesParaAlternativas`) and exported as named constant with descriptive keys
- **T5**: `paginacao(enabled: boolean = true)` and `gabarito(enabled: boolean = true)` — optional boolean param, backward compatible

## Result
Build is clean, no warnings. All changes are non-breaking. Commit: `d93eeb5`.
