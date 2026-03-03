# Documentação de Refatoração: Flexibilidade de Layout (Paged.js)

Esta documentação detalha a refatoração arquitetural realizada na biblioteca `avaliacao-layout` para suportar agrupamentos dinâmicos de questões, inserção de textos formatados e diferentes designs de colunas por área da prova.

## 1. Motivação

Anteriormente, a biblioteca consumia uma lista linear de questões (`listaProvaQuestao`) e as renderizava em um formato estático (ex: obrigatoriamente usando `div#duas-colunas` abrangendo todo o documento se a prova estivesse configurada para duas colunas).

Os novos requisitos exigiam suporte a:
- Sessões por "Área de Conhecimento", cada uma com seu comportamento (ex: 1 coluna, 2 colunas, forçar quebra de página).
- Inserção de "Textos Informativos" no meio ou antes das questões, para contextualização.
- Continuidade do suporte à numeração e bibliografia através do `ReferenceService`.

## 2. Arquitetura Proposta e Padrões Utilizados

### 2.1. Composite Pattern (Domínio)
O modelo de dados linear foi convertido para uma estrutura em **árvore** (Nodes).
Criou-se a abstração `RenderableNode` que todos os blocos na tela devem assinar. Foram implementadas as classes concretas:
- **`Question`** (`nodeType: 'questao'`): O objeto de questão original, adaptado para ser um Node válido.
- **`SectionNode`** (`nodeType: 'sessao'`): Um contêiner que pode aninhar outros Nodes (questões, textos, ou outras sessões) e reter informações locais de design (`layoutOverride: { colunas: 1|2, quebraPaginaAntes: boolean }`).
- **`TextNode`** (`nodeType: 'texto_informativo'`): Um Node responsável puramente por armazenar marcação HTML pré-formatada. 

A entidade `Assessment` (Prova) evoluiu para ter acesso direto a uma raiz de `nodes` ao invés de um vetor fixo de elementos. O parser `LayoutAvaliacao` foi atualizado para observar a chave `"blocos"` no JSON, permitindo construir a árvore com base na nova estrutura. Para garantir **retrocompatibilidade**, o parser empacota a `"listaProvaQuestao"` original caso a nova chave não esteja ativa.

### 2.2. Strategy / Factory Pattern (Apresentação / Renderer)
Para a classe primordial de rendering (`AssessmentHtmlRenderer`), delegar responsabilidades complexas de UI geraria muita confusão no código.
- Criamos a **`NodeRendererFactory`**, baseada no Strategy Pattern, contendo instâncias adequadas para cada tipo do Node que precisa ser renderizado.
- **`SectionRenderer`**: É capaz de encapsular (renderizando os filhos internamente) todos eles sob wrappers como `<div class="sessao-wrapper">` com sufixos dinâmicos (`uma-coluna` ou `duas-colunas`), viabilizando a renderização mista pelo Paged.js sem quebra de leiaute.
- **`QuestionRenderer`**: Permanece responsável por aplicar o motor antigo baseado em Handlebars (HBS).
- **`TextRenderer`**: Adiciona os invólucros elementares aos textos descritivos.
- O `ReferenceService` precisou ser adaptado para usar travessia recursiva (`extractQuestions`) no mapeamento de agrupamento de referências textuais.

## 3. A Estrutura do Novo JSON Suportado
A nova mecânica busca consumir a matriz `blocos` paralela ou em substituição a `listaProvaQuestao`:

```json
{
  "prova": { ... },
  "blocos": [
    {
      "tipo": "sessao",
      "titulo": "Ciências da Natureza",
      "layoutOverride": {
        "colunas": 1,
        "quebraPaginaAntes": true
      },
      "filhos": [
        {
          "tipo": "texto_informativo",
          "conteudo": "<p>Leia o texto com atenção.</p>"
        },
        {
          "tipo": "questao",
          "questao": { /* estrutura tradicional da questão ... */ }
        }
      ]
    },
    {
      "tipo": "sessao",
      "titulo": "Ciências Humanas",
      "layoutOverride": { "colunas": 2 },
      "filhos": [ ... ]
    }
  ]
}
```

## 4. Pastas e Arquivos Principais

- `src/domain/RenderableNode.ts`, `SectionNode.ts`, `TextNode.ts`: Entidades da Árvore de Dados.
- `src/rendering/components/NodeRendererFactory.ts`: Fábrica do design.
- `src/rendering/components/SectionRenderer.ts`: Gestor de agrupamentos visuais de coluna.
- `src/LayoutAvaliacao.ts`: Local onde a magia de serialização de Payload ocorre.

