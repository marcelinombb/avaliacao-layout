import { Previewer, registeredHandlers } from "pagedjs"
import {
  WatermarkHandler,
  HeaderFooterHandler,
  TwoColumnsHandler,
  OrderHandler
} from "./handlers/index.js";

export class LayoutRenderer {
  static async render(result, stylesheets = null, pagesContainer) {

    if (!result || pagesContainer === undefined) {
      throw new Error("Parâmetros inválidos para renderização do layout de avaliação.");
    }

    // aplica o HTML
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = result.layoutHtml;

    // aplica CSS vars
    Object.entries(result.cssVars).forEach(([key, value]) => {
      if (value) document.documentElement.style.setProperty(key, value);
    });

    const defaultHandlers = [
      {
        MyHandler: WatermarkHandler,
        config: { comMarcaDaguaRascunho: result.comMarcaDaguaRascunho },
      },
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
        MyHandler: TwoColumnsHandler,
        config: {}
      },
      {
        MyHandler: OrderHandler,
        config: { ordemAlternativas: result.ordemAlternativas, tipoAlternativa: result.tipoAlternativas }
      },
      ...result.handlers
    ];

    // registra handlers
    defaultHandlers.forEach((handler) => registerHandlersWithConfig(handler));

    // inicializa preview
    let paged = new Previewer();

    return paged.preview(
      contentContainer,
      stylesheets,
      pagesContainer
    ).then(chunker => {
      chunker.pages.forEach(page => page.removeListeners());
      contentContainer.remove();
      return chunker;
    })
  }
}

function registerHandlersWithConfig(...handlersWithConfig) {
  handlersWithConfig.forEach(({ MyHandler, config }) => {
    class ConfiguredHandler extends MyHandler {
      constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller, config);
      }
    }

    ConfiguredHandler.__originalHandler = MyHandler;

    
    const existingIndex = registeredHandlers.findIndex(
      (h) => h.__originalHandler === MyHandler
    );

    if (existingIndex !== -1) {
      registeredHandlers.splice(existingIndex, 1);
    }

    registeredHandlers.push(ConfiguredHandler);
  });
}
