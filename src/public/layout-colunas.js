const MM_TO_INCH = 25.4;
const DEFAULT_DPI = 96;
const DONTSPLIT = "dontsplit";
const DONTEND = "dontend";
const COLUMNBREAK= "columnbreak"

const TEXT_NODE = 3;
const COMMENT_NODE = 8

const mmToPixels = (mm, dpi = DEFAULT_DPI) => (mm / MM_TO_INCH) * dpi;

const paddingsTopBottom = mmToPixels(20);
const containerHeight = mmToPixels(297) - paddingsTopBottom;

const setPagination = (elementContainer) => {
  try {
    const pages = elementContainer.querySelectorAll(".page");

    pages.forEach((page, index) => {
      page.querySelector("span.pageNum").innerHTML = index + 1;
      page.querySelector("span.pages").innerHTML = pages.length;
    });
  } catch (error) {
    console.warn("Erro ao gerar paginação.");
    console.warn(error);
  }
};

function waitForImages(container) {
  return new Promise((resolve) => {
    const images = Array.from(container.querySelectorAll("img"));
    let remaining = images.length;

    if (remaining === 0) {
      resolve();
      return;
    }

    const checkIfFinished = () => {
      remaining--;
      if (remaining === 0) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkIfFinished();
      } else {
        img.onload = checkIfFinished;
        img.onerror = checkIfFinished;
      }
    });
  });
}

function removeClass(node, className) {
  node.classList.remove(className);

  node.querySelectorAll(`.${className}`).forEach(child => {
  child.classList.remove(className);
  });
}

function splitElement(putInHere, pullOutHere, pageColumn, pageContentHeight) {

  const lastContent = putInHere.lastElementChild;

  if (lastContent && (lastContent.classList.contains(COLUMNBREAK) || lastContent.querySelector("."+COLUMNBREAK))) {
    return COLUMNBREAK;
  }

  if (pullOutHere.children.length === 0) return

  let cloneMe = pullOutHere.firstChild;

  if (!cloneMe || cloneMe.nodeType !== 1) return

  let clone = cloneMe.cloneNode(true);

  if(cloneMe.classList.contains(COLUMNBREAK)) {
    putInHere.appendChild(clone);
    cloneMe.remove();
  } else {
    putInHere.appendChild(clone);

    const isImage = clone.tagName === "IMG";
    const fitsInPage = pageColumn.offsetHeight < pageContentHeight + 20;
    const isDontSplit = cloneMe.classList.contains(DONTSPLIT) || cloneMe.querySelector(`.${DONTSPLIT}`) !== null;

    if (isImage && fitsInPage) {
      cloneMe.remove();
    }
    else if(isDontSplit && fitsInPage) {
      cloneMe.remove();
    }
    else if(isDontSplit && !fitsInPage) {
      removeClass(cloneMe, DONTSPLIT)
      clone.remove();
    }
    else if (isImage || isDontSplit) {
      clone.remove();
      return DONTSPLIT
    }
  
    else {

      clone.innerHTML = "";

      if (!fitOverflow(clone, cloneMe, pageColumn, pageContentHeight)) {
        if(cloneMe.children.length) {
          splitElement(clone, cloneMe, pageColumn, pageContentHeight);
        }
      }

      if (clone.childNodes.length === 0) {
        // it was split, but nothing is in it :(
          clone.remove();
        //cloneMe.removeClass(prefixTheClassName("split"));
      } else if (clone.childNodes.length == 1) {
        // was the only child node a text node w/ whitespace?
        let onlyNode = clone.childNodes[0];
        if (onlyNode.nodeType == TEXT_NODE) {
          // text node
          let nonwhitespace = /\S/;
          let str = onlyNode.nodeValue;
          if (!nonwhitespace.test(str)) {
            // yep, only a whitespace textnode
            clone.remove();
            //cloneMe.removeClass(prefixTheClassName("split"));
          }
        } else if(onlyNode.childNodes.length === 0) {
          clone.remove();
        }
      }
    }
  }

}

function fitOverflow(putInHere, pullOutHere, pageColumn, pageContentHeight) {

  if (!pullOutHere) return;

  while (
    pageColumn.scrollHeight < pageContentHeight &&
    pullOutHere.childNodes.length
  ) {
    let node = pullOutHere.childNodes[0];

    if ((node.nodeType !== TEXT_NODE && node.nodeType !== COMMENT_NODE) && (node.querySelectorAll('.' + COLUMNBREAK).length || node.classList.contains(COLUMNBREAK))) {
      return;
    }

    putInHere.appendChild(node);
  }

  if(pageColumn.scrollHeight < pageContentHeight && pullOutHere.childNodes.length === 0) {
      return
  }

  if (putInHere.childNodes.length === 0) return;

  const lastAppendedChild = putInHere.lastChild;

  if(lastAppendedChild.scrollHeight > pageContentHeight) {
    console.log("Elemento maior que a pagina");
    removeClass(lastAppendedChild, DONTSPLIT)
  }

  putInHere.removeChild(lastAppendedChild);


  if (pullOutHere.children.length) {
    pullOutHere.prepend(lastAppendedChild);
  } else {
    pullOutHere.appendChild(lastAppendedChild);
  }

  return lastAppendedChild.nodeType === TEXT_NODE;
}

