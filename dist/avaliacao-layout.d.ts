declare class LayoutAvaliacao {
    constructor(provaModelo: any, layoutOptions: any);
    provaModelo: any;
    layoutOptions: any;
    anexosHtml(): any;
    formataCabecalho(questao: any): any;
    afirmacoesHtml(afirmacoes: any, justificarFalsas: any): any;
    assercaoRazaoHtml(assercoes: any): string;
    buildAssociacao(coluna: any): any;
    associacoesHtml(associacoes: any): string;
    alternativasHtml(alternativas: any): string;
    generateReferenciaInfo(): void;
    generateReferenciaHtml(provaQuestao: any): string;
    layoutQuestaoPorTipoHtml(questao: any): any;
    questaoCompletaHtml(questao: any): string;
    questoesHtml(): any;
    avalicaoHtml(): string;
}

declare class LayoutAvaliacaoBuilder {
    header: string;
    footer: string;
    fontSize: number;
    _folhaDeRosto: {
        header: string;
        content: string;
        footer: string;
    };
    pagina: {
        header: string;
        footer: string;
    };
    numeroFolhasRascunho: any;
    _marcaDaquaRascunho: any;
    _marcaDaguaInstituicao: any;
    quantidadeColunas: number;
    paginacaoAtiva: boolean;
    _identificacao: string;
    _gabarito: boolean;
    marcaDaguaRascunho(comMarcaDagua: any): this;
    comMarcaDaguaRascunho: any;
    pageHeader(header: any): this;
    pageFooter(footer: any): this;
    marcaDaguaInstituicao(marcaDaguaUrl: any): this;
    marcaDaquaRascunho(marcaDaguaUrl: any): this;
    fonteTamanho(tamanho: any): this;
    gabarito(): void;
    rascunho(quantidadeFolhasRascunho: any): this;
    quantidadeFolhasRascunho: any;
    folhaDeRosto({ header, content, footer }: {
        header: any;
        content: any;
        footer: any;
    }): this;
    colunas(quantidade: any): this;
    identificacao(identificacao?: string): this;
    paginacao(): this;
    build(provaModelo: any): Readonly<{
        layoutHtml: string;
        cssVars: {
            "--layout-font-size": string;
            "--layout-watermark-rascunho": string;
            "--layout-watermark-instituicao": string;
            "--layout-identificacao": string;
        };
        handlers: ({
            MyHandler: typeof WatermarkHandler;
            config: {
                comMarcaDaguaRascunho: any;
                cabecalhoPagina?: undefined;
                cabecalhoFolhaDeRosto?: undefined;
                footer?: undefined;
                footerFolhaDeRosto?: undefined;
            };
        } | {
            MyHandler: typeof HeaderFooterHandler;
            config: {
                cabecalhoPagina: string;
                cabecalhoFolhaDeRosto: string;
                footer: string;
                footerFolhaDeRosto: string;
                comMarcaDaguaRascunho?: undefined;
            };
        })[];
    }>;
}
declare class WatermarkHandler {
    constructor(chunker: any, polisher: any, caller: any, config: any);
    chunker: any;
    polisher: any;
    caller: any;
    config: any;
    afterPageLayout(pageElement: any, page: any, breakToken: any, chunker: any): void;
}
declare class HeaderFooterHandler {
    constructor(chunker: any, polisher: any, caller: any, config: any);
    chunker: any;
    polisher: any;
    caller: any;
    config: any;
    originalWidth: number;
    originalHeight: number;
    beforePageLayout(page: any): void;
    afterRendered(pages: any): void;
    createColumnsElement(): HTMLDivElement;
    createFooterArea(page: any, content: any): void;
    createHeaderArea(page: any, content: any): void;
    calculateRealHeight(element: any): any;
    marginsHeight(element: any, total?: boolean): number;
    paddingHeight(element: any, total?: boolean): number;
    borderHeight(element: any, total?: boolean): number;
}

declare class LayoutRenderer {
    static render(result: any, stylesheets: any, pagesContainer: any): Promise<any>;
}

export { LayoutAvaliacao, LayoutAvaliacaoBuilder, LayoutRenderer };
