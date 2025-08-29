import { CONTENT_HEIGHT } from "./constants.js";

/**
 * Classe responsável por criar páginas dinâmicas com diferentes layouts,
 * incluindo cabeçalho, rodapé, tamanho de fonte e marca d'água de rascunho.
 */
export class PageFactory {
    /**
     * @param {Object} params - Parâmetros de configuração da página.
     * @param {HTMLElement} params.elementContainer - Elemento HTML onde as páginas serão inseridas.
     * @param {string} params.header - Conteúdo do cabeçalho da página.
     * @param {string} params.footer - Conteúdo do rodapé da página.
     * @param {number} params.fontSize - Tamanho da fonte do conteúdo.
     * @param {boolean} params.marcaDaguaRascunho - Indica se a marca d'água de rascunho deve ser exibida.
     */
    constructor({ elementContainer, header, footer, fontSize, marcaDaguaRascunho }) {
        this.elementContainer = elementContainer;
        this.pageHeader = header;
        this.pageFooter = footer;
        this.fontSize = fontSize;
        this.marcaDaguaRascunho = marcaDaguaRascunho;
    }

    /**
     * Cria uma nova página com o layout especificado e opções adicionais.
     * @param {string} layout - Tipo de layout ("one-column" ou "two-column").
     * @param {Object} [pageOptions=null] - Opções específicas para a página.
     * @param {string} [pageOptions.header] - Cabeçalho personalizado.
     * @param {string} [pageOptions.footer] - Rodapé personalizado.
     * @param {boolean} [pageOptions.marcaDaguaRascunho] - Marca d'água de rascunho personalizada.
     * @returns {Object} Elementos da página criados.
     */
    create(layout, pageOptions = null) {
        const newPage = document.createElement("div");
        newPage.className = "page marcadagua";

        if (this.marcaDaguaRascunho || pageOptions?.marcaDaguaRascunho) {
            newPage.classList.add("marcadagua-rascunho");
        }

        newPage.innerHTML = this.getTemplate(layout, pageOptions);
        this.elementContainer.appendChild(newPage);

        const pageObjects = {
            pageHeader: newPage.querySelector(".page-header"),
            pageContent: newPage.querySelector(".content-container"),
            pageFooter: newPage.querySelector(".page-footer"),
        };

        const pageContentHeight = CONTENT_HEIGHT - (pageObjects.pageHeader.scrollHeight + pageObjects.pageFooter.scrollHeight)

        return layout === "two-column"
            ? {
                ...pageObjects,
                pageColumns: newPage.querySelectorAll(".two-column > .content-column"),
                pageContentHeight: pageContentHeight
            }
            : {
                ...pageObjects,
                pageColumn: newPage.querySelector(".one-column > .content-column"),
                pageContentHeight: pageContentHeight
            };
    }

    /**
     * Retorna o template HTML da página conforme o layout e opções fornecidas.
     * @param {string} layoutType - Tipo de layout ("one-column" ou "two-column").
     * @param {Object} [pageOptions=null] - Opções específicas para o template.
     * @returns {string} HTML do template da página.
     */
    getTemplate(layoutType, pageOptions = null) {
        const oneColumn = '<div class="one-column"><div class="content-column"></div></div>';
        const twoColumn = '<div class="two-column"><div class="content-column"></div></div>'.repeat(2);
        return `
            <div class='page-header'>${(pageOptions && pageOptions.header) ? pageOptions.header : this.pageHeader}</div>
            <div class="content-container" style="font-size: ${this.fontSize}px;">
                ${layoutType === "one-column" ? oneColumn : twoColumn}
            </div>
            <div class='page-footer'>${(pageOptions && pageOptions.footer) ? pageOptions.footer : this.pageFooter}</div>
        `;
    }
}
