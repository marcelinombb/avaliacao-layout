import { Question } from "./Question";

export interface Attachment {
    ordem?: number;
    anexo?: {
        texto?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface AssessmentLayout {
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

export interface AssessmentConstructor {
    id?: number | string;
    title?: string;
    questions?: Question[];
    attachments?: Attachment[];
    layout?: AssessmentLayout;
}

export class Assessment {
    id?: number | string;
    title?: string;
    questions: Question[];
    attachments: Attachment[];
    layout: AssessmentLayout;

    constructor({ id, title, questions = [], attachments = [], layout = {} }: AssessmentConstructor) {
        this.id = id;
        this.title = title;
        this.questions = questions;
        this.attachments = attachments;
        this.layout = layout;
    }
}
