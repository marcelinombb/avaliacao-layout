import { QuestionRenderer } from "./components/QuestionRenderer";
import { Assessment } from "../domain/Assessment";
import { LayoutOptions } from "../types/LayoutOptions";

export class AssessmentHtmlRenderer {
    assessment: Assessment;
    options: LayoutOptions;

    constructor(assessment: Assessment, options: LayoutOptions) {
        this.assessment = assessment;
        this.options = options;
    }

    render() {
        const folhaDeRostoHtml = this.options.folhaDeRosto ? `<div id="folha-rosto">${this.options.folhaDeRosto}</div>` : "";
        const questionsHtml = this.renderQuestions();
        const attachmentsHtml = this.renderAttachments();
        const rascunhoContent = this.options.rascunho || "";
        const draftsHtml = `<div class="rascunho">${rascunhoContent}</div>`.repeat(this.options.quantidadeFolhasRascunho || 0);
        return folhaDeRostoHtml + questionsHtml + attachmentsHtml + draftsHtml;
    }

    renderQuestions() {
        const questionsHtml = this.assessment.questions
            .map(question => {
                const presenter = new QuestionRenderer(question, this.assessment.layout, this.options);
                return presenter.render();
            })
            .join("");

        return this.options.quantidadeColunas == 2
            ? `<div id='duas-colunas'>${questionsHtml}</div>`
            : questionsHtml;
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
