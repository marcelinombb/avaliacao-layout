
export interface PreviewQuestao {
    visualizaQuestao: string
}

declare class LayoutProvaBuilder{
  pageHeader(header: string): LayoutProvaBuilder
  pageFooter(footer: string): LayoutProvaBuilder
  fonteTamanho(tamanho: number): LayoutProvaBuilder
  rascunho(quantidade: number): LayoutProvaBuilder
  marcaDaqua(): LayoutProvaBuilder
  folhaDeRosto({ header, content, footer }: {header: string, content: string, footer: string}): LayoutProvaBuilder
  oneColumnLayout(provaModelo: unknown): void
  twoColumnLayout(provaModelo: unknown): void
}

export declare class LayoutProva {
  static builder(elementContainer: Element): LayoutProvaBuilder
}
