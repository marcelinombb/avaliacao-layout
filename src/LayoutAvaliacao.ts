import { Assessment } from "./domain/Assessment";
import { Question } from "./domain/Question";
import { ReferenceService } from "./domain/ReferenceService";
import { AssessmentHtmlRenderer } from "./rendering/AssessmentHtmlRenderer";

export class LayoutAvaliacao {
    provaModelo: any;
    layoutOptions: any;

    constructor(provaModelo: any, layoutOptions: any) {
        this.provaModelo = provaModelo;
        this.layoutOptions = layoutOptions;
    }

    avalicaoHtml() {
        // 1. Map Raw Data to Entities
        const assessment = this._mapToEntity(this.provaModelo);

        // 2. Domain Logic: Process References
        ReferenceService.processReferences(assessment.questions);

        // 3. Prepare for Presentation
        const renderer = new AssessmentHtmlRenderer(assessment, this.layoutOptions);

        // 4. Return formatted data
        // The previous implementation returned only the HTML string from this method
        return renderer.render();
    }

    _mapToEntity(rawData) {
        const { prova, listaProvaQuestao, listaProvaAnexo } = rawData;

        const seenTitles = new Set<string>();

        const questions = (listaProvaQuestao || []).map(q => {
            let parsedContent = {};
            try {
                parsedContent = JSON.parse(q.questao.visualizaQuestao);
            } catch (e) {
                console.error("Error parsing question content", e);
            }

            const question = new Question({
                id: q.questao.codigo,
                order: q.ordem,
                title: q.titulo,
                customOrder: q.ordemPersonalizada,
                value: q.valor,
                type: q.questao.tipoQuestao,
                reference: q.questao.referencia,
                orderAlternative: q.ordemAlternativa,
                visualizaQuestaoRaw: q.questao.visualizaQuestao
            });

            // Flatten parsed content into the entity for easier access in presenters
            question.visualizaQuestaoParsed = parsedContent;

            // Map other fields used in rendering
            question.linhasBranco = q.linhasBranco;
            question.quebraPagina = q.quebraPagina;
            question.visualizaResposta = q.questao.visualizaResposta;

            // Map fields used by QuadroResposta
            question.tipoLinha = q.tipoLinha;
            question.numeroLinhas = q.numeroLinhas;

            if (question.title) {
                const normalizedTitle = question.title.trim().toLowerCase();
                if (seenTitles.has(normalizedTitle)) {
                    question.showTitle = false;
                } else {
                    seenTitles.add(normalizedTitle);
                    question.showTitle = true;
                }
            } else {
                question.showTitle = false;
            }

            return question;
        });

        return new Assessment({
            id: prova?.id,
            title: prova?.descricao,
            questions: questions,
            attachments: listaProvaAnexo || [],
            layout: prova?.layout || {}
        });
    }
}
