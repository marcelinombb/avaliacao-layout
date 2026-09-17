export interface FolhaDeRosto {
    header: string;
    content: string;
    footer: string;
}

export interface LayoutOptions {
    fontSize: number;
    folhaDeRosto?: string;
    rascunho?: string;
    quantidadeFolhasRascunho?: number;
    quantidadeColunas?: number;
    quebraQuestao?: boolean;
    gabarito?: boolean;
    paginacaoAtiva?: boolean;
    tipoOrdenacaoAlternativa?: number;
    tipoAlternativa?: number | null;
    header?: string;
    footer?: string;
    comMarcaDaguaRascunho?: boolean;
    marcaDaquaRascunho?: string | null;
    marcaDaguaInstituicao?: string | null;
    identificacao?: string;
    latex?: boolean;
}
