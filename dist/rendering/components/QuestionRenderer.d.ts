export declare class QuestionRenderer {
    question: any;
    assessmentLayout: any;
    options: any;
    constructor(question: any, assessmentLayout: any, options: any);
    render(): string;
    renderHeader(): any;
    renderReference(): string;
    renderBody(): any;
    renderAlternativas(alternativas: any): string;
    renderAfirmacoes(afirmacoes: any, justificarFalsas: any): any;
    renderAssociacoes(associacoes: any): string;
    renderAssercoes(assercoes: any): string;
    renderResponseQuadro(): string;
}
