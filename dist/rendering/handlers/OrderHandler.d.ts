import { Handler } from "pagedjs";
export declare const TIPO_ORDENACAO: Readonly<{
    NAO_EMBARALHAR: 0;
    ALEATORIO: 1;
    ASCENDENTE: 2;
    DESCENDENTE: 3;
}>;
export default class OrderHandler extends Handler {
    orderCache: Map<string, number>;
    config: any;
    constructor(chunker: any, polisher: any, caller: any, config?: any);
    afterPageLayout(pageElement: any): void;
    processarBloco(bloco: any): void;
    resolverTipoOrdenacao(rawOrdem: any): any;
    obterWidth(element: any): any;
    aplicarOrdenacao(alternativas: any[], tipo: number): void;
    reRenderizar(bloco: any, alternativas: any[], ref: string, splitFrom: any): void;
    shuffle(array: any[]): void;
}
