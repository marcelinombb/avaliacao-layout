import { Previewer, registeredHandlers } from "pagedjs"
import {
  WatermarkHandler,
  HeaderFooterHandler,
  PreventEmptyPageHandler,
  OrderHandler
} from "./handlers/index";
import ColumnHandler from "./handlers/ColumnHandler";
import internalCss from "./layout-avaliacao.css";

export class PagedJsRenderer {
  static async render(result, stylesheets = null, pagesContainer) {

    if (!result || pagesContainer === undefined) {
      throw new Error("Parâmetros inválidos para renderização do layout de avaliação.");
    }

    // aplica o HTML
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = result.layoutHtml;

    // aplica CSS vars
    Object.entries(result.cssVars).forEach(([key, value]) => {
      if (value) document.documentElement.style.setProperty(key, String(value));
    });

    const defaultHandlers = [
      {
        MyHandler: PreventEmptyPageHandler,
        config: {},
      },
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

    // injetar o CSS interno na renderização
    const blob = new Blob([internalCss], { type: 'text/css' });
    const internalCssUrl = URL.createObjectURL(blob);

    let finalStylesheets = stylesheets ? [...stylesheets] : [];
    // Opcional: remover a referência ao layout-avaliacao.css antigo caso o usuário passe
    finalStylesheets = finalStylesheets.filter(s => typeof s !== 'string' || !s.includes('layout-avaliacao.css'));
    finalStylesheets.push(internalCssUrl);

    return paged.preview(
      contentContainer,
      finalStylesheets,
      pagesContainer
    ).then(chunker => {
      chunker.pages.forEach(page => page.removeListeners());
      contentContainer.remove();
      URL.revokeObjectURL(internalCssUrl); // liberar a memória da GPU do navegador
      return chunker;
    })
  }
}

function prepareHandlers(handlersWithConfig) {
  return handlersWithConfig.map(({ MyHandler, config }) => {
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

    return ConfiguredHandler;
  });
}
