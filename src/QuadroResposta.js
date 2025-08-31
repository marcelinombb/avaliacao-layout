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

  linhasTabelaComCabecalho(numberOfLines) {
    return this.linhasTabela(numberOfLines, true);
  }

  linhasSemRespostaSemBorda(numberOfLines) {
    if (!numberOfLines) return "";
    const lines = Array.from(
      { length: numberOfLines },
      () => `
    <div class="linha linha-text linha-bottom" style="padding-top: 5px;">
      <td>&nbsp;</td>
    </div>
  `
    ).join("");

    return `
    <div class="class-table">
      ${lines}
    </div>
  `;
  }

  // melhorar nome
  linhasSemBordaComLinha(numberOfLines) {
    if (!numberOfLines) return "";
    const lines = Array.from(
      { length: numberOfLines },
      () => `
    <div class="linha linha-text linha-bottom" style="padding-top: 5px;">
      <td>&nbsp;</td>
    </div>
  `
    ).join("");

    return `
    <div class="class-table">
      <div class="linha linha-text linha-title linha-bottom">
        <td>&nbsp;</td>
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
                <div class="class-table table-quadro">
                <header style="border-top: none; border-bottom:1px solid black;"><strong class="table-column w100">Cálculo</strong></header>
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

  static tipoQuadroRespostaHtml(questao) {
    if (questao.tipoLinha === null) return "";

    switch (questao.tipoLinha.codigo) {
      case 1:
        return this.linhasTabelaNumeradas(questao.numeroLinhas);
      case 2:
        return this.linhasTabela(questao.numeroLinhas);
      case 3:
        return this.quadroDeLinhasComCorrecao(questao.numeroLinhas);
      case 4:
        return this.quadroDeLinhasEmBranco(questao.numeroLinhas);
      case 5:
        return this.linhasTabelaComCabecalho(questao.numeroLinhas, false);
      case 6:
        return this.linhasSemRespostaSemBorda(questao.numeroLinhas);
      case 7:
        return this.linhasSemBordaComLinha(questao.numeroLinhas);
      case 8:
        return this.linhaComCalculo(questao.numeroLinhas);
      default:
        return "";
    }
  }
}
