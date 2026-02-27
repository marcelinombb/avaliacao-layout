import { Handler } from "pagedjs";
declare class PreventEmptyPageHandler extends Handler {
    onBreakToken(breakToken: any, overflow: any, rendered: any, layout: any): any;
}
export default PreventEmptyPageHandler;
