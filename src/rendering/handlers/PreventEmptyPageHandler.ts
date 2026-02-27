import { Handler } from "pagedjs";

class PreventEmptyPageHandler extends Handler {
    onBreakToken(breakToken, overflow, rendered, layout) {
        if (!breakToken?.node || breakToken.node.nodeType !== 1) return;
        const el = breakToken.node;

        const hasVisualContent = el.querySelector('img, svg, table, video, canvas, iframe');
        const isEmpty = el.textContent.trim().length === 0 && !hasVisualContent;

        if (isEmpty && el.offsetHeight === 0) {
            // When Paged.js successfully identifies an overflow and creates a breakToken,
            // we intercept it here. If the element causing the break is genuinely empty and 0 height,
            // we want to cancel the page break. 
            // 
            // We cannot return `null` because `layout.js` calls `breakToken.equals()`.
            // Instead, we override `.equals()` to mathematically return `true`. 
            // `layout.js` interprets `breakToken.equals(prevBreakToken) === true` as an infinite loop 
            // and gracefully aborts the layout for this node, preventing the blank page creation
            // without ever hiding or deleting the user's anchors!
            breakToken.equals = function () { return true; };
            return breakToken;
        }
    }
}

export default PreventEmptyPageHandler;
