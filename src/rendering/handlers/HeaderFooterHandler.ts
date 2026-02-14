import { Handler } from "pagedjs";

const FOLHA_DE_ROSTO = "folhaDeRosto";

export default class HeaderFooterHandler extends Handler {
  chunker: any;
  polisher: any;
  caller: any;
  config: any;
  originalWidth: number;
  originalHeight: number;

  // Cache for element heights to avoid layout thrashing
  private heightCache: Map<string, number> = new Map();

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
    // Only calculate heights once per content type (Main vs Cover)
    // This reduces layout thrashing from O(N) to O(1) where N is pages.
    if (page.element.classList.contains(`pagedjs_${FOLHA_DE_ROSTO}_page`)) {
      this.createHeaderArea(page, this.config.cabecalhoFolhaDeRosto, 'cover-header');
      this.createFooterArea(page, this.config.footerFolhaDeRosto, 'cover-footer');
      return;
    }

    this.createHeaderArea(page, this.config.cabecalhoPagina, 'main-header');
    this.createFooterArea(page, this.config.footer, 'main-footer');

    page.area.classList.add("adaptive-block-avalicao-visualize");
  }

  createFooterArea(page: any, content: string, cacheKey: string) {
    const pageArea = page.element.querySelector(".pagedjs_area");

    if (pageArea && pageArea.querySelector(".pagedjs_footer_area")) return;

    const footerArea = document.createElement("footer");
    footerArea.classList.add("pagedjs_footer_area");
    footerArea.innerHTML = content;
    pageArea.appendChild(footerArea);

    const height = this.getCachedHeight(cacheKey, footerArea.firstElementChild);

    page.element.style.setProperty(
      "--pagedjs-footer-height",
      height + "px"
    );
  }

  createHeaderArea(page: any, content: string, cacheKey: string) {
    const pageArea = page.element.querySelector(".pagedjs_area");

    if (pageArea && pageArea.querySelector(".pagedjs_headernote_area")) return;

    const headerArea = document.createElement("header");
    headerArea.classList.add("pagedjs_headernote_area");
    headerArea.innerHTML = content;
    pageArea.insertBefore(headerArea, pageArea.firstChild);

    const height = this.getCachedHeight(cacheKey, headerArea);

    page.element.style.setProperty(
      "--pagedjs-header-height",
      height + "px"
    );
  }

  getCachedHeight(key: string, element: any) {
    if (this.heightCache.has(key)) {
      return this.heightCache.get(key);
    }
    const h = this.calculateRealHeight(element);
    // Cache the result so subsequent pages don't trigger reflow/restyle
    this.heightCache.set(key, h);
    return h;
  }

  calculateRealHeight(element: any) {
    if (!element) return 0;

    // Optimization: Single DOM Read Phase
    // Get all necessary metrics in one go to minimize browser recalculations
    const { height } = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    // Helper to avoid repetitive parsing
    const getInt = (val: string) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Calculate sum of vertical spacings
    const margins = getInt(styles.marginTop) + getInt(styles.marginBottom);
    const paddings = getInt(styles.paddingTop) + getInt(styles.paddingBottom);
    const borders = getInt(styles.borderTopWidth) + getInt(styles.borderBottomWidth);

    // Note: getBoundingClientRect height already includes padding and border in standard box-model,
    // but we preserve the original logic which added them again (possibly for specific Paged.js requirements or custom box-sizing)
    return height + margins + paddings + borders;
  }
}