import { Handler } from "pagedjs";

const FOLHA_DE_ROSTO = "folhaDeRosto";

export default class HeaderFooterHandler extends Handler {
    constructor(chunker, polisher, caller, config) {
      super(chunker, polisher, caller);
      this.chunker = chunker;
      this.polisher = polisher;
      this.caller = caller;
      this.config = config;
      this.originalWidth = 0;
      this.originalHeight = 0;
    }
  
    beforePageLayout(page) {
      if (page.element.classList.contains(`pagedjs_${FOLHA_DE_ROSTO}_page`)) {
        this.createHeaderArea(page, this.config.cabecalhoFolhaDeRosto);
        this.createFooterArea(page, this.config.footerFolhaDeRosto);
        return;
      }
  
      this.createHeaderArea(page, this.config.cabecalhoPagina);
      this.createFooterArea(page, this.config.footer);
  
      page.area.classList.add("adaptive-block-avalicao-visualize");
    }
  
    createFooterArea(page, content) {
      const pageArea = page.element.querySelector(".pagedjs_area");
  
      if (pageArea && pageArea.querySelector(".pagedjs_footer_area")) return;
  
      const footerArea = document.createElement("footer");
      footerArea.classList.add("pagedjs_footer_area");
      footerArea.innerHTML = content;
      pageArea.appendChild(footerArea);
  
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