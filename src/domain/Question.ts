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
    visualizaQuestaoParsed?: any; // Recursion or extra fields
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

export class Question {
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

    referenceInfo: string | null = null;
    showReference: boolean = false;
    visualizaQuestaoParsed: QuestionContent | null = null;

    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: string | null;
    numeroLinhas?: number;

    constructor({
        id,
        order,
        customOrder,
        value,
        type,
        content,
        reference,
        alternatives = [],
        afirmacoes = [],
        associacoes = null,
        assercoes = null,
        visualizaQuestaoRaw = null,
        orderAlternative = 0
    }: QuestionConstructor) {
        this.id = id;
        this.order = order;
        this.customOrder = customOrder;
        this.value = value;
        this.type = type;
        this.content = content;
        this.reference = reference || null;
        this.alternatives = alternatives || [];
        this.afirmacoes = afirmacoes || [];
        this.associacoes = associacoes;
        this.assercoes = assercoes;
        this.visualizaQuestaoRaw = visualizaQuestaoRaw || '';
        this.orderAlternative = orderAlternative || 0;
    }

    get displayOrder() {
        return this.customOrder ?? this.order;
    }
}
