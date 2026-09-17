import { Assessment } from "../domain/Assessment";
import { Question } from "../domain/Question";
import { AssessmentInput } from "../types/AssessmentInput";

/**
 * Retorna string vazia se o HTML contiver apenas parágrafos vazios (ex: <p ...><br></p>).
 * Caso contrário, retorna o HTML original.
 */
function sanitizeEmptyHtml(html: string | undefined | null): string {
    if (!html || typeof html !== 'string') return html as string;
    // Remove todas as tags <p> que contêm apenas <br> ou espaços em branco (com qualquer atributo)
    const stripped = html.replace(/<p[^>]*>(\s*<br\s*\/?>?\s*)<\/p>/gi, '').trim();
    return stripped === '' ? '' : html;
}

export class AssessmentMapper {
    static toDomain(input: AssessmentInput): Assessment {
        const { questions: rawQuestions, attachments: listaProvaAnexo, layout, id, title } = input;
        const listaProvaQuestao = rawQuestions || [];

        const seenTitles = new Set<string>();

        const questions = listaProvaQuestao.map(q => {
            let parsedContent: Record<string, any> = {};
            try {
                if (q.visualizaQuestaoRaw) {
                    const parsed = JSON.parse(q.visualizaQuestaoRaw);
                    if (parsed !== null && typeof parsed === 'object') {
                        parsedContent = parsed;
                    }
                }
            } catch (e) {
                // visualizaQuestaoRaw was not valid JSON; parsedContent stays {}
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
            question.visualizaQuestaoParsed = parsedContent as any;

            // Map other fields used in rendering
            question.linhasBranco = q.linhasBranco;
            question.quebraPagina = q.quebraPagina;
            question.visualizaResposta = q.visualizaResposta;

            // Map fields used by QuadroResposta
            question.tipoLinha = q.tipoLinha as any;
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
