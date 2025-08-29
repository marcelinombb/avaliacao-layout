import { DONTSPLIT, COLUMNBREAK, DONTEND, TEXT_NODE, COMMENT_NODE  } from "./constants.js"

/**
 * Remove uma classe de um nó e de todos os seus descendentes.
 * @param {HTMLElement} node - Nó do DOM alvo.
 * @param {string} className - Nome da classe a ser removida.
 */
function removeClass(node, className) {
    node.classList.remove(className);

    node.querySelectorAll(`.${className}`).forEach(child => {
        //if (child.classList.contains("tablelike")) return;
        child.classList.remove(className);
    });
}

function hasClass(node, className) {
    return node.classList.contains(className) || node.querySelector(`.${COLUMNBREAK}`);
}

/**
 * Realiza a divisão de elementos entre colunas, respeitando regras de quebra e não divisão.
 * @param {HTMLElement} putInHere - Elemento destino para inserir conteúdo.
 * @param {HTMLElement} pullOutHere - Elemento fonte de onde retirar conteúdo.
 * @param {HTMLElement} pageColumn - Coluna da página.
 * @param {number} pageContentHeight - Altura máxima permitida para o conteúdo.
 * @returns {string|undefined} Tipo de split realizado ou undefined.
 */
function splitElement(putInHere, pullOutHere, pageColumn, pageContentHeight) {
    const lastContent = putInHere.lastElementChild;

    // Se o último conteúdo já tem COLUMNBREAK, não precisa continuar
    if (lastContent && hasClass(lastContent, COLUMNBREAK)) {
        return COLUMNBREAK;
    }

    if (pullOutHere.children.length === 0) return;

    const cloneMe = pullOutHere.firstElementChild; // firstElementChild garante ser um Element

    if (!cloneMe) return;

    // Clonar o elemento para inserir no putInHere
    const clone = cloneMe.cloneNode(true);

    // Se o elemento for COLUMNBREAK, só move ele
    if (cloneMe.classList.contains(COLUMNBREAK)) {
        putInHere.appendChild(clone);
        cloneMe.remove();
        return COLUMNBREAK;
    }

    putInHere.appendChild(clone);

    const isImage = clone.tagName === "IMG";
    const fitsInPage = pageColumn.offsetHeight < pageContentHeight;
    const isDontSplit = hasClass(cloneMe, DONTSPLIT);

    // Regras para remoção e split
    if ((isImage || isDontSplit) && fitsInPage) {
        // Se cabe na página, remove o original do pullOutHere
        cloneMe.remove();
        return;
    }

    if (isImage && !fitsInPage) {
        // Se é imagem ou não pode dividir e não cabe
        clone.remove();
        return DONTSPLIT;
    } 

    if (isDontSplit && !fitsInPage) {
        // Não pode dividir, mas não cabe
        removeClass(cloneMe, DONTSPLIT);
    }

    clone.innerHTML = "";

    const didFit = fitOverflow(clone, cloneMe, pageColumn, pageContentHeight);
    if (!didFit && cloneMe.children.length) {
        splitElement(clone, cloneMe, pageColumn, pageContentHeight);
    }

    if (isEmptyClone(clone)) {
        clone.remove();
    }
}
 
/**
 * Verifica se o clone está vazio ou só tem texto em branco
 */
function isEmptyClone(clone) {
    if (clone.childNodes.length === 0) return true;
    if (clone.childNodes.length === 1) {
        const node = clone.childNodes[0];
        if (node.nodeType === TEXT_NODE && !/\S/.test(node.nodeValue)) return true;
        if (node.childNodes.length === 0) return true;
    }
    return false;
}

/**
 * Move nós do elemento fonte para o destino até atingir o limite de altura.
 * @param {HTMLElement} putInHere - Elemento destino.
 * @param {HTMLElement} pullOutHere - Elemento fonte.
 * @param {HTMLElement} pageColumn - Coluna da página.
 * @param {number} pageContentHeight - Altura máxima permitida.
 * @returns {boolean|undefined} True se o nó devolvido for texto, undefined caso contrário.
 */
