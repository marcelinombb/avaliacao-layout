import { Previewer, registeredHandlers } from "pagedjs"

export class LayoutRenderer {
  static async render(result, stylesheets = null, pagesContainer) {

    if(!result || pagesContainer === undefined) {
      throw new Error("Parâmetros inválidos para renderização do layout de avaliação.");
    }

    // aplica o HTML
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = result.layoutHtml;
    //contentContainer.style.visibility = "hidden";
    //document.body.appendChild(contentContainer);

    // aplica CSS vars
    Object.entries(result.cssVars).forEach(([key, value]) => {
      if (value) document.documentElement.style.setProperty(key, value);
    });

    // registra handlers
    result.handlers.forEach((handler) => registerHandlersWithConfig(handler));

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

    const alreadyRegistered = registeredHandlers.some(
      (h) => h.__originalHandler === MyHandler
    );

    if (!alreadyRegistered) {
      registeredHandlers.push(ConfiguredHandler);
    }
  });
}
