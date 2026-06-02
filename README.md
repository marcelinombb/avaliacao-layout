# avaliacao-layout

A TypeScript library that converts a typed JSON assessment model into a paginated, PDF-ready HTML document. It renders assessment questions (multiple choice, open-ended, assertions, associations) using Handlebars templates and KaTeX for math, then paginates the result in the browser via Paged.js. The library is consumed by a host application that owns the backend producing the input data.

## Installation

```bash
npm install avaliacao-layout
```

```ts
import { createLayout, AssessmentInput } from 'avaliacao-layout';
```

## Quick Start

The minimal path from input data to rendered HTML:

```ts
import { createLayout } from 'avaliacao-layout';
import type { AssessmentInput } from 'avaliacao-layout';

const input: AssessmentInput = {
  id: 1,
  title: 'Sample Assessment',
  layout: {
    fonteTamanho: 12,
    colunas: 1,
  },
  questions: [
    {
      order: 1,          // required
      value: 10,         // required
      type: 'ME',        // required — e.g. 'ME', 'D', 'A', 'AS'
      visualizaQuestaoRaw: JSON.stringify({
        // serialized question body produced by the backend
        enunciado: 'Which of the following is correct?',
        alternativas: [
          { letra: 'A', texto: 'Option A' },
          { letra: 'B', texto: 'Option B' },
        ],
      }),
    },
  ],
};

const { layoutHtml, cssVars } = createLayout()
  .pageHeader('<div class="header">My Assessment</div>')
  .pageFooter('<div class="footer">Page <span class="pageNumber"></span></div>')
  .build(input);

// Inject the HTML into the DOM
const container = document.getElementById('assessment-container');
container.innerHTML = layoutHtml;

// Apply CSS custom properties for font size, watermarks, and identification
for (const [key, value] of Object.entries(cssVars)) {
  container.style.setProperty(key, value);
}
```

