import { NodeRendererFactory } from "./components/NodeRendererFactory";
import latexParser from "./utils/latexParser";

export class AssessmentHtmlRenderer {
    assessment: any;
    options: any;

    constructor(assessment: any, options: any) {
        this.assessment = assessment;
        this.options = options;
    }

    render() {
        const folhaDeRostoHtml = this.options.folhaDeRosto ? `<div id="folha-rosto">${this.options.folhaDeRosto}</div>` : "";
        const nodesHtml = this.renderNodes();
        const attachmentsHtml = this.renderAttachments();
        const draftsHtml = `<div class="rascunho">${this.options.rascunho}</div>`.repeat(this.options.quantidadeFolhasRascunho || 0);
        const fullHtml = folhaDeRostoHtml + nodesHtml + attachmentsHtml + draftsHtml;
        return latexParser(fullHtml);
    }

    renderNodes() {
        const nodesHtml = this.assessment.nodes
            .map((node: any) => {
                const presenter = NodeRendererFactory.create(node, this.assessment.layout, this.options);
                return presenter.render();
            })
            .join("");

        const isLegacyFallback = this.assessment.nodes.length > 0 && this.assessment.nodes[0].nodeType === 'questao';

        return isLegacyFallback && this.options.quantidadeColunas == 2
            ? `<div id='duas-colunas'>${nodesHtml}</div>`
            : nodesHtml;
    }

    renderAttachments() {
        const listaAnexos = this.assessment.attachments;
        if (!listaAnexos || listaAnexos.length === 0) return "";

        return listaAnexos
            .map(anexo => `
                <div class="anexo">
                    <div class="columnbreak"></div>
                    <p style="text-align:center"><strong>ANEXO ${anexo.ordem}</strong></p>
                    <p>&nbsp;</p>
                    <div>${anexo.anexo.texto}</div>
                </div>
            `)
            .join("");
    }
}
