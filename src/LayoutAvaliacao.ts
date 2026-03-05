import { Assessment } from "./domain/Assessment";
import { Question } from "./domain/Question";
import { ReferenceService } from "./domain/ReferenceService";
import { AssessmentHtmlRenderer } from "./rendering/AssessmentHtmlRenderer";
import { RenderableNode } from "./domain/RenderableNode";
import { SectionNode } from "./domain/SectionNode";
import { TextNode } from "./domain/TextNode";

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
        ReferenceService.processReferences(assessment.nodes);

        // 3. Prepare for Presentation
        const renderer = new AssessmentHtmlRenderer(assessment, this.layoutOptions);

        // 4. Return formatted data
        // The previous implementation returned only the HTML string from this method
        return renderer.render();
    }

    _mapToEntity(rawData: any) {
        const { prova, listaProvaQuestao, listaProvaAnexo, blocos } = rawData;

        const mapQuestion = (q: any) => {
            let parsedContent = {};
            try {
                if (q.questao && q.questao.visualizaQuestao) {
                    parsedContent = JSON.parse(q.questao.visualizaQuestao);
                }
            } catch (e) {
                console.error("Error parsing question content", e);
            }

            const question = new Question({
                id: q.questao?.codigo,
                order: q.ordem,
                title: q.titulo,
                customOrder: q.ordemPersonalizada,
                value: q.valor,
                type: q.questao?.tipoQuestao,
                reference: q.questao?.referencia,
                orderAlternative: q.ordemAlternativa,
                visualizaQuestaoRaw: q.questao?.visualizaQuestao
            });

            // Flatten parsed content into the entity for easier access in presenters
            question.visualizaQuestaoParsed = parsedContent;

            // Map other fields used in rendering
            question.linhasBranco = q.linhasBranco;
            question.quebraPagina = q.quebraPagina;
            question.visualizaResposta = q.questao?.visualizaResposta;

            // Map fields used by QuadroResposta
            question.tipoLinha = q.tipoLinha;
            question.numeroLinhas = q.numeroLinhas;

            return question;
        };

        let nodes: RenderableNode[] = [];

        if (blocos && blocos.length > 0) {
            const mapNode = (bloco: any): RenderableNode | null => {
                if (bloco.tipo === 'sessao') {
                    return new SectionNode({
                        titulo: bloco.titulo,
                        layoutOverride: bloco.layoutOverride,
                        children: (bloco.filhos || []).map(mapNode).filter(Boolean) as RenderableNode[]
                    });
                } else if (bloco.tipo === 'texto_informativo') {
                    return new TextNode({ conteudo: bloco.conteudo });
                } else if (bloco.tipo === 'questao') {
                    return mapQuestion(bloco);
                }
                console.warn(`Bloco com tipo não mapeado não será renderizado: ${bloco.tipo}`);
                return null;
            };
            nodes = blocos.map(mapNode).filter(Boolean) as RenderableNode[];
        } else {
            nodes = (listaProvaQuestao || []).map(mapQuestion);
        }

        return new Assessment({
            id: prova?.id,
            title: prova?.descricao,
            nodes: nodes,
            attachments: listaProvaAnexo || [],
            layout: prova?.layout || {}
        });
    }
}
