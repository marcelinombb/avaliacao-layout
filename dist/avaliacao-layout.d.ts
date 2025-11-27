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
    tipoOrdenacaoAlternativa: number;
    _tipoAlternativa: any;
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
    ordemAlternativa(tipoOrdenacao: any): this;
    tipoAlternativa(tipoAlternativa: any): this;
    build(provaModelo: any): Readonly<{
        layoutHtml: string;
        cssVars: {
            "--layout-font-size": string;
            "--layout-watermark-rascunho": string;
            "--layout-watermark-instituicao": string;
            "--layout-identificacao": string;
        };
        folhaDeRosto: {
            header: string;
            content: string;
            footer: string;
        };
        header: string;
        footer: string;
        comMarcaDaguaRascunho: any;
        ordemAlternativa: number;
        tipoAlternativa: any;
        handlers: any[];
    }>;
}

declare class LayoutRenderer {
    static render(result: any, stylesheets: any, pagesContainer: any): Promise<any>;
}

declare function latexParser(text: any): any;

export { LayoutAvaliacao, LayoutAvaliacaoBuilder, LayoutRenderer, latexParser };
