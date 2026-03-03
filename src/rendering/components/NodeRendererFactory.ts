import { RenderableNode } from "../../domain/RenderableNode";
import { Question } from "../../domain/Question";
import { SectionNode } from "../../domain/SectionNode";
import { TextNode } from "../../domain/TextNode";
import { QuestionRenderer } from "./QuestionRenderer";
import { SectionRenderer } from "./SectionRenderer";
import { TextRenderer } from "./TextRenderer";

export class NodeRendererFactory {
    static create(node: RenderableNode, assessmentLayout: any, options: any): any {
        if (node.nodeType === 'sessao') {
            return new SectionRenderer(node as SectionNode, assessmentLayout, options);
        } else if (node.nodeType === 'texto_informativo') {
            return new TextRenderer(node as TextNode);
        } else if (node.nodeType === 'questao') {
            return new QuestionRenderer(node as Question, assessmentLayout, options);
        }
        throw new Error(`Renderizador não encontrado para o tipo de nó: ${node.nodeType}`);
    }
}
