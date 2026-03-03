import { RenderableNode } from "./RenderableNode";

export class TextNode implements RenderableNode {
    nodeType: string = 'texto_informativo';
    conteudo: string;

    constructor({ conteudo }: { conteudo: string }) {
        this.conteudo = conteudo;
    }
}
