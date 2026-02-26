# Layout Builder

Este módulo permite a customização avançada da impressão (renderização em PDF via Paged.js) de avaliações, oferecendo a personalização de cabeçalhos, rodapés, paginação e outros elementos HTML através do **Monaco Editor**.

## Instalação do Monaco Editor localmente

O Monaco Editor foi desacoplado do CDN (Content Delivery Network) e instalado localmente.
Ele está definido como dependência via `package.json` presente neste mesmo diretório.

Para instalar as dependências, execute o comando na pasta `layout-builder/`:

```sh
npm install
```

## Estrutura do Módulo

* `index.html`: A página principal do Layout Builder. Incorpora a interface lateral e o Preview em Paged.js.
* `css/main.css`: Estilização dedicada ao sistema de layout builder, substituindo estilos outrora dispostos via CDN/inline.
* `js/monaco-manager.js`: Classe responsável por inicializar o `monaco-editor` no modo AMD (RequireJS via `loader.js`), configurar os editores de texto para múltiplas propriedades (rodapé, folhas de rosto, etc.) e instanciar `MonacoManager`.
* `js/main.js`: Lida com os eventos da UI, mock dos dados inseridos, sincronia do Monaco Editor e integração de renderização via `AvaliacaoLayout.LayoutAvaliacaoBuilder`.

## Como o Monaco Editor é Carregado

No `index.html`, importamos o arquivo base do Monaco Editor (`loader.js`) carregado pelo NPM na pasta **node_modules**:

```html
<script src="node_modules/monaco-editor/min/vs/loader.js"></script>
```

A inicialização e apontamento do pacote (path *'vs'*) ocorre de maneira programática dentro de `monaco-manager.js`:

```javascript
require.config({
    paths: { 'vs': 'node_modules/monaco-editor/min/vs' }
});
```

## Funcionalidades e Modificações no Monaco

O `MonacoManager` implementa modificações visuais na experiência de edição, nomeadamente:

### Base64 Tokens (Imagens embutidas)
Como as imagens em código-fonte HTML frequentemente se revelam como strings gigantes em `base64`, editá-las cruamente pode poluir visualmente a área de texto ou travar a IDE em hardware menos capacitado.
Nós transformamos esses trechos com RegEx em Tokens Customizados: `__BASE64_uuid__` ao abrir ou colar texto.
Eles recebem decorações embutidas e são transformados no placeholder estagnado: `<img src={base64}>`.

### Edição em Tela Cheia (Fullscreen)
O editor pode ser ampliado clicando no ícone do cabeçalho da seção `(⛶)`.
Quando ampliado, a div flutuante sobrepõe todo o layout. As dimensões da div invocam `editor.layout()` do componente Monaco para que a responsividade seja acoplada dinamicamente.
