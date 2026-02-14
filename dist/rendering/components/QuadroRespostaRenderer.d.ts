export declare class QuadroRespostaRenderer {
    linhasTabelaNumeradas(numberOfLines: any, withHeader?: boolean): string;
    linhasTabela(numberOfLines: any, withHeader?: boolean): string;
    linhasTabelaComCabecalho(numberOfLines: any, withHeader?: boolean): string;
    linhasSemRespostaSemBorda(numberOfLines: any): string;
    linhasSemBordaComLinha(numberOfLines: any): string;
    linhaComCalculo(numberOfLines: any): string;
    quadroDeLinhasEmBranco(numberOfLines: any): string;
    quadroDeLinhasComCorrecao(numberOfLines: any): string;
    static tipoQuadroRespostaHtml(tipoLinha: number, numeroLinhas: number): string;
}
