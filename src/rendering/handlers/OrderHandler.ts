import { Handler } from "pagedjs";
import { conversorDeIndicesParaAlternativas } from "../utils/util";

export const TIPO_ORDENACAO = Object.freeze({
    NAO_EMBARALHAR: 0,
    ALEATORIO: 1,
    ASCENDENTE: 2,
    DESCENDENTE: 3,
});

export default class OrderHandler extends Handler {

    config: any;
    measureRoot: HTMLElement | null;
    processedRefs: Set<string>;
    processedNodes: WeakSet<Element>;

    constructor(chunker: any, polisher: any, caller: any, config: any = {}) {
        super(chunker, polisher, caller);
        this.config = config;
        this.measureRoot = null;
        this.processedRefs = new Set<string>();
        this.processedNodes = new WeakSet<Element>();
    }

    layoutNode(node: any) {
        if (!node || node.nodeType !== 1) return;
        if (!node.classList?.contains("avaliacao-alternativas")) return;

        const ref = node.dataset?.ref;
        if (typeof ref === "string") {
            if (this.processedRefs.has(ref)) return;
        } else if (this.processedNodes.has(node)) {
            return;
        }

        this.processarBloco(node);

        if (typeof ref === "string") {
            this.processedRefs.add(ref);
            return;
        }

        this.processedNodes.add(node);
    }

    processarBloco(bloco: any) {

        if (bloco.dataset.ordemAlternativaProcessada === "true") return;

        const { ordemAlternativa: rawOrdem } = bloco.dataset;

        const filhos = Array.from(bloco.querySelectorAll(".linha-alternativa")) as HTMLElement[];
        if (!filhos.length) return;

        const ordem = this.resolverTipoOrdenacao(rawOrdem);

        const alternativas = filhos.map((element: HTMLElement) => ({
            element,
            width: this.obterWidth(element)
        }));

        this.aplicarOrdenacao(alternativas, ordem);

        this.reRenderizar(bloco, alternativas);
    }

    resolverTipoOrdenacao(rawOrdem: any) {
        const parsed = Number.parseInt(rawOrdem, 10);

        if (!rawOrdem || Number.isNaN(parsed) || parsed === 0) {
            return typeof this.config?.ordemAlternativa === "number"
                ? this.config.ordemAlternativa
                : TIPO_ORDENACAO.NAO_EMBARALHAR;
        }

        return parsed;
    }

    obterWidth(element: any) {
        const root = this.getMeasureRoot();
        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.width = "max-content";
        clone.style.maxWidth = "none";

        root.appendChild(clone);
        const target = clone.querySelector(".media-corpo") || clone;
        const width = target.getBoundingClientRect().width;
        root.removeChild(clone);

        if (width > 0) return width;

        const fallbackText = (target.textContent || "").trim();
        return fallbackText.length;
    }

    getMeasureRoot() {
        if (this.measureRoot) return this.measureRoot;

        const root = document.createElement("div");
        root.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;";
        document.body.appendChild(root);
        this.measureRoot = root;

        return root;
    }

    aplicarOrdenacao(alternativas: any[], tipo: number) {

        switch (tipo) {

            case TIPO_ORDENACAO.ASCENDENTE:
                alternativas.sort((a, b) => a.width - b.width);
                break;

            case TIPO_ORDENACAO.DESCENDENTE:
                alternativas.sort((a, b) => b.width - a.width);
                break;

            case TIPO_ORDENACAO.ALEATORIO:
                this.shuffle(alternativas);
                break;

            case TIPO_ORDENACAO.NAO_EMBARALHAR:
            default:
                break;
        }
    }

    reRenderizar(bloco: any, alternativas: any[]) {

        const fragment = document.createDocumentFragment();

        alternativas.forEach(({ element }, index) => {

            const label = element.querySelector(".media-esq");
            if (label) {
                label.innerHTML = conversorDeIndicesParaAlternativas(
                    index,
                    this.config.tipoAlternativa
                );
            }

            fragment.appendChild(element);
        });

        bloco.replaceChildren(fragment);
        bloco.dataset.ordemAlternativaProcessada = "true";
    }

    shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
