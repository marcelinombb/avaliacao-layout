import { LayoutAvaliacao } from "./LayoutAvaliacao";
import { AssessmentInput } from './types/AssessmentInput';

export const TIPO_ORDENACAO = {
  NAO_EMBARALHAR: 0,
  ALEATORIO: 1,
  ASCENDENTE: 2,
  DESCENDENTE: 3,
} as const;

export const TIPO_ALTERNATIVA = {
  NUMERO: 1,
  ROMANO: 2,
  LETRA_MAIUSCULA_PONTO: 3,
  LETRA_MINUSCULA_PONTO: 4,
  LETRA_MAIUSCULA_PARENTESE: 5,
  LETRA_MINUSCULA_PARENTESE: 6,
  LETRA_PARENTESES_DUPLOS: 7,
  LETRA_LACUNA: 8,
  ENEM: 9,
  SEM_ROTULO: 10,
} as const;

export type BuildResult = Readonly<{
  layoutHtml: string;
  cssVars: Record<string, string>;
  folhaDeRosto: { header: string; content: string; footer: string };
  header: string;
  footer: string;
  comMarcaDaguaRascunho: boolean;
  ordemAlternativa: number;
  tipoAlternativa: number | null;
  handlers: never[];
}>;

export class LayoutAvaliacaoBuilder {
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

  constructor() {
    this.header = "";
    this.footer = "";
    this.fontSize = 12;
    this._folhaDeRosto = {
      header: "",
      content: "",
      footer: "",
    };
    this._rascunhoHtml = "";
    this._marcaDaquaRascunho = null;
    this._marcaDaguaInstituicao = null;
    this.quantidadeColunas = 1;
    this.paginacaoAtiva = false;
    this._identificacao = "";
    this._gabarito = false;
    this.tipoOrdenacaoAlternativa = TIPO_ORDENACAO.NAO_EMBARALHAR;
    this._tipoAlternativa = null;
    this.comMarcaDaguaRascunho = false;
    this.quantidadeFolhasRascunho = 0;
  }

  /**
   * Enables or disables the draft watermark overlay on every page.
   * Optional — if not called, the draft watermark is hidden by default.
   * @param enabled {boolean} — pass `true` to show the watermark, `false` to hide it. Defaults to `false` if not called.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  habilitarMarcaDaguaRascunho(enabled: boolean) {
    this.comMarcaDaguaRascunho = enabled;
    return this;
  }

  /**
   * Sets the HTML string injected as the page header on every printed page.
   * Optional — if not called, the header defaults to an empty string (no header).
   * @param header {string} — raw HTML string; use empty string to suppress the header.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  pageHeader(header: string) {
    this.header = header;
    return this;
  }

  /**
   * Sets the HTML string injected as the page footer on every printed page.
   * Optional — if not called, the footer defaults to an empty string (no footer).
   * @param footer {string} — raw HTML string; use empty string to suppress the footer.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  pageFooter(footer: string) {
    this.footer = footer;
    return this;
  }

  /**
   * Sets the institution watermark image URL applied to every page via CSS.
   * Optional — omit to suppress the institution watermark.
   * @param marcaDaguaUrl {string} — absolute URL to the watermark image. Pass null to remove.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  marcaDaguaInstituicao(marcaDaguaUrl: string | null) {
    this._marcaDaguaInstituicao = marcaDaguaUrl;
    return this;
  }

  /**
   * Sets the draft watermark image URL; use with habilitarMarcaDaguaRascunho(true) to activate.
   * Optional — no effect unless habilitarMarcaDaguaRascunho(true) is also called.
   * @param marcaDaguaUrl {string} — absolute URL to the draft watermark image.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  marcaDaguaRascunho(marcaDaguaUrl: string) {
    this._marcaDaquaRascunho = marcaDaguaUrl;
    return this;
  }

  /**
   * Sets the base font size for question text in pixels.
   * Optional — if not called, defaults to 12px.
   * @param tamanho {number} — font size in pixels; must be a numeric value. Throws if NaN.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  fonteTamanho(tamanho: number) {
    if (isNaN(tamanho)) {
      throw new Error("O valor da fonte deve ser um valor numerico.");
    }
    this.fontSize = tamanho;
    return this;
  }

  /**
   * Enables answer key (gabarito) rendering mode — answers are shown alongside questions.
   * Optional — omit for student-facing output.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  gabarito(enabled: boolean = true) {
    this._gabarito = enabled;
    return this;
  }

  /**
   * Sets the number of blank draft (rascunho) pages to append at the end of the document.
   * Optional — if not called, defaults to 0 (no draft pages).
   * @param quantidadeFolhasRascunho {number} — integer count of blank pages; must be numeric. Throws if NaN.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  rascunho(quantidadeFolhasRascunho: number) {
    if (isNaN(quantidadeFolhasRascunho)) {
      throw new Error("O valor da rascunho deve ser um valor numerico.");
    }
    this.quantidadeFolhasRascunho = quantidadeFolhasRascunho;
    return this;
  }

  /**
   * Sets the HTML template used for draft pages; overrides the default blank page template.
   * Optional — if not called, draft pages use the default blank page template.
   * @param rascunhoHtml {string} — HTML string for the draft page body. Null/undefined is coerced to empty string.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  rascunhoHtml(rascunhoHtml: string) {
    this._rascunhoHtml = rascunhoHtml ?? "";
    return this;
  }

  /**
   * Sets the cover sheet (folha de rosto) HTML content shown before the first question page.
   * Optional — omit for assessments without a cover sheet.
   * @param header {string} — HTML string for the cover sheet header; required in the argument object (throws if null).
   * @param content {string} — HTML string for the cover sheet body; required in the argument object (throws if null).
   * @param footer {string} — HTML string for the cover sheet footer; required in the argument object (throws if null).
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  folhaDeRosto({ header, content, footer }: { header: string; content: string; footer: string }) {
    const valid = header != null && content != null && footer != null;

    if (!valid) {
      throw new Error(
        "Todas as propriedades de folha de rosto são obrigatorias. header, content e footer"
      );
    }

    this._folhaDeRosto = { ...this._folhaDeRosto, header, content, footer };

    return this;
  }

  /**
   * Sets the number of columns for question layout on each page.
   * Optional — if not called, defaults to 1 column.
   * @param quantidade {number} — must be 1 or 2. Throws if not numeric or outside this range.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  colunas(quantidade: number) {
    if (isNaN(quantidade)) {
      throw new Error(
        "O valor da quantidade de colunas deve ser um valor numerico."
      );
    }
    if (quantidade > 2 || quantidade < 1) {
      throw new Error("A quantidade de colunas deve ser 1 ou 2.");
    }

    this.quantidadeColunas = quantidade;

    return this;
  }

  /**
   * Sets the assessment identification string shown in the printed header area.
   * Optional — if not called, defaults to empty string.
   * @param identificacao {string} — identification label text.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  identificacao(identificacao = "") {
    this._identificacao = identificacao;
    return this;
  }

  /**
   * Activates page number rendering in the document footer.
   * Optional — omit to suppress page numbers.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  paginacao(enabled: boolean = true) {
    this.paginacaoAtiva = enabled;
    return this;
  }

  /**
   * Sets the ordering mode applied to multiple-choice alternatives.
   * Optional — if not called, defaults to 0 (NAO_EMBARALHAR, no shuffle).
   * @param tipoOrdenacao {number} — one of: 0 (NAO_EMBARALHAR, no shuffle), 1 (ALEATORIO, random), 2 (ASCENDENTE, ascending), 3 (DESCENDENTE, descending). Throws for invalid values.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  ordemAlternativa(tipoOrdenacao: number) {

    if (!(Object.values(TIPO_ORDENACAO) as number[]).includes(tipoOrdenacao)) {
      throw new Error("Tipo de ordenação de alternativas inválido.");
    }

    this.tipoOrdenacaoAlternativa = tipoOrdenacao;

    return this;
  }

  /**
   * Sets the alternative label style (e.g., letter case or numbering scheme) used in multiple-choice questions.
   * Optional — if not called, the template configuration default is used.
   * @param tipoAlternativa {any} — value passed through to the renderer; acceptable values depend on the template configuration.
   * @returns {LayoutAvaliacaoBuilder} Returns the builder instance for chaining.
   */
  tipoAlternativa(tipoAlternativa: number | null) {
    this._tipoAlternativa = tipoAlternativa;
    return this;
  }

