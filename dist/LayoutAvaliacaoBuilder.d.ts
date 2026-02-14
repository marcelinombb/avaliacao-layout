export declare class LayoutAvaliacaoBuilder {
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
        folhaDeRosto: any;
        header: string;
        footer: string;
        comMarcaDaguaRascunho: any;
        ordemAlternativa: number;
        tipoAlternativa: any;
        handlers: any[];
    }>;
}