After calling `build()`, initialize Paged.js (via `LayoutRenderer`) to paginate the injected HTML in the browser. See [Paged.js Rendering](#pagedjs-rendering) below.

## AssessmentInput Reference

### `AssessmentInput`

Top-level object passed to `builder.build(input)`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number \| string` | No | Optional identifier for the assessment. |
| `title` | `string` | No | Optional title displayed in the assessment header. |
| `questions` | `QuestionInput[]` | No* | Array of questions to render; practically required for useful output. |
| `attachments` | `AttachmentInput[]` | No | Array of annexe/attachment blocks displayed before the questions. |
| `layout` | `AssessmentLayoutInput` | No | Layout configuration overrides (font size, column count, watermarks, etc.). |

*`questions` is typed as optional but an empty array produces a blank document.

### `QuestionInput`

Each entry in the `questions` array. Fields marked **required** must be present on every question object.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number \| string` | No | Optional question identifier. |
| `order` | `number` | **Yes** | Display position of the question in the assessment (1-based). |
| `value` | `number` | **Yes** | Point value of the question. |
| `type` | `string` | **Yes** | Question type code (e.g. `'ME'` multiple choice, `'D'` open-ended, `'A'` assertions, `'AS'` associations). |
| `visualizaQuestaoRaw` | `string \| null` | No* | Serialized JSON string produced by the backend containing the question body. The library calls `JSON.parse` on this value internally; do not pre-parse it. |
| `customOrder` | `number \| null` | No | Overrides the display number shown next to the question. |
| `reference` | `ReferenceInput \| null` | No | Shared reference or annexe block associated with this question. |
| `orderAlternative` | `number` | No | Ordering mode for answer alternatives (see `ordemAlternativa` builder method). |
| `title` | `string \| null` | No | Optional per-question title or label. |
| `linhasBranco` | `number` | No | Number of blank lines to render for open-ended answer boxes. |
| `quebraPagina` | `boolean` | No | When `true`, inserts a page break before this question. |
| `visualizaResposta` | `string` | No | Serialized JSON string containing the model answer; used when rendering answer keys. |
| `tipoLinha` | `{ codigo: number; nome: string } \| null` | No | Line style descriptor for open-ended answer boxes. |
| `numeroLinhas` | `number` | No | Explicit line count override for open-ended answer boxes. |

*`visualizaQuestaoRaw` is technically optional in the type but most question types will render blank without it.

### `AttachmentInput`

Annexe or reference block shown before the questions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ordem` | `number` | No | Display order of the attachment. |
| `anexo` | `{ texto?: string }` | No | Object whose `texto` field holds the HTML/text content of the attachment. |

### `AssessmentLayoutInput`

Layout configuration object. All fields are optional overrides.

| Field | Type | Description |
|-------|------|-------------|
| `codigo` | `number` | Layout identifier from the backend. |
| `nome` | `string` | Layout name. |
| `cabecalho` | `string` | Default page header HTML. |
| `rodape` | `string` | Default page footer HTML. |
| `folhaRosto` | `string` | Cover page HTML content. |
| `paginacao` | `string` | Pagination mode identifier. |
| `tipoFolha` | `string` | Paper type identifier. |
| `margem` | `number` | Page margin value. |
| `cabecalhoQuestao` | `string` | HTML inserted before each question. |
| `cabecalhoPrimeiraQuestao` | `string` | HTML inserted before the first question only. |
| `orientacaoFolha` | `string` | Page orientation (`'retrato'` / `'paisagem'`). |
| `rodapeRosto` | `string \| null` | Cover page footer HTML. |
| `rascunho` | `string` | Draft/scratch paper mode identifier. |
| `colunas` | `number` | Column count override (1 or 2). |
| `marcaDagua` | `string` | Watermark URL or identifier. |
| `fonte` | `string` | Font family override. |
| `fonteTamanho` | `number` | Font size in pixels. |
| `origemQuestao` | `boolean` | Whether to display question origin metadata. |
| `ordemQuestaoPersonalizada` | `boolean` | Whether custom question ordering is active. |
| `tipoAlternativa` | `number` | Alternative label style (numbers, letters, etc.). |
| `quebraQuestao` | `boolean` | When `true`, each question starts on a new page. |

### `ReferenceInput`

Reference or bibliographic source attached to a question.

| Field | Type | Description |
|-------|------|-------------|
| `codigo` | `number \| null` | Reference identifier. |
| `descricao` | `string \| null` | Reference description or label. |
| `autor` | `string` | Author name. |
| `texto` | `string \| null` | Full reference text or excerpt. |
| `fonte` | `{ codigo: number; descricao: string; anoFonte?: number } \| null` | Source publication details. |

## Builder Methods Reference

All methods return `this` (the builder instance) for chaining, except `build()` which returns the frozen result object.

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `pageHeader(header)` | `header: string` | `this` | Sets the HTML string rendered in the page header on every page. |
| `pageFooter(footer)` | `footer: string` | `this` | Sets the HTML string rendered in the page footer on every page. |
| `fonteTamanho(tamanho)` | `tamanho: number` | `this` | Sets the base font size in pixels (default: 12). Throws if not a number. |
| `colunas(quantidade)` | `quantidade: number` | `this` | Sets the column count to 1 or 2 (default: 1). Throws if out of range. |
| `paginacao()` | — | `this` | Enables active pagination mode. |
| `gabarito()` | — | `this` | Enables answer key rendering mode. |
| `rascunho(quantidadeFolhasRascunho)` | `quantidadeFolhasRascunho: number` | `this` | Sets the number of scratch paper pages appended after the assessment. |
| `rascunhoHtml(rascunhoHtml)` | `rascunhoHtml: string` | `this` | Sets the HTML content used for scratch paper pages. |
| `folhaDeRosto({ header, content, footer })` | `header: any, content: any, footer: any` | `this` | Sets the cover page content. All three properties are required; throws if any is null. |
| `marcaDaguaInstituicao(marcaDaguaUrl)` | `marcaDaguaUrl: string` | `this` | Sets the institution watermark image URL. |
| `marcaDaguaRascunho(marcaDaguaUrl)` | `marcaDaguaUrl: string` | `this` | Sets the scratch paper watermark image URL. |
| `habilitarMarcaDaguaRascunho(enabled)` | `enabled: boolean` | `this` | Toggles whether the scratch paper watermark is applied. |
| `ordemAlternativa(tipoOrdenacao)` | `tipoOrdenacao: number` | `this` | Sets the alternative ordering mode: `0` = no shuffle, `1` = random, `2` = ascending, `3` = descending. |
| `tipoAlternativa(tipoAlternativa)` | `tipoAlternativa: any` | `this` | Sets the alternative label style passed through to the renderer. |
| `identificacao(identificacao)` | `identificacao: string` (default: `""`) | `this` | Sets the identification string rendered via the `--layout-identificacao` CSS variable. |
| `build(input)` | `input: AssessmentInput` | Frozen result object | Builds and freezes the layout. Accepts the full `AssessmentInput` and returns the render artifacts. |

## build() Return Value

`build(input)` returns a frozen object (`Object.freeze`) with the following keys:

| Key | Type | Description |
|-----|------|-------------|
| `layoutHtml` | `string` | The full HTML document string to inject into the DOM before Paged.js pagination. |
| `cssVars` | `object` | CSS custom property map to apply on the container element (see below). |
| `folhaDeRosto` | `{ header: string; content: string; footer: string }` | Cover page parts as set by `.folhaDeRosto()`, or empty strings by default. |
| `header` | `string` | The page header HTML string as set by `.pageHeader()`. |
| `footer` | `string` | The page footer HTML string as set by `.pageFooter()`. |
| `comMarcaDaguaRascunho` | `boolean` | Whether the scratch paper watermark is enabled. |
| `ordemAlternativa` | `number` | The alternative ordering mode value (0–3). |
| `tipoAlternativa` | `any` | The alternative label style value. |
| `handlers` | `[]` | Always an empty array. Custom Paged.js handlers are injected externally by the host application, not through the builder. |

### `cssVars` keys

| CSS Variable | Value | Description |
|-------------|-------|-------------|
| `--layout-font-size` | e.g. `"12px"` | Base font size for the assessment. |
| `--layout-watermark-rascunho` | `url("...")` or `"none"` | Scratch paper watermark image URL, safe for use in CSS `url()`. |
| `--layout-watermark-instituicao` | `url("...")` or `"none"` | Institution watermark image URL, safe for use in CSS `url()`. |
| `--layout-identificacao` | `"..."` or `"none"` | Identification string, safe for use in CSS `content` property. |

Apply these to the container element before Paged.js runs:

```ts
for (const [key, value] of Object.entries(cssVars)) {
  container.style.setProperty(key, value);
}
```

## Migrating from provaModelo3

Before Phase 2, consumers passed the raw backend `provaModelo3` response object directly to `build()`. This shape (with top-level keys `prova` and `listaProvaQuestao`) is the direct database serialization from the Exitus backend.

**Before (legacy):**

```ts
import { createLayout } from 'avaliacao-layout';

// provaModelo3 is the raw API response: { prova: {...}, listaProvaQuestao: [...] }
const result = createLayout().build(provaModelo3);
```

**After (using the adapter):**

```ts
import { createLayout, fromProvaModelo3 } from 'avaliacao-layout';

// Same provaModelo3 raw response — no backend changes required
const input = fromProvaModelo3(provaModelo3);
const result = createLayout().build(input);
```

`fromProvaModelo3` maps the raw backend shape to the `AssessmentInput` contract:

| Source field | Maps to |
|-------------|---------|
| `prova.id` | `AssessmentInput.id` |
| `prova.descricao` | `AssessmentInput.title` |
| `listaProvaQuestao` | `AssessmentInput.questions` (filtered, mapped to `QuestionInput`) |
| `prova.listaProvaAnexo` | `AssessmentInput.attachments` |
| `prova.layout` merged with `prova.quebraQuestao` | `AssessmentInput.layout` |

No backend changes are required. The adapter accepts the current `provaModelo3` shape exactly. The mapping is a one-way transform — the original object is not mutated.

## Paged.js Rendering

After calling `build()`, the resulting `layoutHtml` must be paginated in the browser via Paged.js. The library exports `LayoutRenderer` (alias for `PagedJsRenderer`) for this purpose:

```ts
import { LayoutRenderer } from 'avaliacao-layout';

const { layoutHtml, cssVars, header, footer, handlers } = createLayout()
  .pageHeader(headerHtml)
  .pageFooter(footerHtml)
  .build(input);

const renderer = new LayoutRenderer(layoutHtml, cssVars, header, footer, handlers);
await renderer.render(document.getElementById('assessment-container'));
```

`LayoutRenderer` is browser-only — it depends on `document`, `window`, and the Paged.js `Previewer` API. It cannot be used in Node.js.
