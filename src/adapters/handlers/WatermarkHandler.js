import { Handler } from "pagedjs";

export default class WatermarkHandler extends Handler {
    constructor(chunker, polisher, caller, config) {
      super(chunker, polisher, caller);
      this.chunker = chunker;
      this.polisher = polisher;
      this.caller = caller;
      this.config = config;
    }
  
    afterPageLayout(pageElement, page, breakToken, chunker) {
      const watermark = document.createElement("div");
      watermark.classList.add("watermark");
      pageElement.querySelector(".pagedjs_area").appendChild(watermark);
    }
  }