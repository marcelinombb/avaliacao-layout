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
    instituicao?: string | null;
    totalRegistros?: number | null;
}

export interface AfirmacaoItem {
    item: string;
    descricao: string;
}

export interface AssociacaoItem {
    item: string;
    descricao: string;
}

export interface AssociacoesContent {
    coluna1: AssociacaoItem[];
    coluna2: AssociacaoItem[];
}

export interface AssercoesContent {
    assercao1?: string;
    assercao2?: string;
}

export interface TipoLinha {
    codigo: number;
    nome: string;
}

export interface QuestionContent {
    fonte?: string;
    instrucao?: string;
    textoBase?: string;
    comando?: string;
    justificarFalsas?: boolean;
    alternativas?: string[];
    afirmacoes?: AfirmacaoItem[];
    associacoes?: AssociacoesContent | null;
    assercoes?: AssercoesContent | null;
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
    afirmacoes?: AfirmacaoItem[];
    associacoes?: AssociacoesContent | null;
    assercoes?: AssercoesContent | null;
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
    afimacoes: AfirmacaoItem[];
    associacoes: AssociacoesContent | null;
    assercoes: AssercoesContent | null;
    visualizaQuestaoRaw: string;
    orderAlternative: number;

    referenceInfo: string | null = null;
    showReference: boolean = false;
    visualizaQuestaoParsed: QuestionContent | null = null;

    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: TipoLinha | null;
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
        this.afimacoes = afirmacoes || [];
        this.associacoes = associacoes;
        this.assercoes = assercoes;
        this.visualizaQuestaoRaw = visualizaQuestaoRaw || '';
        this.orderAlternative = orderAlternative || 0;
    }

    get displayOrder() {
        return this.customOrder ?? this.order;
    }
}
