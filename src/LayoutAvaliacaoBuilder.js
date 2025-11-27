import { LayoutAvaliacao } from "./LayoutAvaliacao.js";
import { Handler } from "pagedjs";



export class LayoutAvaliacaoBuilder {
  constructor() {
    this.header = "";
    this.footer = "";
    this.fontSize = 12;
    this._folhaDeRosto = {
      header: "",
      content: "",
      footer: "",
    };
    this.pagina = {
      header: "",
      footer: "",
    };
    this.numeroFolhasRascunho = null;
    this._marcaDaquaRascunho = null;
    this._marcaDaguaInstituicao = null;
    this.quantidadeColunas = 1;
    this.paginacaoAtiva = false;
    this._identificacao = "";
    this._gabarito = false;
  }

  marcaDaguaRascunho(comMarcaDagua) {
    this.comMarcaDaguaRascunho = comMarcaDagua;
    return this;
  }

  pageHeader(header) {
    this.header = header;
    return this;
  }

  pageFooter(footer) {
    this.footer = footer;
    return this;
  }

  marcaDaguaInstituicao(marcaDaguaUrl) {
    this._marcaDaguaInstituicao = marcaDaguaUrl;
    return this;
  }

  marcaDaquaRascunho(marcaDaguaUrl) {
    this._marcaDaquaRascunho = marcaDaguaUrl;
    return this;
  }

  fonteTamanho(tamanho) {
    if (isNaN(tamanho)) {
      throw new Error("O valor da fonte deve ser um valor numerico.");
    }
    this.fontSize = tamanho;
    return this;
  }

  gabarito() {
    this._gabarito = true;
    return this;
  }

  rascunho(quantidadeFolhasRascunho) {
    if (isNaN(quantidadeFolhasRascunho)) {
      throw new Error("O valor da rascunho deve ser um valor numerico.");
    }
    this.quantidadeFolhasRascunho = quantidadeFolhasRascunho;
    return this;
  }

  folhaDeRosto({ header, content, footer }) {
    const valid = header != null && content != null && footer != null;

    if (!valid) {
      throw new Error(
        "Todas as propriedades de folha de rosto são obrigatorias. header, content e footer"
      );
    }

    this._folhaDeRosto = { ...this._folhaDeRosto, header, content, footer };

    return this;
  }

  colunas(quantidade) {
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

  paginacao() {
    this.paginacaoAtiva = true;
    return this;
  }

  build(provaModelo) {
    const layoutAvaliacao = new LayoutAvaliacao(provaModelo, {
      fontSize: this.fontSize,
      folhaDeRosto: this._folhaDeRosto.content,
      quantidadeFolhasRascunho: this.quantidadeFolhasRascunho,
      quantidadeColunas: this.quantidadeColunas,
      gabarito: this._gabarito,
      paginacaoAtiva: this.paginacaoAtiva,
    });

    return Object.freeze({
      layoutHtml: layoutAvaliacao.avalicaoHtml(),
      cssVars: {
        "--layout-font-size": this.fontSize + "px",
        "--layout-watermark-rascunho": this._marcaDaquaRascunho
          ? `url("${this._marcaDaquaRascunho}")`
          : "none",
        "--layout-watermark-instituicao": this._marcaDaguaInstituicao
          ? `url("${this._marcaDaguaInstituicao}")`
          : "none",
        "--layout-identificacao": this._identificacao
          ? `"${this._identificacao}"`
          : "none",
      },
      folhaDeRosto: this._folhaDeRosto,
      header: this.header,
      footer: this.footer,
      comMarcaDaguaRascunho: this.comMarcaDaguaRascunho,
      handlers: [],
    });
  }
}