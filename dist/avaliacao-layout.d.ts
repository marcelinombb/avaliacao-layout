interface ReferenceInput {
    codigo?: number | null;
    descricao?: string | null;
    autor?: string;
    texto?: string | null;
    fonte?: {
        codigo: number;
        descricao: string;
        anoFonte?: number;
    } | null;
}
interface AssessmentLayoutInput {
    codigo?: number;
    nome?: string;
    cabecalho?: string;
    rodape?: string;
    folhaRosto?: string;
    paginacao?: string;
    tipoFolha?: string;
    margem?: number;
    cabecalhoQuestao?: string;
    cabecalhoPrimeiraQuestao?: string;
    orientacaoFolha?: string;
    rodapeRosto?: string | null;
    rascunho?: string;
    colunas?: number;
    marcaDagua?: string;
    fonte?: string;
    fonteTamanho?: number;
    origemQuestao?: boolean;
    ordemQuestaoPersonalizada?: boolean;
    tipoAlternativa?: number;
    quebraQuestao?: boolean;
}
interface AttachmentInput {
    ordem?: number;
    anexo?: {
        texto?: string;
    };
}
interface QuestionInput {
    id?: number | string;
    order: number;
    customOrder?: number | null;
    value: number;
    type: string;
    reference?: ReferenceInput | null;
    visualizaQuestaoRaw?: string | null;
    orderAlternative?: number;
    title?: string | null;
    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: {
        codigo: number;
        nome: string;
    } | null;
    numeroLinhas?: number;
}
interface AssessmentInput {
    id?: number | string;
    title?: string;
    questions?: QuestionInput[];
    attachments?: AttachmentInput[];
    layout?: AssessmentLayoutInput;
}

