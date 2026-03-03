import { TextNode } from "../../domain/TextNode";

export class TextRenderer {
    node: TextNode;

    constructor(node: TextNode) {
        this.node = node;
    }

    render(): string {
        return `<div class="texto-informativo">${this.node.conteudo}</div>`;
    }
}
