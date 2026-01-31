import { Handler } from "pagedjs";

export default class TwoColumnsHandler extends Handler {
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

    if (this.isNotTwoColumn(page)) return

    const { width } = page.area.getBoundingClientRect();

    this.originalWidth = width;

    const columnGap = 10;

    page.area.style.width = width / 2 - columnGap + "px";
  }

  hasValidContent(page) {
    if (!page || !page.area) return false;

    const children = page.area.children[0].children;
    
    // Verifica se algum filho tem altura maior que 0
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();

      // Considera válido se tem altura ou se é um elemento de quebra/estrutural
      if (childRect.height > 0) {
        return true;
      }
    }

    return false
  }

  afterRendered(pages) {
    let lastPage = null;
    const pagesToRemove = [];

    pages.forEach((page) => {

      if (this.isNotTwoColumn(page)) return;

      if (!lastPage) {
        lastPage = page;
        return;
      }

      if (!this.hasValidContent(page)) {
        pagesToRemove.push(page);
        return;
      }

      let currentColumns = lastPage.area.querySelector(".two-column");

      if (!currentColumns) {
        currentColumns = this.createColumnsElement();

        currentColumns.append(
          ...lastPage.area.childNodes,
          ...page.area.childNodes
        );
        lastPage.area.appendChild(currentColumns);
        pagesToRemove.push(page);
      } else {

        if (currentColumns.childElementCount >= 2) {
          lastPage = page;
          return
        }

        currentColumns.append(...page.area.childNodes);
        pagesToRemove.push(page);
      }

      currentColumns.childNodes.forEach(child => child.classList.add("column"))

      Object.assign(lastPage.area.style, {
        width: this.originalWidth + "px",
      });

    });

    pagesToRemove.forEach(page => {
        const index = pages.indexOf(page);
        if (index > -1) {
          pages.splice(index, 1);
        }

        page.element.parentNode?.removeChild(page.element);
    });

    this.updatePageNumbers(pages);

  }

  updatePageNumbers(pages) {
    // Atualiza numeração de páginas do Paged.js
    const pagesContainer = document.querySelector(".pagedjs_pages");
    if (!pagesContainer) return;

    const totalPages = pagesContainer.children.length;
    
    // Usa CSS custom property (mais performático)
    document.documentElement.style.setProperty(
      "--total-pages", 
      `"${totalPages}"`
    );

    // Atualiza contadores do Paged.js se necessário
    pages.forEach((page, index) => {
      const pageNumber = page.element.querySelector(".pagedjs_page_number");
      if (pageNumber) {
        pageNumber.textContent = index + 1;
      }
    });
  }

  isNotTwoColumn(page) {
    return !page.element.classList.contains(`pagedjs_duasColunas_page`)
  }

  createColumnsElement() {
    const el = document.createElement("div");
    el.classList.add("two-column");
    el.classList.add("adaptive-block-avalicao-visualize");
    el.setAttribute("style", `display: flex; flex-direction: row;`)
    return el;
  }

}