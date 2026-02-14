import { Handler } from "pagedjs";

export default class WatermarkHandler extends Handler {
  chunker: any;
  polisher: any;
  caller: any;
  config: any;

  constructor(chunker: any, polisher: any, caller: any, config: any) {
    super(chunker, polisher, caller);
    this.chunker = chunker;
    this.polisher = polisher;
    this.caller = caller;
    this.config = config;
  }

  afterPageLayout(pageElement: any, page: any, breakToken: any, chunker: any) {
    const watermark = document.createElement("div");
    watermark.classList.add("watermark");
    pageElement.querySelector(".pagedjs_area").appendChild(watermark);
  }
}