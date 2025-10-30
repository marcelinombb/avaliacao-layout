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
  
      if(this.isNotTwoColumn(page)) return
  
      const { width } = page.area.getBoundingClientRect();
  
      this.originalWidth = width;
  
      const columnGap = 10;
  
      page.area.style.width = width / 2 - columnGap + "px";
    }
  
    afterRendered(pages) {
      let lastPage = null;
  
      pages.forEach((page) => {
  
        if (this.isNotTwoColumn(page)) return;
  
        if (!lastPage) {
          lastPage = page;
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
        } else {
          
          if (currentColumns.childElementCount >= 2) {
            lastPage = page;
            return
          }
          
          currentColumns.append(...page.area.childNodes);
        }
  
        currentColumns.childNodes.forEach(child => child.classList.add("column"))
  
        Object.assign(lastPage.area.style, {
          width: this.originalWidth + "px",
        });
  
      });
  
      pages.forEach((page) => {
        if (!this.isNotTwoColumn(page) && page.area.childElementCount === 0) {
          page.element.remove();
        }
      });
      
      const totalPages = document.body.querySelector(".pagedjs_pages").childElementCount;
      document.documentElement.style.setProperty("--total-pages", `"${totalPages}"`);
      
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