declare class LayoutAvaliacaoBuilder {
    header: string;
    footer: string;
    fontSize: number;
    _folhaDeRosto: any;
    pagina: any;
    numeroFolhasRascunho: any;
    _marcaDaquaRascunho: any;
    _marcaDaguaInstituicao: any;
    quantidadeColunas: number;
    paginacaoAtiva: boolean;
    _identificacao: string;
    _gabarito: boolean;
    tipoOrdenacaoAlternativa: number;
    _tipoAlternativa: any;
    _rascunhoHtml: string;
    comMarcaDaguaRascunho: any;
    quantidadeFolhasRascunho: any;
    constructor();
    marcaDaguaRascunho(comMarcaDagua: any): this;
    pageHeader(header: any): this;
    pageFooter(footer: any): this;
    marcaDaguaInstituicao(marcaDaguaUrl: any): this;
    marcaDaquaRascunho(marcaDaguaUrl: any): this;
    fonteTamanho(tamanho: any): this;
    gabarito(): this;
    rascunho(quantidadeFolhasRascunho: any): this;
    rascunhoHtml(rascunhoHtml: any): this;
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
    build(provaModelo: any): string;
}

declare class PagedJsRenderer {
    static render(html: string, stylesheets: any, pagesContainer: HTMLElement, customHandlers?: any[]): Promise<any>;
}

declare function latexParser(text: any): any;

declare function replacePlaceholders(provaModelo: any): any;

declare const createLayout: () => LayoutAvaliacaoBuilder;

export { LayoutAvaliacaoBuilder, PagedJsRenderer as LayoutRenderer, createLayout, latexParser, replacePlaceholders };
