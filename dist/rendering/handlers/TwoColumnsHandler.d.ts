import { Handler } from "pagedjs";
export default class TwoColumnsHandler extends Handler {
    chunker: any;
    polisher: any;
    caller: any;
    config: any;
    originalWidth: number;
    originalHeight: number;
    constructor(chunker: any, polisher: any, caller: any, config: any);
    beforePageLayout(page: any): void;
    hasValidContent(page: any): boolean;
    afterRendered(pages: any[]): void;
    updatePageNumbers(pages: any[]): void;
    isNotTwoColumn(page: any): boolean;
    createColumnsElement(): HTMLDivElement;
}