function handleDontendElements(currentColumn, element) {
  const lastPuInHereElement = currentColumn.lastElementChild;
   
  if (lastPuInHereElement && lastPuInHereElement.querySelector(`.${DONTEND}`) && lastPuInHereElement.children.length == 1) {
    const cloned = lastPuInHereElement.cloneNode(true);
    element.prepend(cloned);
    currentColumn.removeChild(lastPuInHereElement);
  }
}

class LayoutProva {
  constructor(
    elementContainer,
    pageHeader,
    pageFooter,
    fonteTamanho,
    marcaDaqua = false,
    _folhaDeRosto,
    numeroFolhasRascunho = null,
    marcaDaguaRascunho = false
  ) {
    this.elementContainer = elementContainer;
    this.pageHeader = pageHeader;
    this.pageFooter = pageFooter;
    this.fonteTamanho = fonteTamanho;
    this.marcaDaqua = marcaDaqua;
    this._folhaDeRosto = _folhaDeRosto;
    this.numeroFolhasRascunho = numeroFolhasRascunho;
    this.marcaDaguaRascunho = marcaDaguaRascunho;
  }

  resetBodyContent() {
    this.elementContainer.innerHTML = "";
  }

  folhaDeRosto(header, content, footer) {
    const newPage = document.createElement("div");
    newPage.className = "page marcadagua";

    if (this.marcaDaguaRascunho) {
      newPage.classList.add("marcadagua-rascunho");
    }

    newPage.innerHTML = this.getPageTemplate("one-column", header, footer);
    this.elementContainer.appendChild(newPage);

    const pageColumn = newPage.querySelector(".one-column > .content-column");

    const columnContent = document.createElement("div");
    columnContent.innerHTML = content;

    pageColumn.appendChild(columnContent);
  }

  rascunho() {
    for (let i = 0; i < this.numeroFolhasRascunho; i++) {
      this.createNewOneColumnPage();
    }
  }

  oneColumnPage(tempContainer) {
    return waitForImages(tempContainer)
      .then(() => {
        this.resetBodyContent(this.elementContainer);

        if (this._folhaDeRosto !== null) {
          const { header, content, footer } = this._folhaDeRosto;
          this.folhaDeRosto(header, content, footer);
        }

        this.oneColumnLayout(tempContainer);

        if (this.numeroFolhasRascunho) {
          this.rascunho();
        }
      })
      .then(() => {
        setPagination(this.elementContainer);
        tempContainer.remove();
        document.body.classList.add("renderDone");
      });
  }

  twoColumnPage(tempContainer) {
    return waitForImages(tempContainer)
      .then(() => {
        this.resetBodyContent();

        if (this._folhaDeRosto !== null) {
          const { header, content, footer } = this._folhaDeRosto;
          this.folhaDeRosto(header, content, footer);
        }

        this.twoColumnLayout(tempContainer);
      })
      .then(() => {
        setPagination(this.elementContainer);
        tempContainer.remove();
        document.body.classList.add("renderDone");
      });
  }

  oneColumnLayout(tempContainer) {
    let pageObjects = this.createNewOneColumnPage();

    const remainingHeight =
      containerHeight -
      (pageObjects.pageHeader.scrollHeight +
        pageObjects.pageFooter.scrollHeight);

    Array.from(tempContainer.children).forEach((element) => {
      pageObjects = this.columnizeOneColumn(
        element,
        pageObjects,
        remainingHeight
      );
    });
  }

  twoColumnLayout(tempContainer) {
    let pageObjects = this.createNewTwoColumnsPage();

    const remainingHeight =
      containerHeight -
      (pageObjects.pageHeader.scrollHeight +
        pageObjects.pageFooter.scrollHeight);

    let currentColumnIndex = 0; // index = 0 primera coluna, index = 1 segunda coluna.

    Array.from(tempContainer.children).forEach((element) => {
      let newValues = this.columnizeTwoColumn(
        element,
        pageObjects,
        remainingHeight,
        currentColumnIndex
      );
      pageObjects = newValues.pageObjects;
      currentColumnIndex = newValues.currentColumnIndex;
    });
  }

  columnizeOneColumn(element, pageObjects, pageHeight) {
    const pageColumn = pageObjects.pageColumn;

    let remainingHeight = pageHeight;

    while (pageColumn.scrollHeight < remainingHeight && element.children.length) {
      fitOverflow(pageColumn, element, pageColumn, pageHeight);
      const splitResult = splitElement(pageColumn, element, pageColumn, pageHeight);
      
      if((DONTSPLIT, COLUMNBREAK).includes(splitResult)) {
        break;
      }
      
      remainingHeight = pageHeight - pageColumn.scrollHeight;
    }

    if (element.children.length === 0) {
      return pageObjects
    }

    handleDontendElements(pageColumn, element);

    pageObjects = this.columnizeOneColumn(
      element,
      this.createNewOneColumnPage(),
      pageHeight
    );
    
    return pageObjects;
  }

