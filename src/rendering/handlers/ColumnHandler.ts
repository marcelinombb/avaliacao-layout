import { Handler } from "pagedjs";
// @ts-ignore
import Layout from "../../../node_modules/pagedjs/src/chunker/layout.js";


/**
 * Handler to enforce multi-column layout on specific pages using Paged.js internal layout engine.
 */
class ColumnHandler extends Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);

        // Inject global styles to prevent forced breaks inside columns
        // This ensures that the first element doesn't immediately break out of the first column
        const style = document.createElement('style');
        style.id = 'pagedjs-column-styles';
        style.innerHTML = `
            .pagedjs_column > * { 
                break-before: auto !important; 
                page-break-before: auto !important;
                break-inside: auto !important;
            }
            .pagedjs_column_1 {
                padding-right: 10px;
                border-right: solid 1px rgb(66, 65, 65);
            }
            .pagedjs_column_2 {
                padding-left: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    /**
     * Hook called before page layout.
     * Checks if the page is a named page that requires columnization.
     */
    beforePageLayout(page, contents, breakToken, chunker) {
        const pageElement = page.element;
        const computedStyle = window.getComputedStyle(pageElement);
        const columnCountVal = computedStyle.getPropertyValue("--pagedjs-column-count").trim();
        const columnCount = parseInt(columnCountVal);
    
        // If no column count is defined, return and let Paged.js handle layout normally
        if (isNaN(columnCount) || columnCount < 2) {
            return;
        }

        // Override the page layout method
        page.layout = async (contents, breakToken, prevPage) => {
            page.clear();
            page.startToken = breakToken;
            // Clear existing content in page area
            page.area.innerHTML = '';

            // Create a container for columns
            const columnContainer = document.createElement("div");
            columnContainer.style.display = "flex";
            columnContainer.style.height = "100%";
            columnContainer.style.width = "100%";
            //columnContainer.style.gap = columnGap;
            page.area.appendChild(columnContainer);

            const columnWrappers = [];
            for (let i = 0; i < columnCount; i++) {
                const col = document.createElement("div");
                col.classList.add("pagedjs_column", `pagedjs_column_${i + 1}`);
                col.style.flex = "1";
                col.style.flexBasis = "0"; // Ensure equal distribution
                col.style.minWidth = "0"; // Allow shrinking if needed
                col.style.height = "100%";

                columnContainer.appendChild(col);
                columnWrappers.push(col);
            }

            // Force reflow/layout calc to ensure flex items have dimensions
            columnContainer.getBoundingClientRect();

            // Now sequentially fill columns
            let currentBreakToken = breakToken;

            for (let i = 0; i < columnWrappers.length; i++) {

                // If we ran out of content in previous iteration, stop
                if (!currentBreakToken && i > 0) {
                    break;
                }

                if(currentBreakToken.node.dataset.page !== undefined && currentBreakToken.node.dataset.page !== "duasColunas") {
                    break;
                }

                let wrapper = columnWrappers[i];

                // Use the wrapper itself as the layout scope.
                // This ensures 'this.bounds' in Layout refers to the column dimensions, not the full page.
                let layout = new Layout(wrapper, page.hooks, page.settings);

                let renderResult = await layout.renderTo(wrapper, contents, currentBreakToken);

                currentBreakToken = renderResult.breakToken;
            }

            page.addListeners(contents);
            page.endToken = currentBreakToken;

            return currentBreakToken;
        };
    }
}

export default ColumnHandler;

