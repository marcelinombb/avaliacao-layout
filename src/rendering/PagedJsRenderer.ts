import { Previewer, registeredHandlers } from "pagedjs"
import {
  HeaderFooterHandler,
  OrderHandler
} from "./handlers/index";
import ColumnHandler from "./handlers/ColumnHandler";

export class PagedJsRenderer {
  static async render(result, stylesheets = null, pagesContainer) {

    if (!result || pagesContainer === undefined) {
      throw new Error("Parâmetros inválidos para renderização do layout de avaliação.");
    }

    // aplica o HTML
    const contentContainer = document.createElement('div');
    // Regex `>\s+<` remove espaços em branco entre tags para evitar erros de layout de #text do Paged.js
    contentContainer.innerHTML = result.layoutHtml.replace(/>\s+</g, '><');

    // aplica CSS vars
    Object.entries(result.cssVars).forEach(([key, value]) => {
      if (value) document.documentElement.style.setProperty(key, String(value));
    });

    const defaultHandlers = [
      {
        MyHandler: HeaderFooterHandler,
        config: {
          cabecalhoPagina: result.header,
          cabecalhoFolhaDeRosto: result.folhaDeRosto.header,
          footer: result.footer
            ? `<div class="footer-avaliacao">${result.footer}</div>`
            : "",
          footerFolhaDeRosto: result.folhaDeRosto.footer
            ? `<div class="footer-avaliacao">${result.folhaDeRosto.footer}</div>`
            : "",
        },
      },
      {
        MyHandler: ColumnHandler,
        config: {}
      },
      {
        MyHandler: OrderHandler,
        config: { ordemAlternativa: result.ordemAlternativa, tipoAlternativa: result.tipoAlternativa }
      },
      ...result.handlers
    ];

    // inicializa preview
    let paged = new Previewer();

    // prepara handlers configurados e registra via paged.registerHandlers
    const configuredHandlers = prepareHandlers(defaultHandlers);
    paged.registerHandlers(...configuredHandlers);

    return paged.preview(
      contentContainer,
      stylesheets,
      pagesContainer
    ).then((chunker: any) => {
      chunker.pages.forEach((page: any) => page.removeListeners());
      contentContainer.remove();
      return chunker;
    })
  }
}

function prepareHandlers(handlersWithConfig: any) {
  return handlersWithConfig.map(({ MyHandler, config }: any) => {
    class ConfiguredHandler extends MyHandler {
      constructor(chunker: any, polisher: any, caller: any) {
        super(chunker, polisher, caller, config);
      }
    }

    ConfiguredHandler.__originalHandler = MyHandler;

    const existingIndex = registeredHandlers.findIndex(
      (h: any) => h.__originalHandler === MyHandler
    );

    if (existingIndex !== -1) {
      registeredHandlers.splice(existingIndex, 1);
    }

    return ConfiguredHandler;
  });
}
