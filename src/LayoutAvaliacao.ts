import { Assessment } from "./domain/Assessment";
import { Question } from "./domain/Question";
import { ReferenceService } from "./domain/ReferenceService";
import { AssessmentHtmlRenderer } from "./rendering/AssessmentHtmlRenderer";

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
            let parsedContent: Record<string, any> = {};
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
