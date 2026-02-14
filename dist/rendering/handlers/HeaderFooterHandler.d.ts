import { Handler } from "pagedjs";
export default class HeaderFooterHandler extends Handler {
    chunker: any;
    polisher: any;
    caller: any;
    config: any;
    originalWidth: number;
    originalHeight: number;
    private heightCache;
    constructor(chunker: any, polisher: any, caller: any, config: any);
    beforePageLayout(page: any): void;
    createFooterArea(page: any, content: string, cacheKey: string): void;
    createHeaderArea(page: any, content: string, cacheKey: string): void;
    getCachedHeight(key: string, element: any): any;
    calculateRealHeight(element: any): any;
}
