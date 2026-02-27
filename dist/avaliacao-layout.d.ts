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

interface ReferenceSource {
    codigo: number;
    descricao: string;
    anoFonte?: number;
}
interface Reference {
    codigo: number | null;
    descricao: string | null;
    autor: string;
    texto: string | null;
    fonte: ReferenceSource | null;
    instituicao?: any;
    totalRegistros?: any;
}
interface QuestionContent {
    fonte?: string;
    instrucao?: string;
    textoBase?: string;
    comando?: string;
    justificarFalsas?: boolean;
    alternativas?: string[];
    afirmacoes?: any[];
    associacoes?: any;
    assercoes?: any;
    visualizaQuestaoParsed?: any;
}
interface QuestionConstructor {
    id?: number | string;
    order: number;
    customOrder?: number | null;
    value: number;
    type: string;
    content?: any;
    reference?: Reference | null;
    alternatives?: string[];
    afirmacoes?: any[];
    associacoes?: any;
    assercoes?: any;
    title?: string | null;
    visualizaQuestaoRaw?: string | null;
    orderAlternative?: number;
}
declare class Question {
    id?: number | string;
    order: number;
    customOrder?: number | null;
    value: number;
    type: string;
    content: any;
    reference: Reference | null;
    alternatives: string[];
    afirmacoes: any[];
    associacoes: any;
    assercoes: any;
    visualizaQuestaoRaw: string;
    orderAlternative: number;
    referenceInfo: string | null;
    showReference: boolean;
    visualizaQuestaoParsed: QuestionContent | null;
    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: string | null;
    numeroLinhas?: number;
    title?: string | null;
    constructor({ id, order, customOrder, value, type, content, reference, alternatives, afirmacoes, associacoes, assercoes, title, visualizaQuestaoRaw, orderAlternative }: QuestionConstructor);
    get displayOrder(): number;
}

interface Attachment {
    ordem?: number;
    anexo?: {
        texto?: string;
        [key: string]: any;
    };
    [key: string]: any;
}
interface AssessmentLayout {
    codigo?: number;
    nome?: string;
    cabecalho?: string;
    rodape?: string;
    folhaRosto?: string;
    paginacao?: string;
    tipoFolha?: string;
    margem?: number;
    cabecalhoQuestao?: string;
    cabecalhoPrimeiraQuestao?: string;
    orientacaoFolha?: string;
    rodapeRosto?: string | null;
    rascunho?: string;
    instituicao?: any;
    colunas?: number;
    marcaDagua?: string;
    fonte?: string;
    fonteTamanho?: number;
    origemQuestao?: boolean;
    ordemQuestaoPersonalizada?: boolean;
    ativo?: any;
    tamanhosSuportados?: string;
    rodapeUltimaPagina?: any;
    espacamentoLinhas?: any;
    mapa?: any;
    identificado?: any;
    totalRegistros?: any;
    tipoAlternativa?: number;
    quebraQuestao?: boolean;
    [key: string]: any;
}
interface AssessmentConstructor {
    id?: number | string;
    title?: string;
    questions?: Question[];
    attachments?: Attachment[];
    layout?: AssessmentLayout;
}
declare class Assessment {
    id?: number | string;
    title?: string;
    questions: Question[];
    attachments: Attachment[];
    layout: AssessmentLayout;
    constructor({ id, title, questions, attachments, layout }: AssessmentConstructor);
}

declare class LayoutAvaliacao {
    provaModelo: any;
    layoutOptions: any;
    constructor(provaModelo: any, layoutOptions: any);
    avalicaoHtml(): string;
    _mapToEntity(rawData: any): Assessment;
}

declare class PagedJsRenderer {
    static render(result: any, stylesheets: any, pagesContainer: any): Promise<any>;
}

declare function latexParser(text: any): any;

declare function replacePlaceholders(provaModelo: any): any;
declare function shuffleAndMultiply(arr: any, multiplier: any): any[];

declare const createBuilder: () => LayoutAvaliacaoBuilder;

export { LayoutAvaliacao, LayoutAvaliacaoBuilder, PagedJsRenderer as LayoutRenderer, createBuilder, latexParser, replacePlaceholders, shuffleAndMultiply };
