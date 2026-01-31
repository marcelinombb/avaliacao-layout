import { Question } from "../../domain/entities/Question.js";
import { Assessment } from "../../domain/entities/Assessment.js";
import { ReferenceService } from "../../domain/services/ReferenceService.js";
import { HtmlAssessmentPresenter } from "../../../adapters/presenters/HtmlAssessmentPresenter.js";

export class GenerateAssessmentLayout {
    /**
     * Executes the use case
     * @param {Object} rawData - The provaModelo object
     * @param {Object} options - The layoutOptions
     */
    execute(rawData, options) {
        // 1. Map Raw Data to Entities
        const assessment = this.mapToEntity(rawData);

        // 2. Domain Logic: Process References
        ReferenceService.processReferences(assessment.questions);

        // 3. Prepare for Presentation
        const presenter = new HtmlAssessmentPresenter(assessment, options);

        // 4. Return formatted data
        return {
            html: presenter.render(),
            // We can add more metadata here if needed
        };
    }

    mapToEntity(rawData) {
        const { prova, listaProvaQuestao, listaProvaAnexo } = rawData;

        const questions = (listaProvaQuestao || []).map(q => {
            let parsedContent = {};
            try {
                parsedContent = JSON.parse(q.questao.visualizaQuestao);
            } catch (e) {
                console.error("Error parsing question content", e);
            }

            const question = new Question({
                id: q.questao.id,
                order: q.ordem,
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