  /**
   * Builds and freezes the final layout output from the given assessment input. Call this last after all configuration methods.
   * REQUIRED — must be called to produce output.
   * @param input {AssessmentInput} — typed assessment data including questions, attachments, and optional layout overrides. Use fromProvaModelo() to convert a raw backend provaModelo3 object to this type.
   * @returns {Readonly<{ layoutHtml: string; cssVars: Record<string, string>; folhaDeRosto: object; header: string; footer: string; comMarcaDaguaRascunho: boolean; ordemAlternativa: number; tipoAlternativa: any; handlers: never[] }>} — frozen result object. layoutHtml is the full HTML to inject into the DOM. cssVars are CSS custom properties to apply to the container. handlers is always an empty array; Paged.js handlers are registered externally by the host application.
   */
  build(input: AssessmentInput): BuildResult {
    // Sanitize values used inside CSS url() and string contexts to prevent CSS injection
    const safeCssUrl = (u: string) => u.replace(/[")\\\n\r]/g, encodeURIComponent);
    const safeCssString = (s: string) => s.replace(/["\\]/g, '\\$&');

    const layoutAvaliacao = new LayoutAvaliacao(input, {
      fontSize: this.fontSize,
      folhaDeRosto: this._folhaDeRosto.content,
      rascunho: this._rascunhoHtml,
      quantidadeFolhasRascunho: this.quantidadeFolhasRascunho,
      quantidadeColunas: this.quantidadeColunas,
      quebraQuestao: input.layout?.quebraQuestao,
      gabarito: this._gabarito,
      paginacaoAtiva: this.paginacaoAtiva,
    });

    return Object.freeze({
      layoutHtml: layoutAvaliacao.avalicaoHtml(),
      cssVars: {
        "--layout-font-size": this.fontSize + "px",
        "--layout-watermark-rascunho": this._marcaDaquaRascunho
          ? `url("${safeCssUrl(this._marcaDaquaRascunho)}")`
          : "none",
        "--layout-watermark-instituicao": this._marcaDaguaInstituicao
          ? `url("${safeCssUrl(this._marcaDaguaInstituicao)}")`
          : "none",
        "--layout-identificacao": this._identificacao
          ? `"${safeCssString(this._identificacao)}"`
          : "none",
      },
      folhaDeRosto: this._folhaDeRosto,
      header: this.header,
      footer: this.footer,
      comMarcaDaguaRascunho: this.comMarcaDaguaRascunho,
      ordemAlternativa: this.tipoOrdenacaoAlternativa,
      tipoAlternativa: this._tipoAlternativa,
      handlers: [] as never[],
    });
  }
}
