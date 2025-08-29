export const MM_TO_INCH = 25.4;
export const DEFAULT_DPI = 96;
export const DONTSPLIT = "dontsplit";
export const DONTEND = "dontend";
export const DONTFIT = "dontfit";
export const COLUMNBREAK= "columnbreak"
export const ELEMENT_NODE = 1;

export const FOLHA_DE_ROSTO = "folhaDeRosto"
export const RASCUNHO = "rascunho"

export const TEXT_NODE = 3;
export const COMMENT_NODE = 8

const mmToPixels = (mm, dpi = DEFAULT_DPI) => (mm / MM_TO_INCH) * dpi;

export const paddingsTopBottom = mmToPixels(20);
export const CONTENT_HEIGHT = mmToPixels(297) - paddingsTopBottom;