declare const TIPO_ORDENACAO: {
    readonly NAO_EMBARALHAR: 0;
    readonly ALEATORIO: 1;
    readonly ASCENDENTE: 2;
    readonly DESCENDENTE: 3;
};
declare const TIPO_ALTERNATIVA: {
    readonly NUMERO: 1;
    readonly ROMANO: 2;
    readonly LETRA_MAIUSCULA_PONTO: 3;
    readonly LETRA_MINUSCULA_PONTO: 4;
    readonly LETRA_MAIUSCULA_PARENTESE: 5;
    readonly LETRA_MINUSCULA_PARENTESE: 6;
    readonly LETRA_PARENTESES_DUPLOS: 7;
    readonly LETRA_LACUNA: 8;
    readonly ENEM: 9;
    readonly SEM_ROTULO: 10;
};
type BuildResult = Readonly<{
    layoutHtml: string;
    cssVars: Record<string, string>;
    folhaDeRosto: {
        header: string;
        content: string;
        footer: string;
    };
    header: string;
    footer: string;
    comMarcaDaguaRascunho: boolean;
    ordemAlternativa: number;
    tipoAlternativa: number | null;
    handlers: never[];
}>;
declare class LayoutAvaliacaoBuilder {
    header: string;
    footer: string;
    fontSize: number;
    _folhaDeRosto: any;
    _marcaDaquaRascunho: any;
    _marcaDaguaInstituicao: any;
    quantidadeColunas: number;
    paginacaoAtiva: boolean;
    _identificacao: string;
    _gabarito: boolean;
    tipoOrdenacaoAlternativa: number;
    _tipoAlternativa: number | null;
    _rascunhoHtml: string;
    comMarcaDaguaRascunho: any;
    quantidadeFolhasRascunho: any;
    constructor();
    /**
     * Enables or disables the draft watermark overlay on every page.
     * Optional — if not called, the draft watermark is hidden by default.
     * @param enabled {boolean} — pass `true` to show the watermark, `false` to hide it. Defaults to `false` if not called.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    habilitarMarcaDaguaRascunho(enabled: boolean): this;
    /**
     * Sets the HTML string injected as the page header on every printed page.
     * Optional — if not called, the header defaults to an empty string (no header).
     * @param header {string} — raw HTML string; use empty string to suppress the header.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    pageHeader(header: string): this;
    /**
     * Sets the HTML string injected as the page footer on every printed page.
     * Optional — if not called, the footer defaults to an empty string (no footer).
     * @param footer {string} — raw HTML string; use empty string to suppress the footer.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    pageFooter(footer: string): this;
    /**
     * Sets the institution watermark image URL applied to every page via CSS.
     * Optional — omit to suppress the institution watermark.
     * @param marcaDaguaUrl {string} — absolute URL to the watermark image. Pass null to remove.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    marcaDaguaInstituicao(marcaDaguaUrl: string | null): this;
    /**
     * Sets the draft watermark image URL; use with habilitarMarcaDaguaRascunho(true) to activate.
     * Optional — no effect unless habilitarMarcaDaguaRascunho(true) is also called.
     * @param marcaDaguaUrl {string} — absolute URL to the draft watermark image.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    marcaDaguaRascunho(marcaDaguaUrl: string): this;
    /**
     * Sets the base font size for question text in pixels.
     * Optional — if not called, defaults to 12px.
     * @param tamanho {number} — font size in pixels; must be a numeric value. Throws if NaN.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    fonteTamanho(tamanho: number): this;
    /**
     * Enables answer key (gabarito) rendering mode — answers are shown alongside questions.
     * Optional — omit for student-facing output.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    gabarito(enabled?: boolean): this;
    /**
     * Sets the number of blank draft (rascunho) pages to append at the end of the document.
     * Optional — if not called, defaults to 0 (no draft pages).
     * @param quantidadeFolhasRascunho {number} — integer count of blank pages; must be numeric. Throws if NaN.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    rascunho(quantidadeFolhasRascunho: number): this;
    /**
     * Sets the HTML template used for draft pages; overrides the default blank page template.
     * Optional — if not called, draft pages use the default blank page template.
     * @param rascunhoHtml {string} — HTML string for the draft page body. Null/undefined is coerced to empty string.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    rascunhoHtml(rascunhoHtml: string): this;
    /**
     * Sets the cover sheet (folha de rosto) HTML content shown before the first question page.
     * Optional — omit for assessments without a cover sheet.
     * @param header {string} — HTML string for the cover sheet header; required in the argument object (throws if null).
     * @param content {string} — HTML string for the cover sheet body; required in the argument object (throws if null).
     * @param footer {string} — HTML string for the cover sheet footer; required in the argument object (throws if null).
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    folhaDeRosto({ header, content, footer }: {
        header: string;
        content: string;
        footer: string;
    }): this;
    /**
     * Sets the number of columns for question layout on each page.
     * Optional — if not called, defaults to 1 column.
     * @param quantidade {number} — must be 1 or 2. Throws if not numeric or outside this range.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    colunas(quantidade: number): this;
    /**
     * Sets the assessment identification string shown in the printed header area.
     * Optional — if not called, defaults to empty string.
     * @param identificacao {string} — identification label text.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    identificacao(identificacao?: string): this;
    /**
     * Activates page number rendering in the document footer.
     * Optional — omit to suppress page numbers.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    paginacao(enabled?: boolean): this;
    /**
     * Sets the ordering mode applied to multiple-choice alternatives.
     * Optional — if not called, defaults to 0 (NAO_EMBARALHAR, no shuffle).
     * @param tipoOrdenacao {number} — one of: 0 (NAO_EMBARALHAR, no shuffle), 1 (ALEATORIO, random), 2 (ASCENDENTE, ascending), 3 (DESCENDENTE, descending). Throws for invalid values.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    ordemAlternativa(tipoOrdenacao: number): this;
    /**
     * Sets the alternative label style (e.g., letter case or numbering scheme) used in multiple-choice questions.
     * Optional — if not called, the template configuration default is used.
     * @param tipoAlternativa {any} — value passed through to the renderer; acceptable values depend on the template configuration.
     * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
     */
    tipoAlternativa(tipoAlternativa: number | null): this;
    /**
     * Builds and freezes the final layout output from the given assessment input. Call this last after all configuration methods.
     * REQUIRED — must be called to produce output.
     * @param input {AssessmentInput} — typed assessment data including questions, attachments, and optional layout overrides. Use fromProvaModelo() to convert a raw backend provaModelo3 object to this type.
     * @returns {Readonly<{ layoutHtml: string; cssVars: Record<string, string>; folhaDeRosto: object; header: string; footer: string; comMarcaDaguaRascunho: boolean; ordemAlternativa: number; tipoAlternativa: any; handlers: never[] }>} — frozen result object. layoutHtml is the full HTML to inject into the DOM. cssVars are CSS custom properties to apply to the container. handlers is always an empty array; Paged.js handlers are registered externally by the host application.
     */
    build(input: AssessmentInput): BuildResult;
}

declare class PagedJsRenderer {
    static render(result: any, stylesheets: any, pagesContainer: any): Promise<any>;
}

declare function latexParser(text: any): any;

declare function replacePlaceholders(provaModelo: any): any;

declare function fromProvaModelo(provaModelo3: any): AssessmentInput;

declare const createLayout: () => LayoutAvaliacaoBuilder;

export { LayoutAvaliacaoBuilder, PagedJsRenderer as LayoutRenderer, TIPO_ALTERNATIVA, TIPO_ORDENACAO, createLayout, fromProvaModelo, latexParser, replacePlaceholders };
export type { AssessmentInput, AssessmentLayoutInput, AttachmentInput, BuildResult, QuestionInput, ReferenceInput };
