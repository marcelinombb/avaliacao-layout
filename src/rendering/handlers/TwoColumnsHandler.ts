import { Handler } from "pagedjs";

export default class TwoColumnsHandler extends Handler {
  chunker: any;
  polisher: any;
  caller: any;
  config: any;
  originalWidth: number;
  originalHeight: number;

  constructor(chunker: any, polisher: any, caller: any, config: any) {
    super(chunker, polisher, caller);
    this.chunker = chunker;
    this.polisher = polisher;
    this.caller = caller;
    this.config = config;
    this.originalWidth = 0;
    this.originalHeight = 0;
  }

  beforePageLayout(page: any) {

    if (this.isNotTwoColumn(page)) return

    const { width } = page.area.getBoundingClientRect();

    this.originalWidth = width;

    const columnGap = 10;

    page.area.style.width = width / 2 - columnGap + "px";
  }

  hasValidContent(page: any) {
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

  afterRendered(pages: any[]) {
    // Phase 1: Read & Analysis
    // Filter pages and identifying merge pairs without touching the DOM to avoid layout thrashing
    const validTwoColumnPages: any[] = [];
    const pagesToRemove = new Set<any>();

    pages.forEach((page) => {
      if (this.isNotTwoColumn(page)) return;

      // This triggers layout calculation (getBoundingClientRect), 
      // but since we haven't modified the DOM yet, it's efficient/cached.
      if (this.hasValidContent(page)) {
        validTwoColumnPages.push(page);
      } else {
        pagesToRemove.add(page);
      }
    });

    const pagesToMerge: { target: any, source: any }[] = [];

    // Group valid pages into pairs
    for (let i = 0; i < validTwoColumnPages.length - 1; i += 2) {
      const page1 = validTwoColumnPages[i];
      const page2 = validTwoColumnPages[i + 1];

      pagesToMerge.push({ target: page1, source: page2 });
      pagesToRemove.add(page2);
    }

    // Phase 2: Write / Execution
    // Perform all DOM manipulations in a batch
    pagesToMerge.forEach(({ target, source }) => {
      const currentColumns = this.createColumnsElement();

      // Move target children
      currentColumns.append(...target.area.childNodes);

      // Move source children
      const sourceNodes = [...source.area.childNodes];
      currentColumns.append(...sourceNodes);

      // Append wrapper
      target.area.appendChild(currentColumns);

      // Apply classes
      // Note: We apply to all children of the columns wrapper
      currentColumns.childNodes.forEach((child: any) => child.classList.add("column"));

      // Update style
      target.area.style.width = this.originalWidth + "px";
    });

    // Phase 3: Cleanup
    // Remove DOM elements for deleted pages
    pagesToRemove.forEach((page) => {
      page.element.parentNode?.removeChild(page.element);
    });

    // Efficiently remove pages from the array in-place (O(N))
    // replacing the slow splice loop (O(N^2))
    let writeIndex = 0;
    for (let i = 0; i < pages.length; i++) {
      if (!pagesToRemove.has(pages[i])) {
        pages[writeIndex++] = pages[i];
      }
    }
    pages.length = writeIndex;

    this.updatePageNumbers(pages);
  }

  updatePageNumbers(pages: any[]) {
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
        pageNumber.textContent = (index + 1).toString();
      }
    });
  }

  isNotTwoColumn(page: any) {
    return !page.element.classList.contains(`pagedjs_duasColunas_page`)
  }

  createColumnsElement() {
    const el = document.createElement("div");
    el.classList.add("two-column");
    el.classList.add("adaptive-block-avalicao-visualize");
    // Use cssText for faster style setting
    el.style.cssText = "display: flex; flex-direction: row;";
    return el;
  }

}