  columnizeTwoColumn(
    element,
    pageObjects,
    pageHeight,
    currentColumnIndex
  ) {
    const currentColumn = pageObjects.pageColumns[currentColumnIndex];

    let remainingHeight = pageHeight;

    while (currentColumn.scrollHeight < remainingHeight && element.children.length) {
      fitOverflow(currentColumn, element, currentColumn, pageHeight);
      const splitResult = splitElement(currentColumn, element, currentColumn, pageHeight);
      
      if((DONTSPLIT, COLUMNBREAK).includes(splitResult)) {
        break;
      }

      remainingHeight = pageHeight - currentColumn.scrollHeight;
    }

    if (element.children.length === 0) {
      return {
        pageObjects,
        currentColumnIndex,
      };
    }

    handleDontendElements(currentColumn, element);
    
    if (currentColumnIndex === 0) {
      const newValues = this.columnizeTwoColumn(
        element,
        pageObjects,
        pageHeight,
        1
      );
      pageObjects = newValues.pageObjects;
      currentColumnIndex = newValues.currentColumnIndex;
    } else {
      const newValues = this.columnizeTwoColumn(
        element,
        this.createNewTwoColumnsPage(),
        pageHeight,
        0
      );
      pageObjects = newValues.pageObjects;
      currentColumnIndex = newValues.currentColumnIndex;
    }

    return {
      pageObjects,
      currentColumnIndex,
    };
  }
  
  createNewPage(layout) {
    const newPage = document.createElement("div");
    newPage.className = "page marcadagua";
  
    if (this.marcaDaguaRascunho) {
      newPage.classList.add("marcadagua-rascunho");
    }
  
    newPage.innerHTML = this.getPageTemplate(layout, this.pageHeader, this.pageFooter);
    this.elementContainer.appendChild(newPage);
  
    const pageHeader = newPage.querySelector(".page-header");
    const pageContent = newPage.querySelector(".content-container");
    const pageFooter = newPage.querySelector(".page-footer");
  
    if (layout === "two-column") {
      return {
        pageHeader,
        pageContent,
        pageColumns: newPage.querySelectorAll(".two-column > .content-column"),
        pageFooter,
      };
    } else {
      return {
        pageHeader,
        pageContent,
        pageColumn: newPage.querySelector(".one-column > .content-column"),
        pageFooter,
      };
    }
  }
  
  createNewTwoColumnsPage() {
    return this.createNewPage("two-column");
  }
  
  createNewOneColumnPage() {
    return this.createNewPage("one-column");
  }

  getPageTemplate(layoutType, header, footer) {
    const oneColumnLayout =
      '<div class="one-column"><div class="content-column"></div></div>';
    const twoColumnLayout =
      '<div class="two-column"><div class="content-column"></div></div>'.repeat(
        2
      );
    return `
      <div class='page-header'>
        ${header}
      </div>
      <div class="content-container" style="font-size: ${this.fonteTamanho}px;">
        ${layoutType === "one-column" ? oneColumnLayout : twoColumnLayout}
      </div>
      <div class='page-footer'>
        ${footer}
      </div>
    `;
  }

  static builder(elementContainer) {
    return new LayoutProvaBuilder(elementContainer);
  }
}
class LayoutProvaBuilder {
  constructor(elementContainer) {
    this.elementContainer = elementContainer;
    this.header = "";
    this.footer = "";
    this.fontSize = 12;
    this._folhaDeRosto = null;
    this.numeroFolhasRascunho = null;
    this.comMarcaDagua = null;
    this.comMarcaDaguaRascunho = false;
  }

  folhaDeRosto({ header, content, footer }) {
    const valid = header != null && content != null && footer != null;

    if (!valid) {
      throw new Error(
        "Todas as propriedades de folha de rosto são obrigatorias. header, content e footer"
      );
    }

    this._folhaDeRosto = { header, content, footer };

    return this;
  }

  marcaDaguaRascunho(comMarcaDagua) {
    this.comMarcaDaguaRascunho = comMarcaDagua    
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

  marcaDaqua(marcaDaguaUrl) {
    this.comMarcaDaqua = marcaDaguaUrl;
    return this;
  }

  fonteTamanho(tamanho) {
    if (isNaN(tamanho)) {
      throw new Error("O valor da fonte deve ser um valor numerico.");
    }
    this.fontSize = tamanho;
    return this;
  }

  rascunho(numeroFolhas) {
    if (isNaN(numeroFolhas)) {
      throw new Error("O valor da rascunho deve ser um valor numerico.");
    }
    this.numeroFolhasRascunho = numeroFolhas;
    return this;
  }

  layoutProva() {
    return new LayoutProva(
      this.elementContainer,
      this.header,
      this.footer,
      this.fontSize,
      this.comMarcaDaqua,
      this._folhaDeRosto,
      this.numeroFolhasRascunho,
      this.comMarcaDaguaRascunho
    );
  }

  oneColumnLayout(tempContainer) {
    this.layoutProva().oneColumnPage(tempContainer);
  }

  twoColumnLayout(tempContainer) {
    this.layoutProva().twoColumnPage(tempContainer);
  }
}

export { LayoutProva };
