import { Handler } from "pagedjs";
/**
 * Handler to enforce multi-column layout on specific pages using Paged.js internal layout engine.
 */
declare class ColumnHandler extends Handler {
    constructor(chunker: any, polisher: any, caller: any);
    /**
     * Hook called before page layout.
     * Checks if the page is a named page that requires columnization.
     */
    beforePageLayout(page: any, contents: any, breakToken: any, chunker: any): void;
}
export default ColumnHandler;
