import { RenderableNode } from "./RenderableNode";
import { Question } from "./Question";
import { SectionNode } from "./SectionNode";

export class ReferenceService {
    static extractQuestions(nodes: RenderableNode[]): Question[] {
        let questions: Question[] = [];
        for (const node of nodes) {
            if (node.nodeType === 'questao') {
                questions.push(node as Question);
            } else if (node.nodeType === 'sessao') {
                questions.push(...this.extractQuestions((node as SectionNode).children));
            }
        }
        return questions;
    }

    /**
     * Group questions by reference and set metadata
     * @param {RenderableNode[]} nodes 
     */
    static processReferences(nodes: RenderableNode[]) {
        const questions = this.extractQuestions(nodes);
        const formatLista = (indices: number[]) =>
            indices.map((i) => i + 1).join(", ").replace(/,([^,]*)$/, " e$1");

        const questaoReferencia = questions.reduce((map, question, index) => {
            const ref = question.reference?.codigo;
            if (ref) {
                const existentes = map.get(ref) ?? [];
                map.set(ref, [...existentes, index]);
            }
            return map;
        }, new Map());

        for (const [codigo, indices] of questaoReferencia) {
            const primeira = questions[indices[0]];
            primeira.referenceInfo = formatLista(indices);
            primeira.showReference = true;
        }

        return nodes;
    }
}
