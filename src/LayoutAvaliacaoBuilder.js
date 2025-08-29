import { LayoutAvaliacao } from "./LayoutAvaliacao.js";
import { Handler } from "pagedjs";

const FOLHA_DE_ROSTO = "folhaDeRosto"

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
    this._identificacao = '';
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

  identificacao(identificacao = '') {
    this._identificacao = identificacao;
    return this;
  }

  paginacao() {
    this.paginacaoAtiva = true;
    return this;
  }

  build(provaModelo, contentContainer, pagesContainer) {
    const layoutAvaliacao = new LayoutAvaliacao(provaModelo, {
      fontSize: this.fontSize,
      folhaDeRosto: this._folhaDeRosto.content,
      quantidadeFolhasRascunho: this.quantidadeFolhasRascunho,
      quantidadeColunas: this.quantidadeColunas,
      gabarito: this._gabarito,
      paginacaoAtiva: this.paginacaoAtiva,
    });

    const defaultHandlers = [
      {
        MyHandler: WatermarkHandler,
        config: { comMarcaDaguaRascunho: this.comMarcaDaguaRascunho },
      },
      {
        MyHandler: HeaderFooterHandler,
        config: {
          cabecalhoPagina: this.header,
          cabecalhoFolhaDeRosto: this._folhaDeRosto.header,
          footer: this.footer
            ? `<div class="footer-avaliacao">${this.footer}</div>`
            : "",
          footerFolhaDeRosto: this._folhaDeRosto.footer
            ? `<div class="footer-avaliacao">${this._folhaDeRosto.footer}</div>`
            : "",
        },
      },
    ];

    return Object.freeze({
      layoutHtml: layoutAvaliacao.avalicaoHtml(),
      cssVars: {
        "--layout-font-size": this.fontSize + "px",
        "--layout-watermark-rascunho": this._marcaDaquaRascunho ? `url("${this._marcaDaquaRascunho}")` : "none",
        "--layout-watermark-instituicao": this._marcaDaguaInstituicao ? `url("${this._marcaDaguaInstituicao}")` : "none",
        "--layout-identificacao": this._identificacao ? `"${this._identificacao}"` : 'none',
      },
      handlers: defaultHandlers,
    });
  }
}

class WatermarkHandler extends Handler {
  constructor(chunker, polisher, caller, config) {
    super(chunker, polisher, caller);
    this.chunker = chunker;
    this.polisher = polisher;
    this.caller = caller;
    this.config = config;
  }

  afterPageLayout(pageElement, page, breakToken, chunker) {
    const watermark = document.createElement("div");
    watermark.classList.add("watermark");
    pageElement.querySelector(".pagedjs_area").appendChild(watermark);
  }
}

class HeaderFooterHandler extends Handler {
  constructor(chunker, polisher, caller, config) {
    super(chunker, polisher, caller);
    this.chunker = chunker;
    this.polisher = polisher;
    this.caller = caller;
    this.config = config;
  }

  beforePageLayout(page) {
    if (page.element.classList.contains(`pagedjs_${FOLHA_DE_ROSTO}_page`)) {
      this.createHeaderArea(page, this.config.cabecalhoFolhaDeRosto);
      this.createFooterArea(page, this.config.footerFolhaDeRosto);
      return;
    }

    this.createHeaderArea(page, this.config.cabecalhoPagina);
    this.createFooterArea(page, this.config.footer);
  }

  createFooterArea(page, content) {
    const pageArea = page.element.querySelector(".pagedjs_area");

    if (pageArea && pageArea.querySelector(".pagedjs_footer_area")) return;

    const footerArea = document.createElement("footer");
    footerArea.classList.add("pagedjs_footer_area");
    footerArea.innerHTML = content;
    pageArea.appendChild(footerArea);
    // set css variable on this page
    page.element.style.setProperty(
      "--pagedjs-footer-height",
      this.calculateRealHeight(footerArea.firstElementChild) + "px"
    );
  }

  createHeaderArea(page, content) {
    const pageArea = page.element.querySelector(".pagedjs_area");

    if (pageArea && pageArea.querySelector(".pagedjs_headernote_area")) return;

    const headerArea = document.createElement("header");
    headerArea.classList.add("pagedjs_headernote_area");
    headerArea.innerHTML = content;
    pageArea.insertBefore(headerArea, pageArea.firstChild);
    // set css variable on this page
    page.element.style.setProperty(
      "--pagedjs-header-height",
      this.calculateRealHeight(headerArea) + "px"
    );
  }

  calculateRealHeight(element) {
    if (!element) return 0;
    const { height } = element.getBoundingClientRect();
    return (
      height +
      this.marginsHeight(element) +
      this.paddingHeight(element) +
      this.borderHeight(element)
    );
  }

  marginsHeight(element, total = true) {
    let styles = window.getComputedStyle(element);
    let marginTop = parseInt(styles.marginTop);
    let marginBottom = parseInt(styles.marginBottom);
    let margin = 0;
    if (marginTop) {
      margin += marginTop;
    }
    if (marginBottom && total) {
      margin += marginBottom;
    }
    return margin;
  }

  paddingHeight(element, total = true) {
    let styles = window.getComputedStyle(element);
    let paddingTop = parseInt(styles.paddingTop);
    let paddingBottom = parseInt(styles.paddingBottom);
    let padding = 0;
    if (paddingTop) {
      padding += paddingTop;
    }
    if (paddingBottom && total) {
      padding += paddingBottom;
    }
    return padding;
  }

  borderHeight(element, total = true) {
    let styles = window.getComputedStyle(element);
    let borderTop = parseInt(styles.borderTop);
    let borderBottom = parseInt(styles.borderBottom);
    let borders = 0;
    if (borderTop) {
      borders += borderTop;
    }
    if (borderBottom && total) {
      borders += borderBottom;
    }
    return borders;
  }
}




