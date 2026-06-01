export interface ReferenceInput {
    codigo?: number | null;
    descricao?: string | null;
    autor?: string;
    texto?: string | null;
    fonte?: {
        codigo: number;
        descricao: string;
        anoFonte?: number;
    } | null;
}

export interface AssessmentLayoutInput {
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
    colunas?: number;
    marcaDagua?: string;
    fonte?: string;
    fonteTamanho?: number;
    origemQuestao?: boolean;
    ordemQuestaoPersonalizada?: boolean;
    tipoAlternativa?: number;
    quebraQuestao?: boolean;
}

export interface AttachmentInput {
    ordem?: number;
    anexo?: {
        texto?: string;
    };
}

export interface QuestionInput {
    id?: number | string;
    order: number;
    customOrder?: number | null;
    value: number;
    type: string;
    reference?: ReferenceInput | null;
    visualizaQuestaoRaw?: string | null;
    orderAlternative?: number;
    title?: string | null;
    linhasBranco?: number;
    quebraPagina?: boolean;
    visualizaResposta?: string;
    tipoLinha?: { codigo: number; nome: string } | null;
    numeroLinhas?: number;
}

export interface AssessmentInput {
    id?: number | string;
    title?: string;
    questions?: QuestionInput[];
    attachments?: AttachmentInput[];
    layout?: AssessmentLayoutInput;
}