function fitOverflow(putInHere, pullOutHere, pageColumn, pageContentHeight) {
    if (!pullOutHere) return;

    // Enquanto a altura do conteúdo estiver menor que a altura da página e houver nós para mover
    while (
        pageColumn.scrollHeight < pageContentHeight &&
        pullOutHere.childNodes.length > 0
    ) {
        const node = pullOutHere.childNodes[0];

        // Se o nó não é texto nem comentário e contém COLUMNBREAK, interrompe a movimentação
        const hasColumnBreak = (node.nodeType !== TEXT_NODE && node.nodeType !== COMMENT_NODE) &&
            hasClass(node, COLUMNBREAK);

        if (hasColumnBreak) {
            return;
        }

        // Move o nó para putInHere
        putInHere.appendChild(node);
    }

    // Se ainda cabe na página e não há mais nós para mover, simplesmente retorna
    if (pageColumn.scrollHeight < pageContentHeight && pullOutHere.childNodes.length === 0) {
        return;
    }

    if (putInHere.childNodes.length === 0) return;

    const lastAppendedChild = putInHere.lastChild;

    // Remove o último nó que causou overflow
    putInHere.removeChild(lastAppendedChild);

    // Devolve o nó para pullOutHere, preferencialmente no início
    if (pullOutHere.children.length > 0) {
        pullOutHere.prepend(lastAppendedChild);
    } else {
        pullOutHere.appendChild(lastAppendedChild);
    }

    // Retorna true se o nó devolvido for um nó de texto (útil para controle na função chamada)
    return lastAppendedChild.nodeType === TEXT_NODE;
}

/**
 * Classe responsável por dividir conteúdo em colunas e páginas, respeitando regras de layout.
 */
export class Columnizer {

    /**
     * @param {PageFactory} pageFactory - Instância do PageFactory para criar novas páginas.
     */
    constructor(pageFactory) {
        this.pageFactory = pageFactory;
    }

    /**
     * Preenche uma coluna com elementos até atingir o limite de altura.
     * @param {HTMLElement} element - Elemento fonte de conteúdo.
     * @param {Object} pageObjects - Objetos da página atual.
     */
    fillColumn(element, pageObjects) {

        let remainingHeight = pageObjects.pageContentHeight;

        const column = pageObjects.pageColumn;

        while (column.scrollHeight < remainingHeight && element.children.length) {
            fitOverflow(column, element, column, remainingHeight);

            const splitResult = splitElement(column, element, column, remainingHeight);

            remainingHeight = remainingHeight - column.scrollHeight;

            if ([DONTSPLIT, COLUMNBREAK].includes(splitResult)) break;
        }
    }

    /**
     * Garante que elementos com a classe DONTEND não fiquem no final da coluna.
     * @param {HTMLElement} currentColumn - Coluna atual.
     * @param {HTMLElement} element - Elemento fonte.
     */
    handleDontendElements(currentColumn, element) {
        const lastPuInHereElement = currentColumn.lastElementChild;

        if (lastPuInHereElement && lastPuInHereElement.querySelector(`.${DONTEND}`) && lastPuInHereElement.children.length == 1) {
            const cloned = lastPuInHereElement.cloneNode(true);
            element.prepend(cloned);
            currentColumn.removeChild(lastPuInHereElement);
        }
    }

    /**
     * Divide o conteúdo em páginas de uma coluna.
     * @param {HTMLElement} element - Elemento fonte.
     * @param {Object} pageObjects - Objetos da página atual.
     * @returns {Object} Objetos da última página criada.
     */
    columnizeSingle(element, pageObjects) {
        this.fillColumn(element, pageObjects);

        if (!element.children.length) return pageObjects;

        this.handleDontendElements(pageObjects.pageColumn, element);

        return this.columnizeSingle(element, this.pageFactory.create("one-column"));
        
    }

    /**
     * Divide o conteúdo em páginas de duas colunas.
     * @param {HTMLElement} element - Elemento fonte.
     * @param {Object} pageObjects - Objetos da página atual.
     * @param {number} currentColumnIndex - Índice da coluna atual (0 ou 1).
     * @returns {Object} Objetos da última página criada e índice da coluna.
     */
    columnizeDouble(element, pageObjects, currentColumnIndex) {
        const currentColumn = pageObjects.pageColumns[currentColumnIndex];

        pageObjects.pageColumn = currentColumn;

        this.fillColumn(element, pageObjects);

        if (!element.children.length) {
            return { pageObjects, currentColumnIndex };
        }

        this.handleDontendElements(currentColumn, element);

        if (currentColumnIndex === 0) {
            return this.columnizeDouble(element, pageObjects, 1);
        } else {
            return this.columnizeDouble(element, this.pageFactory.create("two-column"), 0);
        }
    }
}
