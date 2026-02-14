export interface ReferenceSource {
    codigo: number;
    descricao: string;
    anoFonte?: number;
}
export interface Reference {
    codigo: number | null;
    descricao: string | null;
    autor: string;
    texto: string | null;
    fonte: ReferenceSource | null;
    instituicao?: any;
    totalRegistros?: any;
}
export interface QuestionContent {
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
export interface QuestionConstructor {
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
    visualizaQuestaoRaw?: string | null;
    orderAlternative?: number;
}
export declare class Question {
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
    constructor({ id, order, customOrder, value, type, content, reference, alternatives, afirmacoes, associacoes, assercoes, visualizaQuestaoRaw, orderAlternative }: QuestionConstructor);
    get displayOrder(): number;
}
