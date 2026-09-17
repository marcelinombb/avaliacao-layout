import { LayoutAvaliacao } from "./LayoutAvaliacao";
import { AssessmentInput } from './types/AssessmentInput';
import { AssessmentMapper } from "./adapter/AssessmentMapper";
import { FolhaDeRosto, LayoutOptions } from "./types/LayoutOptions";
import latexParser from './rendering/utils/latexParser';

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
  folhaDeRosto: FolhaDeRosto;
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
  _folhaDeRosto: FolhaDeRosto;
  _marcaDaquaRascunho: string | null;
  _marcaDaguaInstituicao: string | null;
  quantidadeColunas: number;
  paginacaoAtiva: boolean;
  _identificacao: string;
  _gabarito: boolean;
  _latex: boolean;
  tipoOrdenacaoAlternativa: number;
  _tipoAlternativa: number | null;
  _rascunhoHtml: string;
  comMarcaDaguaRascunho: boolean;
  quantidadeFolhasRascunho: number;

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
    this._latex = false;
  }

  habilitarMarcaDaguaRascunho(enabled: boolean) {
    this.comMarcaDaguaRascunho = enabled;
    return this;
  }

  pageHeader(header: string) {
    this.header = header;
    return this;
  }

  pageFooter(footer: string) {
    this.footer = footer;
    return this;
  }

  marcaDaguaInstituicao(marcaDaguaUrl: string | null) {
    this._marcaDaguaInstituicao = marcaDaguaUrl;
    return this;
  }

  marcaDaguaRascunho(marcaDaguaUrl: string) {
    this._marcaDaquaRascunho = marcaDaguaUrl;
    return this;
  }

  fonteTamanho(tamanho: number) {
    if (isNaN(tamanho)) {
      throw new Error("O valor da fonte deve ser um valor numerico.");
    }
    this.fontSize = tamanho;
    return this;
  }

  gabarito(enabled: boolean = true) {
    this._gabarito = enabled;
    return this;
  }

  rascunho(quantidadeFolhasRascunho: number) {
    if (isNaN(quantidadeFolhasRascunho)) {
      throw new Error("O valor da rascunho deve ser um valor numerico.");
    }
    this.quantidadeFolhasRascunho = quantidadeFolhasRascunho;
    return this;
  }

  rascunhoHtml(rascunhoHtml: string) {
    this._rascunhoHtml = rascunhoHtml ?? "";
    return this;
  }

  folhaDeRosto({ header, content, footer }: FolhaDeRosto) {
    const valid = header != null && content != null && footer != null;

    if (!valid) {
      throw new Error(
        "Todas as propriedades de folha de rosto são obrigatorias. header, content e footer"
      );
    }

    this._folhaDeRosto = { ...this._folhaDeRosto, header, content, footer };

    return this;
  }

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

  identificacao(identificacao = "") {
    this._identificacao = identificacao;
    return this;
  }

  paginacao(enabled: boolean = true) {
    this.paginacaoAtiva = enabled;
    return this;
  }

  ordemAlternativa(tipoOrdenacao: number) {
    if (!(Object.values(TIPO_ORDENACAO) as number[]).includes(tipoOrdenacao)) {
      throw new Error("Tipo de ordenação de alternativas inválido.");
    }

    this.tipoOrdenacaoAlternativa = tipoOrdenacao;

    return this;
  }

  tipoAlternativa(tipoAlternativa: number | null) {
    this._tipoAlternativa = tipoAlternativa;
    return this;
  }

  latex() {
    this._latex = true;
    return this;
  }

  private safeCssUrl(u: string): string {
    return u.replace(/[")\\\n\r]/g, encodeURIComponent);
  }

  private safeCssString(s: string): string {
    return s.replace(/["\\]/g, '\\$&');
  }

  private generateCssVars(): Record<string, string> {
    return {
      "--layout-font-size": `${this.fontSize}px`,
      "--layout-watermark-rascunho": this._marcaDaquaRascunho
        ? `url("${this.safeCssUrl(this._marcaDaquaRascunho)}")`
        : "none",
      "--layout-watermark-instituicao": this._marcaDaguaInstituicao
        ? `url("${this.safeCssUrl(this._marcaDaguaInstituicao)}")`
        : "none",
      "--layout-identificacao": this._identificacao
        ? `"${this.safeCssString(this._identificacao)}"`
        : "none",
    };
  }

  buildConfig(quebraQuestao?: boolean): LayoutOptions {
    return {
      fontSize: this.fontSize,
      folhaDeRosto: this._folhaDeRosto.content,
      rascunho: this._rascunhoHtml,
      quantidadeFolhasRascunho: this.quantidadeFolhasRascunho,
      quantidadeColunas: this.quantidadeColunas,
      quebraQuestao: quebraQuestao,
      gabarito: this._gabarito,
      paginacaoAtiva: this.paginacaoAtiva,
      tipoOrdenacaoAlternativa: this.tipoOrdenacaoAlternativa,
      tipoAlternativa: this._tipoAlternativa,
      header: this.header,
      footer: this.footer,
      comMarcaDaguaRascunho: this.comMarcaDaguaRascunho,
      marcaDaquaRascunho: this._marcaDaquaRascunho,
      marcaDaguaInstituicao: this._marcaDaguaInstituicao,
      identificacao: this._identificacao,
      latex: this._latex,
    };
  }

  build(input: AssessmentInput): BuildResult {
    const assessment = AssessmentMapper.toDomain(input);
    const layoutConfig = this.buildConfig(input.layout?.quebraQuestao);
    
    const layoutAvaliacao = new LayoutAvaliacao(assessment, layoutConfig);

    let layoutHtml = layoutAvaliacao.avalicaoHtml();

    if (this._latex) {
      layoutHtml = latexParser(layoutHtml);
    }

    return Object.freeze({
      layoutHtml: layoutHtml,
      cssVars: this.generateCssVars(),
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
