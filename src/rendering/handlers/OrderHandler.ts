import { Handler } from "pagedjs";
import { conversorDeIndicesParaAlternativas } from "../utils/util";

export const TIPO_ORDENACAO = Object.freeze({
    NAO_EMBARALHAR: 0,
    ALEATORIO: 1,
    ASCENDENTE: 2,
    DESCENDENTE: 3,
});

export default class OrderHandler extends Handler {

    orderCache = new Map<string, number>();
    config: any;

    constructor(chunker: any, polisher: any, caller: any, config: any = {}) {
        super(chunker, polisher, caller);
        this.config = config;
    }

    afterPageLayout(pageElement: any) {
        const blocos = pageElement.querySelectorAll(".avaliacao-alternativas");

        for (const bloco of blocos) {
            this.processarBloco(bloco);
        }
    }

    processarBloco(bloco: any) {

        const { ref, splitFrom, ordemAlternativa: rawOrdem } = bloco.dataset;

        const filhos = Array.from(bloco.querySelectorAll(".linha-alternativa")) as HTMLElement[];
        if (!filhos.length) return;

        // guarda tamanho original apenas na primeira renderização
        if (!splitFrom) {
            this.orderCache.set(ref, filhos.length);
        }

        const ordem = this.resolverTipoOrdenacao(rawOrdem);

        const alternativas = filhos.map((element: HTMLElement) => ({
            element,
            width: this.obterWidth(element)
        }));

        this.aplicarOrdenacao(alternativas, ordem);

        this.reRenderizar(bloco, alternativas, ref, splitFrom);
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
        const conteudo = element.querySelector(".media-corpo");
        return (conteudo || element).getBoundingClientRect().width;
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

    reRenderizar(bloco: any, alternativas: any[], ref: string, splitFrom: any) {

        const fragment = document.createDocumentFragment();
        const baseIndex = splitFrom ? (this.orderCache.get(ref) ?? 0) : 0;

        alternativas.forEach(({ element }, index) => {

            const indiceFinal: number = baseIndex + index;

            const label = element.querySelector(".media-esq");
            if (label) {
                label.innerHTML = conversorDeIndicesParaAlternativas(
                    indiceFinal,
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
