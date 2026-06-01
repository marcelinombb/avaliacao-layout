import { Assessment } from "./domain/Assessment";
import { Question } from "./domain/Question";
import { ReferenceService } from "./domain/ReferenceService";
import { AssessmentHtmlRenderer } from "./rendering/AssessmentHtmlRenderer";
import { AssessmentInput } from './types/AssessmentInput';

/**
 * Retorna string vazia se o HTML contiver apenas parágrafos vazios (ex: <p ...><br></p>).
 * Caso contrário, retorna o HTML original.
 */
function sanitizeEmptyHtml(html: string): string {
    if (!html || typeof html !== 'string') return html;
    // Remove todas as tags <p> que contêm apenas <br> ou espaços em branco (com qualquer atributo)
    const stripped = html.replace(/<p[^>]*>(\s*<br\s*\/?>?\s*)<\/p>/gi, '').trim();
    return stripped === '' ? '' : html;
}

export class LayoutAvaliacao {
    input: AssessmentInput;
    layoutOptions: any;

    constructor(input: AssessmentInput, layoutOptions: any) {
        this.input = input;
        this.layoutOptions = layoutOptions;
    }

    avalicaoHtml() {
        // 1. Map Raw Data to Entities
        const assessment = this._mapToEntity(this.input);

        // 2. Domain Logic: Process References
        ReferenceService.processReferences(assessment.questions);

        // 3. Prepare for Presentation
        const renderer = new AssessmentHtmlRenderer(assessment, this.layoutOptions);

        // 4. Return formatted data
        // The previous implementation returned only the HTML string from this method
        return renderer.render();
    }

    _mapToEntity(input: AssessmentInput) {
        const { questions: rawQuestions, attachments: listaProvaAnexo, layout, id, title } = input;
        const listaProvaQuestao = rawQuestions || [];

        const seenTitles = new Set<string>();

        const questions = listaProvaQuestao.map(q => {
            let parsedContent: Record<string, any> = {};
            try {
                parsedContent = JSON.parse(q.visualizaQuestaoRaw);
            } catch (e) {
                console.error("Error parsing question content", e);
            }

            const question = new Question({
                id: q.id,
                order: q.order,
                title: q.title,
                customOrder: q.customOrder,
                value: q.value,
                type: q.type,
                reference: q.reference as any,
                orderAlternative: q.orderAlternative,
                visualizaQuestaoRaw: q.visualizaQuestaoRaw
            });

            // Flatten parsed content into the entity for easier access in presenters
            // Sanitize fields that may contain only empty paragraphs
            const htmlFields: string[] = ['instrucao', 'textoBase', 'fonte'];
            htmlFields.forEach(field => {
                if (parsedContent[field]) {
                    parsedContent[field] = sanitizeEmptyHtml(parsedContent[field]);
                }
            });
            question.visualizaQuestaoParsed = parsedContent;

            // Map other fields used in rendering
            question.linhasBranco = q.linhasBranco;
            question.quebraPagina = q.quebraPagina;
            question.visualizaResposta = q.visualizaResposta;

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
            id: input.id,
            title: input.title,
            questions: questions,
            attachments: listaProvaAnexo || [],
            layout: input.layout || {}
        });
    }
}
