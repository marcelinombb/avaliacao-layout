# Refatoração para Arquitetura Limpa (Clean Architecture)

Este documento descreve o processo de refatoração do projeto `avaliacao-layout` para seguir os princípios da Arquitetura Limpa e Ports & Adapters.

## 🎯 Objetivos da Refatoração
1.  **Separação de Preocupações**: Isolar a lógica de negócio da geração de HTML.
2.  **Desacoplamento**: Facilitar a troca de tecnologias (ex: trocar PagedJS ou gerar outros formatos).
3.  **Testabilidade**: Permitir testes unitários em regras de domínio sem dependências de infraestrutura.
4.  **Manutenibilidade**: Organizar o código em camadas lógicas menores e mais específicas.

---

## 🏗️ Nova Estrutura de Camadas

A nova estrutura segue uma hierarquia de dependência de fora para dentro:

```text
src/
├── core/                   # Camada de Domínio e Aplicação (O "Cérebro")
│   ├── domain/             # Regras de Negócio puras (Entidades e Serviços)
│   └── application/        # Casos de Uso (Orquestração das regras)
├── adapters/               # Camada de Interface (Conversores de dados)
│   ├── presenters/         # Transformação de Entidades em HTML/UI
│   └── handlers/           # Integrações específicas (PagedJS)
└── infrastructure/         # Detalhes de Implementação (Ferramentas externas)
    ├── rendering/          # Ponto de entrada de renderização
    ├── parsers/            # Parsers de LaTeX e outros formatos
    └── utils/              # Funções utilitárias globais
```

---

## 🛠️ Passo a Passo da Refatoração

### 1. Definição das Entidades de Domínio (`core/domain`)
Extraímos as propriedades fundamentais de uma prova e de uma questão.
-   **`Assessment.js`**: Representa o objeto prova de forma pura.
-   **`Question.js`**: Representa uma questão com sua lógica de ordens, valores e conteúdos.
-   **`ReferenceService.js`**: Movida a lógica de agrupamento de referências ("Para as questões 1, 2 e 3...") para este serviço de domínio.

### 2. Implementação do Caso de Uso (`core/application`)
-   Criado o `GenerateAssessmentLayout.js`.
-   Este arquivo é o único que conhece o fluxo completo: mapear dados brutos → processar regras de domínio → chamar o apresentador (Presenter).

### 3. Camada de Apresentação (`adapters/presenters`)
Retiramos toda a lógica de construção de strings HTML da classe principal.
-   **`HtmlQuestionPresenter.js`**: Responsável por converter uma `Question` (Entidade) em HTML.
-   **`HtmlAssessmentPresenter.js`**: Orquestra a montagem da página completa (Header, Questoes, Anexos).
-   **`QuadroRespostaPresenter.js`**: Lógica de geração de quadros de resposta (isolada e reutilizável).

### 4. Integração de Infraestrutura (`infrastructure`)
-   O `LayoutRenderer.js` agora foca apenas em configurar o **PagedJS** e aplicar as variáveis CSS.
-   Utilitários como `latexParser.js` e `util.js` foram movidos para subpastas específicas.

### 5. Compatibilidade e Fachada (Facade)
-   Refatoramos a classe `LayoutAvaliacao.js` original para atuar apenas como uma **Fachada**. Ela agora delega todo o trabalho para o Caso de Uso, mantendo a API pública inalterada para não quebrar usuários existentes da biblioteca.

---

## 🚀 Como usar a nova estrutura

Para adicionar uma nova funcionalidade de negócio:
1.  Adicione ou altere no `core/domain`.

Para mudar como a questão é exibida no PDF:
1.  Altere o template em `adapters/presenters/HtmlQuestionPresenter.js`.

Para adicionar um novo formato de saída (ex: JSON ou Markdown):
1.  Crie um novo Presenter em `adapters/presenters` e chame-o no Caso de Uso.

---

## ⚡ Comandos Úteis
-   `npm run build`: Compila o projeto utilizando o Rollup e gera as versões ESM, CJS e UMD na pasta `dist/`.
