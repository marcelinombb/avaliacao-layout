export class QuadroRespostaRenderer {
  linhasTabelaNumeradas(numberOfLines, withHeader = true) {
    const header = `<tr class='dontsplit'>
                      <td class="side-number-header" colspan="2">Resposta</td>
                    </tr>`;

    let rows = Array.from(
      { length: numberOfLines },
      (_, index) => `
          <tr class='dontsplit'>
            <td class="side-number">${index + 1}</td>
            <td class="side-number-content"></td>
          </tr>
        `
    ).join("");

    return `
      <table class="side-number-table">
        ${withHeader ? header : ""}
        ${rows}
      </table>
  `;
  }

  linhasTabela(numberOfLines, withHeader = true) {
    const header = `
        <tr class='dontsplit'>
        <td class="side-number-header">Resposta</td>
        </tr>
        `;
    return `
            <table class="answer-table">
            ${withHeader ? header : ""}
            ${"<tr class='dontsplit'><td></td></tr>".repeat(numberOfLines)}
            </table>
        `;
  }

  linhasTabelaComCabecalho(numberOfLines, withHeader = true) {
    return this.linhasTabela(numberOfLines, withHeader);
  }

  linhasSemRespostaSemBorda(numberOfLines) {
    if (!numberOfLines) return "";
    const lines = Array.from(
      { length: numberOfLines },
      () => `
    <div class="linha linha-text linha-underline dontsplit">
      &nbsp;
    </div>
  `
    ).join("");

    return `
    <div class="linhas-sem-borda">
      ${lines}
    </div>
  `;
  }

  // Linhas Sem Borda e Com Linha Para Título
  linhasSemBordaComLinha(numberOfLines) {
    if (!numberOfLines) return "";
    const lines = Array.from(
      { length: numberOfLines },
      () => `
    <div class="linha linha-text linha-underline dontsplit">
      &nbsp;
    </div>
  `
    ).join("");

    return `
    <div class="linhas-sem-borda">
      <div class="linha linha-text linha-titulo-underline dontsplit">
        &nbsp;
      </div>
      ${lines}
    </div>
  `;
  }

  linhaComCalculo(numberOfLines) {
    if (!numberOfLines) return "";
    const height = numberOfLines * 30;
    const lines = `
                <div class="dontsplit" style="height: ${height}px; border: 1px solid black;">
                </div>
              `;

    return `
                <div class="quadro-resposta-tabela quadro-resposta-container" >
                <header style="border-top: 1px solid black; border-bottom:1px solid black;" class="dontsplit"><strong class="quadro-resposta-coluna w100">Cálculo</strong></header>
                ${lines}
                </div>
            `;
  }

  quadroDeLinhasEmBranco(numberOfLines) {
    if (!numberOfLines) return "";
    const height = Math.max(30 * numberOfLines, 30);
    return `
                <div class="box">
                <div class="box-header">Resposta</div>
                <div class="box-content" style='height: ${height}px'></div>
                </div>
            `;
  }

quadroDeLinhasComCorrecao(numberOfLines: number): string {
  if (!numberOfLines) return "";

  const header = `
    <tr>
      <th style="width:5%;border:1px solid black;padding:4px; background-color: #a9a9a9;">#</th>
      <th style="width:80%;border:1px solid black;padding:4px; background-color: #a9a9a9;">Resposta</th>
      <th style="width:5%;border:1px solid black;padding:4px; background-color: #a9a9a9;">E</th>
      <th style="width:5%;border:1px solid black;padding:4px; background-color: #a9a9a9;">G</th>
      <th style="width:5%;border:1px solid black;padding:4px; background-color: #a9a9a9;">T</th>
    </tr>
  `;

  const rows = Array.from({ length: numberOfLines }, (_, i) => `
    <tr>
      <td style="border:1px solid black;text-align:center;padding:4px;">${i + 1}</td>
      <td style="border:1px solid black;padding:4px;">&nbsp;</td>
      <td style="border:1px solid black;padding:4px;">&nbsp;</td>
      <td style="border:1px solid black;padding:4px;">&nbsp;</td>
      <td style="border:1px solid black;padding:4px;">&nbsp;</td>
    </tr>
  `).join("");

  return `
    <table 
      style="
        width:100%;
        border-collapse:collapse;
        table-layout:fixed;
        border:1px solid black;
      "
    >
      <thead>
        ${header}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

  static tipoQuadroRespostaHtml(tipoLinha: number, numeroLinhas: number) {

    const quadroResposta = new QuadroRespostaRenderer();

    switch (tipoLinha) {
      case 1:
        return quadroResposta.linhasTabelaNumeradas(numeroLinhas);
      case 2:
        return quadroResposta.linhasTabela(numeroLinhas);
      case 3:
        return quadroResposta.quadroDeLinhasComCorrecao(numeroLinhas);
      case 4:
        return quadroResposta.quadroDeLinhasEmBranco(numeroLinhas);
      case 5:
        return quadroResposta.linhasTabelaComCabecalho(numeroLinhas, false);
      case 6:
        return quadroResposta.linhasSemRespostaSemBorda(numeroLinhas);
      case 7:
        return quadroResposta.linhasSemBordaComLinha(numeroLinhas);
      case 8:
        return quadroResposta.linhaComCalculo(numeroLinhas);
      default:
        return "";
    }
  }
}
