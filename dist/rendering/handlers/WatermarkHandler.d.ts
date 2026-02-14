import { Handler } from "pagedjs";
export default class WatermarkHandler extends Handler {
    chunker: any;
    polisher: any;
    caller: any;
    config: any;
    constructor(chunker: any, polisher: any, caller: any, config: any);
    afterPageLayout(pageElement: any, page: any, breakToken: any, chunker: any): void;
}
