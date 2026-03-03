import { RenderableNode } from "./RenderableNode";

export interface SectionLayoutOverride {
    colunas?: number;
    quebraPaginaAntes?: boolean;
    [key: string]: any;
}

export class SectionNode implements RenderableNode {
    nodeType: string = 'sessao';
    titulo?: string;
    layoutOverride?: SectionLayoutOverride;
    children: RenderableNode[];

    constructor({ titulo, layoutOverride, children = [] }: { titulo?: string, layoutOverride?: SectionLayoutOverride, children?: RenderableNode[] }) {
        this.titulo = titulo;
        this.layoutOverride = layoutOverride;
        this.children = children;
    }
}