## 5. Próximos Passos & Manutenção
Sempre que um novo tipo for exigido pela regra de negócios (Ex: um Node de Imagem pura), bastará:
1. Criar a interface de representação (`ImageNode.ts`).
2. Criar a estratégia respectiva de front-end (`ImageRenderer.ts`).
3. Registrar a vinculação em `NodeRendererFactory.ts`.
4. Tratá-lo de acordo no fluxo da fábrica abstrata em `LayoutAvaliacao.ts`.

---

## 6. Guia de Migração de Payload (Antigo para Novo)

### O Problema do Payload Antigo
Antes da refatoração, o JSON gerado carregava as questões de forma estritamente serial dentro da chave `listaProvaQuestao`. Se você precisasse que metade das questões ficassem em uma coluna e a outra metade em duas, ou mesmo intercalar textos informativos, isso não era possível, pois toda a prova seguia a diretriz monolítica do atributo `layout.colunas`.

**Exemplo de Payload Antigo:**
```json
{
  "prova": {
    "codigo": 151,
    "layout": { "colunas": 2, "tipoFolha": "A4" }
  },
  "listaProvaQuestao": [
    { "questao": { "codigo": "1" }, "ordem": 1 },
    { "questao": { "codigo": "2" }, "ordem": 2 },
    { "questao": { "codigo": "3" }, "ordem": 3 }
  ]
}
```

### O Novo Payload (Arquitetura de Blocos)
No novo sistema baseando-se em Composite Pattern, o construtor busca primeiramente pela matriz **`blocos`**. Quando essa matriz está presente, ela automaticamente pretere a antiga propriedade `listaProvaQuestao`.

Ao criar um bloco, passamos o atributo `tipo`, permitindo ao Front-End interpretar de que tipo de Node ele deve cuidar e como deve rotear a renderização usando a Strategy Pattern.

#### Passo 1: Construir Blocos do Tipo 'sessao'
Toda questão ou texto precisa estar dentro de uma Sessão para usufruir de layouts de colunas unificados ou cabeçalhos.
Para criar uma sessão:
```json
{
  "tipo": "sessao",
  "titulo": "Nome da Seção Opcional",
  "layoutOverride": {
    "colunas": 1,
    "quebraPaginaAntes": false
  },
  "filhos": []
}
```

#### Passo 2: Alocar Questões em 'filhos'
Ao invés de pertencer à raiz do projeto na chave `listaProvaQuestao`, os velhos objetos de questão são inseridos num array de `filhos` atrelados à sessão com a nova anotação de `"tipo": "questao"`.

```json
{
  "tipo": "sessao",
  "layoutOverride": { "colunas": 2 },
  "filhos": [
    {
      "tipo": "questao",
      "questao": { "codigo": "1" },
      "ordem": 1
    },
    {
      "tipo": "questao",
      "questao": { "codigo": "2" },
      "ordem": 2
    }
  ]
}
```

#### Passo 3: Injetar Nodos Textuais (Opicional)
Se houver a necessidade de injetar material de leitura e imagens antes de perguntas, use o nó `texto_informativo` lado-a-lado com as questões dentro da matriz de `filhos`.

```json
{
  "tipo": "texto_informativo",
  "conteudo": "<p>Observe atentamente ao mapa abaixo e responda às questões 1 e 2.</p>"
}
```

### Payload Final Migrado
Ao compilar essas estratégias, o JSON original converte-se no fluxo abaixo que o sistema recém-modificado irá ler, fracionar em entidades locais de Domínio (`SectionNode` / `QuestionNode`) e empacotar corretamente antes de enviar o markup do Paged.js.

**O Resultado Sugerido:**
```json
{
  "prova": {
    "codigo": 151,
    "layout": { "colunas": 2 }
  },
  "blocos": [
    {
      "tipo": "sessao",
      "titulo": "Matemática",
      "layoutOverride": { "colunas": 1, "quebraPaginaAntes": false },
      "filhos": [
        {
          "tipo": "texto_informativo",
          "conteudo": "<p>Instruções específicas de matemática.</p>"
        },
        {
          "tipo": "questao",
          "questao": { "codigo": "1" },
          "ordem": 1
        }
      ]
    },
    {
      "tipo": "sessao",
      "titulo": "História",
      "layoutOverride": { "colunas": 2, "quebraPaginaAntes": true },
      "filhos": [
        {
          "tipo": "questao",
          "questao": { "codigo": "2" },
          "ordem": 2
        },
        {
          "tipo": "questao",
          "questao": { "codigo": "3" },
          "ordem": 3
        }
      ]
    }
  ]
}
```
