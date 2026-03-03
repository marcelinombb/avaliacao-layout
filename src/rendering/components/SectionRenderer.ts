import { SectionNode } from "../../domain/SectionNode";
import { NodeRendererFactory } from "./NodeRendererFactory";

export class SectionRenderer {
    node: SectionNode;
    assessmentLayout: any;
    options: any;

    constructor(node: SectionNode, assessmentLayout: any, options: any) {
        this.node = node;
        this.assessmentLayout = assessmentLayout;
        this.options = options;
    }

    render(): string {
        let colunas = this.options.quantidadeColunas; // default
        //prevent nested sections from being rendered as 2 columns
        const childOptions = { ...this.options, quantidadeColunas: 1 };
        const renderedChildren = this.node.children
            .map(child => {
                const renderer = NodeRendererFactory.create(child, this.assessmentLayout, childOptions);
                return renderer.render();
            })
            .join("");

        let classes = ["sessao-wrapper"];
        let innerClasses = ["sessao-conteudo"];

        // Seção pode forçar colchetes ou outras definições CSS
        if (this.node.layoutOverride?.colunas) {
            colunas = this.node.layoutOverride.colunas;
        }

        if (colunas == 2) {
            innerClasses.push("duas-colunas");
        } else {
            innerClasses.push("uma-coluna");
        }

        if (this.node.layoutOverride?.quebraPaginaAntes) {
            classes.push("pagebreak");
        }

        const headerHtml = this.node.titulo ? `<h3 class="sessao-titulo" style="text-align: center;">${this.node.titulo}</h3>` : "";

        // Vamos emular o comportamento do div id='duas-colunas' original
        const idAttr = colunas == 2 ? `id="duas-colunas"` : "";

        return `<div class="${classes.join(" ")}" ${idAttr}>
            ${headerHtml}
            <div class="${innerClasses.join(" ")}">
                ${renderedChildren}
            </div>
        </div>`;
    }
}
