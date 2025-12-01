export class QuadroResposta {
  linhasTabelaNumeradas(numberOfLines, withHeader = true) {
    const header = `<tr>
                      <td class="side-number-header" colspan="2">Resposta</td>
                    </tr>`;

            let rows = Array.from(
              { length: numberOfLines },
              (_, index) => `
          <tr>
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
        <tr>
        <td class="side-number-header">Resposta</td>
        </tr>
        `;
    return `
            <table class="answer-table">
            ${withHeader ? header : ""}
            ${"<tr><td></td></tr>".repeat(numberOfLines)}
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
    <div class="linha linha-text linha-underline">
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
    <div class="linha linha-text linha-underline">
      &nbsp;
    </div>
  `
    ).join("");

    return `
    <div class="linhas-sem-borda">
      <div class="linha linha-text linha-titulo-underline">
        &nbsp;
      </div>
      ${lines}
    </div>
  `;
  }

  linhaComCalculo(numberOfLines) {
    if (!numberOfLines) return "";
    const lines = Array.from(
      { length: numberOfLines },
      () => `
                <div class="linha-quadro">
                <td>&nbsp;</td>
                </div>
            `
    ).join("");

    return `
                <div class="class-table table-quadro" >
                <header style="border-top: 1px solid black; border-bottom:1px solid black;"><strong class="table-column w100">Cálculo</strong></header>
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

  quadroDeLinhasComCorrecao(numberOfLines) {
    if (!numberOfLines) return "";

    const header = `
                <header>
                <strong class="table-column" style="width:85%;border-right: 1px solid black;">Resposta</strong>
                <strong class="table-column" style="width:5%;border-right: 1px solid black;">E</strong>
                <strong class="table-column" style="width:5%;border-right: 1px solid black;">G</strong>
                <strong class="table-column" style="width:5%">T</strong>
                </header>
            `;

    const rows = Array.from(
      { length: numberOfLines },
      (_, index) => `<div>
            <span class="table-column" style="width: 5%; border-right: 1px solid black;">${
              index + 1
            }</span>
            <span class="table-column" style="width: 80%;border-right: 1px solid black;">&nbsp;</span>
            <span class="table-column" style="width: 5%;border-right: 1px solid black;">&nbsp;</span>
            <span class="table-column" style="width: 5%;border-right: 1px solid black;">&nbsp;</span>
            <span class="table-column" style="width: 5%;">&nbsp;</span>
            </div>`
    ).join("");

    return `
                <div class="class-table w100 dontsplit tablelike">
                ${header}
                ${rows}
                </div>
            `;
  }

  static tipoQuadroRespostaHtml(provaQuestao) {
    if (!provaQuestao.tipoLinha.codigo) return "";


    const quadroResposta = new QuadroResposta();

    switch (provaQuestao.tipoLinha.codigo) {
      case 1:
        return quadroResposta.linhasTabelaNumeradas(provaQuestao.numeroLinhas);
      case 2:
        return quadroResposta.linhasTabela(provaQuestao.numeroLinhas);
      case 3:
        return quadroResposta.quadroDeLinhasComCorrecao(provaQuestao.numeroLinhas);
      case 4:
        return quadroResposta.quadroDeLinhasEmBranco(provaQuestao.numeroLinhas);
      case 5:
        return quadroResposta.linhasTabelaComCabecalho(provaQuestao.numeroLinhas, false);
      case 6:
        return quadroResposta.linhasSemRespostaSemBorda(provaQuestao.numeroLinhas);
      case 7:
        return quadroResposta.linhasSemBordaComLinha(provaQuestao.numeroLinhas);
      case 8:
        return quadroResposta.linhaComCalculo(provaQuestao.numeroLinhas);
      default:
        return "";
    }
  }
}
