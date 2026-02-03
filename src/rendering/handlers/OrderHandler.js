import { Handler } from "pagedjs";
import { conversorDeIndicesParaAlternativas } from "../utils/util.js";

const TIPO_ORDENACAO = {
    NAO_EMBARALHAR: 0,
    ALEATORIO: 1,
    ASCENDENTE: 2,
    DESCENDENTE: 3,
}

export default class OrderHandler extends Handler {
    constructor(chunker, polisher, caller, config) {
        super(chunker, polisher, caller);
        this.chunker = chunker;
        this.polisher = polisher;
        this.caller = caller;
        this.config = config;
    }

    afterPageLayout(pageElement) {

        pageElement.querySelectorAll(".avaliacao-alternativas").forEach((blocoAlternativas) => {

            const alternativasRect = [];

            if (blocoAlternativas.dataset.ordemAlternativaProcessada) return;

            const rawOrdem = blocoAlternativas.dataset.ordemAlternativa;
            let ordemAlternativa = Number.parseInt(rawOrdem, 10);
            if (!rawOrdem || Number.isNaN(ordemAlternativa) || ordemAlternativa === 0) {
                ordemAlternativa = this.config && typeof this.config.ordemAlternativa === "number"
                    ? this.config.ordemAlternativa
                    : TIPO_ORDENACAO.NAO_EMBARALHAR;
            }

            Array.from(blocoAlternativas.children).forEach((child) => {

                if (child == null) return;

                const conteudoAlternativa = child.querySelector(".media-corpo");

                alternativasRect.push({
                    element: child.cloneNode(true),
                    width: (conteudoAlternativa || child).getBoundingClientRect().width
                });

            });

            switch (ordemAlternativa) {
                case TIPO_ORDENACAO.ASCENDENTE:
                    alternativasRect.sort((a, b) => a.width - b.width);
                    break;
                case TIPO_ORDENACAO.DESCENDENTE:
                    alternativasRect.sort((a, b) => b.width - a.width);
                    break;
                case TIPO_ORDENACAO.ALEATORIO:
                    const alternativasEmbaralhadas = this.embaralharAlternativas(alternativasRect);
                    alternativasRect.length = 0;
                    alternativasEmbaralhadas.forEach((item) => alternativasRect.push(item));
                    break;
                case TIPO_ORDENACAO.NAO_EMBARALHAR:
                    break;
                default:
                    break;
            }

            const fragment = document.createDocumentFragment();

            alternativasRect.forEach(({ element }, index) => {

                const label = element.querySelector(".media-esq");
                if (label) {
                    label.innerHTML = conversorDeIndicesParaAlternativas(index, this.config.tipoAlternativa);
                }

                fragment.appendChild(element);
            });

            blocoAlternativas.innerHTML = "";
            blocoAlternativas.setAttribute("data-ordem-alternativa-processada", "true");
            blocoAlternativas.appendChild(fragment);
        });
    }

    embaralharAlternativas(alternativas) {
        const copy = [...alternativas]; // create a shallow copy
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]]; // swap elements
        }
        return copy;
    }
}