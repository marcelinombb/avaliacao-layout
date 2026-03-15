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
  static async render(html: string, stylesheets = null, pagesContainer: HTMLElement, customHandlers = []) {

    if (!html || pagesContainer === undefined) {
      throw new Error("Parâmetros inválidos para renderização do layout de avaliação.");
    }

    // aplica o HTML
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = html;

    // Extrai metadados
    const metadataContainer = contentContainer.querySelector('#avaliacao-metadata');
    let cssVars = {};
    let config: any = {};
    let header = "";
    let footer = "";
    let folhaDeRostoHeader = "";
    let folhaDeRostoFooter = "";

    if (metadataContainer) {
      const cssVarsEl = metadataContainer.querySelector('#layout-css-vars');
      if (cssVarsEl) cssVars = JSON.parse(cssVarsEl.textContent || "{}");

      const configEl = metadataContainer.querySelector('#layout-config');
      if (configEl) config = JSON.parse(configEl.textContent || "{}");

      header = metadataContainer.querySelector('#layout-header')?.innerHTML || "";
      footer = metadataContainer.querySelector('#layout-footer')?.innerHTML || "";
      folhaDeRostoHeader = metadataContainer.querySelector('#layout-folha-rosto-header')?.innerHTML || "";
      folhaDeRostoFooter = metadataContainer.querySelector('#layout-folha-rosto-footer')?.innerHTML || "";

      // Remove os metadados do container visual
      metadataContainer.remove();
    }

    // aplica CSS vars
    Object.entries(cssVars).forEach(([key, value]) => {
      if (value) document.documentElement.style.setProperty(key, String(value));
    });

    const defaultHandlers = [
      {
        MyHandler: PreventEmptyPageHandler,
        config: {},
      },
      {
        MyHandler: WatermarkHandler,
        config: { comMarcaDaguaRascunho: config.comMarcaDaguaRascunho },
      },
      {
        MyHandler: HeaderFooterHandler,
        config: {
          cabecalhoPagina: header,
          cabecalhoFolhaDeRosto: folhaDeRostoHeader,
          footer: footer
            ? `<div class="footer-avaliacao">${footer}</div>`
            : "",
          footerFolhaDeRosto: folhaDeRostoFooter
            ? `<div class="footer-avaliacao">${folhaDeRostoFooter}</div>`
            : "",
        },
      },
      {
        MyHandler: ColumnHandler,
        config: {}
      },
      {
        MyHandler: OrderHandler,
        config: { ordemAlternativa: config.ordemAlternativa, tipoAlternativa: config.tipoAlternativa }
      },
      ...customHandlers
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
