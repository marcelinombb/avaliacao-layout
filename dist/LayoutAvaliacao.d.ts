import { Assessment } from "./domain/Assessment";
export declare class LayoutAvaliacao {
    provaModelo: any;
    layoutOptions: any;
    constructor(provaModelo: any, layoutOptions: any);
    avalicaoHtml(): string;
    _mapToEntity(rawData: any): Assessment;
}
