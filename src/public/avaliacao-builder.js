const DONTSPLIT = "dontsplit";

function toRoman(num) {
  if (num < 1 || num > 3999) return "Number out of range";

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";

  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }

  return result;
}

const numberToLetter = (number, lowerCase = false) => {
  const letter = String.fromCharCode(65 + number);
  return lowerCase ? letter.toLowerCase() : letter;
};

function conversorDeIndicesParaAlternativas(indice, tipoColuna) {
  switch (tipoColuna) {
    case 1:
      return String(indice + 1);
    case 2:
      return toRoman(indice + 1) + ".";
    case 3:
      return numberToLetter(indice, true) + ".";
    case 4:
      return numberToLetter(indice) + ".";
    case 5:
      return numberToLetter(indice, true) + ")";
    case 6:
      return numberToLetter(indice) + ")";
    case 7:
      return `(${numberToLetter(indice)})`;
    case 8:
      return `${numberToLetter(indice)} (&nbsp;&nbsp;&nbsp;)`;
    case 9:
      return `<div class="item_enem" style="vertical-align:middle;border-radius:50%;width:18px;height:18px;background:black;color:white;display:table-cell;text-align:center;" >${numberToLetter(
        indice
      )}</div>`;
    case 10:
      return "";
    default:
      return indice;
  }
}

function diaDaSemana(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS

  const mapaSemana = {
    0: 'domingo',
    1: 'segunda-feira',
    2: 'terça-feira',
    3: 'quarta-feira',
    4: 'quinta-feira',
    5: 'sexta-feira',
    6: 'sábado'
  };

  return mapaSemana[date.getDay()];
}

function replacer(string, placeholders) {
  if (!string) return "";

  let replacedString = string;
  for (const placeholder in placeholders) {
    replacedString = replacedString.replace(
      new RegExp(placeholder, "g"),
      placeholders[placeholder] ?? "&nbsp;"
    );
  }

  return replacedString;
}

function replacePlaceholders(provaModelo) {

  const folhaDeRostoPlaceholder = {
    "#DATA#": provaModelo.prova.dataRealizacao,
    "#DIASEMANA#": diaDaSemana(provaModelo.prova.dataRealizacao),
    "#CURSO#": provaModelo.prova.turma?.cursoUnidade.curso.nome,
    "#DISCIPLINA#": provaModelo.prova.turma?.disciplina,
    "#TURMA#": provaModelo.prova.turma?.codigoTurma,
    "#CODIGO_TURMA#": provaModelo.prova.turma?.codigoTurma,
    "#PERIODO#":
      provaModelo.prova.tipoProva.notaParcial +
      " - " +
      (provaModelo.prova.turma?.periodoLetivo.nome ?? "&nbsp;"),
    "#MODELO#": " - Modelo " + provaModelo.nome,
    "#PROFESSOR#":
      provaModelo.prova.turma?.professor.nome == null &&
        provaModelo.prova.usuario != null
        ? provaModelo.prova.usuario.nome
        : provaModelo.prova.turma?.professor.nome,
    "#TURNO#": provaModelo.prova.turma?.cursoUnidade.turno.nome,
    "#DURACAO#": provaModelo.prova.duracao,
    "#TOTALQUEST#": provaModelo.listaProvaQuestao.length,
    "#NUM_QUESTOES#": provaModelo.listaProvaQuestao.length,
    "#PONTOS#": provaModelo.prova.totalPontos,
    "#INSTRUCAO#": provaModelo.prova.instrucaoEspecifica?.texto,
  };

  const cabecalhoPlaceholders = {
    "#LOGO#": provaModelo.prova.instituicao.linkFile,
    "#TIPOPROVA#": provaModelo.prova.tipoProva.notaParcial,
    "#TIPOPROVANOME#": provaModelo.prova.tipoProva.nome,
    "#DISCIPLINA#": provaModelo.prova.turma?.disciplina,
    "#CURSO#": provaModelo.prova.turma?.cursoUnidade.curso.nome,
    "#TURMA#": provaModelo.prova.turma?.codigoTurma,
    "#TURMANOME#": provaModelo.prova.turma?.nome,
    "#NOME_TURMA#": provaModelo.prova.turma?.nome,
    "#TURNO#": provaModelo.prova.turma?.cursoUnidade.turno.nome,
    "#PERIODO#": provaModelo.prova.turma?.periodoLetivo.nome,
    "#TOTALQUEST#": provaModelo.listaProvaQuestao.length,
    "#LAYOUTNOME#": provaModelo.prova.layout.nome,
    "#NOMELAYOUT#": provaModelo.prova.layout.nome,
    "#INSTRUCAO#": provaModelo.prova.instrucaoEspecifica?.texto,
    "#PONTOS#": provaModelo.prova.totalPontos,
    "#DATA#": provaModelo.prova.dataRealizacao,
  };

  const cabecalhoPaginaPlaceholders = {
    "#LOGO#": provaModelo.prova.instituicao.linkFile,
    "#DISCIPLINA#": provaModelo.prova.turma?.disciplina,
    "#CURSO#": provaModelo.prova.turma?.cursoUnidade.curso.nome,
    "#CURSONOME#": provaModelo.prova.turma?.cursoUnidade.curso.nome,
    "#PERIODO#": provaModelo.prova.turma?.periodoLetivo.nome,
    "#PERIODOLET#": provaModelo.prova.turma?.periodoLetivo.nome,
    "#TIPOPROVA#": provaModelo.prova.tipoProva.notaParcial,
    "#TIPOPROVANOME#": provaModelo.prova.tipoProva.nome,
  };

  const footerPlaceholders = {
    "#site#": provaModelo.prova.instituicao.site,
  };

  provaModelo.prova.layout.cabecalho = replacer(
    provaModelo.prova.layout.cabecalho,
    cabecalhoPlaceholders
  );
  provaModelo.prova.layout.folhaRosto = replacer(
    provaModelo.prova.layout.folhaRosto,
    folhaDeRostoPlaceholder
  );
  provaModelo.prova.layout.cabecalhoPagina = replacer(
    provaModelo.prova.layout.cabecalhoPagina,
    cabecalhoPaginaPlaceholders
  );

  provaModelo.prova.layout.rodape = replacer(
    provaModelo.prova.layout.rodape,
    footerPlaceholders
  );

  return provaModelo;
}

function generateAnexosHtml(listaAnexos) {
  if (!listaAnexos || listaAnexos.length === 0) return "";

  const anexosHtml = listaAnexos
    .map((anexo, index) => {
      return `
      <div class="anexo">
        <div class="columnbreak"></div>
        <p style="text-align:center"><strong>ANEXO ${anexo.ordem}</strong></p>
        <p>&nbsp;</p>
        <div>${anexo.anexo.texto}</div>
      </div>
    `;
    })
    .join("");

  return anexosHtml;
}

function generateReferenciaInfo(provaModelo) {
  const { listaProvaQuestao } = provaModelo;
  const questaoReferencia = new Map();

  listaProvaQuestao.forEach((provaQuestao, index) => {
    if (provaQuestao.questao.referencia) {
      const questoes = questaoReferencia.get(provaQuestao.questao.referencia.codigo) ?? [];
      questaoReferencia.set(provaQuestao.questao.referencia.codigo, [
        ...questoes,
        index,
      ]);
    }
  });

  Array.from(questaoReferencia).forEach(([codigo, questoes]) => {
    const primeiraQuestaoDaReferencia = listaProvaQuestao[questoes[0]];
    primeiraQuestaoDaReferencia.infoReferencia = questoes.map((index) => index + 1).join(", ").replace(/,([^,]*)$/, " e$1");
    primeiraQuestaoDaReferencia.mostrarReferencia = true;
  });
}

function generateReferenciaHtml(
  provaQuestao,
  fonteTamanho,
  fonte,
  origemQuestao
) {
  const { referencia } = provaQuestao.questao;

  if (!referencia || !referencia.texto || !provaQuestao.mostrarReferencia) return "";

  const origemQuestaoHtml = origemQuestao
    ? `<span class="fonte-questao-width italic">
          (${referencia.fonte.descricao} - ${referencia.fonte.anoFonte})
        </span>`
    : "";

  return `
    <div style="margin-top: 10px; margin-bottom:15px; font-size:${fonteTamanho}px; font-family: ${fonte};" >
      <div class="referencia-style" style="margin-top: 0px;">
        Para as questões ${provaQuestao.infoReferencia}
      </div>
      <div>
        ${origemQuestaoHtml}
        <span>
          ${referencia.texto}
        </span>
      </div>
    </div>
  `;
}

function generateAvalicaoHtml(provaModelo, opcoes) {

  try {
    replacePlaceholders(provaModelo);
  }
  catch (error) {
    console.error("Erro ao substituir placeholders:", error);
  }

  const {
    cabecalhoPrimeiraQuestao,
    cabecalhoQuestao,
    ordemQuestaoPersonalizada,
    origemQuestao,
    fonte,
  } = provaModelo.prova.layout;

  generateReferenciaInfo(provaModelo);

  const anexos = generateAnexosHtml(provaModelo.prova.listaProvaAnexo);

  const generateQuestaoHTML = (provaQuestao) => {

    function formatCabecalho(provaQuestao) {
      const cabecalhoTemplate =
        provaQuestao.ordem === 1 ? cabecalhoPrimeiraQuestao : cabecalhoQuestao;

      const ordem = ordemQuestaoPersonalizada
        ? provaQuestao.ordemPersonalizada ?? ""
        : provaQuestao.ordem;

      return cabecalhoTemplate
        .replace("#ORDEM#", ordem)
        .replace("#VALOR#", provaQuestao.valor.toString().replace(".", ","));
    };

    const cabecalhoQuestaoComValores = formatCabecalho(provaQuestao);

    const referenciaQuestao = generateReferenciaHtml(
      provaQuestao,
      provaModelo.fonteTamanho,
      fonte,
      origemQuestao
    );

    const tipoLinhaResposta = generateTipoLinhaHtml(provaQuestao);

    const linhasDeEspacamento = "<br>".repeat(provaQuestao.linhasBranco);

    const columnBreak = provaQuestao.quebraPagina
      ? "<div class='columnbreak'></div>"
      : "";

    const dontSplit = provaModelo.prova.quebraQuestao ? "" : DONTSPLIT;

    return `
          <div>
              <div class='questao-completa ${dontSplit}'>
                  ${referenciaQuestao}
                  <div class='cabecalho-questao dontend'>
                      ${cabecalhoQuestaoComValores}
                  </div>
                  ${generateQuestaoContent(
      provaQuestao.questao,
      provaModelo
    )}
              </div>
              ${tipoLinhaResposta}
              ${(opcoes && opcoes.gabarito) ? provaQuestao.questao.visualizaResposta : ''}
              <div>${linhasDeEspacamento}</div>
              ${columnBreak}
          </div>
      `;
  };

  const questoes = provaModelo.listaProvaQuestao
    .map(generateQuestaoHTML)
    .join("");

  //const rascunho = `<div class="rascunho"></div>`.repeat(1);

  return `<div id="duas-colunas">${questoes}</div>` + anexos;
}

function generateQuestaoContent(questao, provaModelo) {
  try {

    const tipoQuestao = questao.tipoQuestao;

    const visualizaQuestaoObj = JSON.parse(questao.visualizaQuestao);

    const afirmacaoes = afirmacoesHtml(visualizaQuestaoObj.afirmacoes, visualizaQuestaoObj.justificarFalsas);

    const assercoes = assercaoRazaoHtml(visualizaQuestaoObj.assercoes);

    const associacoes = associacoesHtml(visualizaQuestaoObj.associacoes);

    const alternativas = alternativasHtml(visualizaQuestaoObj.alternativas, provaModelo.prova.embaralharAlternativas, provaModelo.prova.tipoAlternativa);

    const multiplaEscolha = visualizaQuestaoObj.alternativas && visualizaQuestaoObj.alternativas.length > 0;

    if (tipoQuestao === 'Aberta - Associação') {
      return `
        <div class="adaptive-block-avalicao-visualize">
          ${visualizaQuestaoObj.fonte}
          ${visualizaQuestaoObj.instrucao ?? ''}
          ${visualizaQuestaoObj.textoBase ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${visualizaQuestaoObj.comando ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${associacoes}
        </div>
      `;
    } else if (tipoQuestao === 'Múltipla Escolha - Associação') {
      return `
        <div class="adaptive-block-avalicao-visualize">
          ${visualizaQuestaoObj.fonte}
          ${visualizaQuestaoObj.instrucao ?? ''}
          ${visualizaQuestaoObj.textoBase ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${associacoes}
          <div style="padding-bottom: 12px;"></div>
          ${visualizaQuestaoObj.comando ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${alternativas}
        </div>
      `;
    } else if (tipoQuestao === 'Múltipla Escolha - Alternativas Constantes') {
      return `
        <div class="adaptive-block-avalicao-visualize">
          ${visualizaQuestaoObj.fonte}
          ${visualizaQuestaoObj.instrucao ?? ''}
          ${visualizaQuestaoObj.textoBase ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${multiplaEscolha ? afirmacaoes : ''}
          <div style="padding-bottom: 12px;"></div>
          ${visualizaQuestaoObj.comando ?? ''}
          <div style="padding-bottom: 12px;"></div>
          ${alternativas}
        </div>
      `;
    }
    return `
      <div class="adaptive-block-avalicao-visualize">
        ${visualizaQuestaoObj.fonte}
        ${visualizaQuestaoObj.instrucao ?? ''}
        ${visualizaQuestaoObj.textoBase ?? ''}
        <div style="padding-bottom: 12px;"></div>
        ${visualizaQuestaoObj.comando ?? ''}
        <div style="padding-bottom: 12px;"></div>
        ${!multiplaEscolha ? afirmacaoes : ''}
        ${associacoes}
        ${assercoes}
        ${multiplaEscolha ? afirmacaoes : ''}
        ${alternativas}
      </div>
    `;
  } catch (error) {
    return questao.visualizaQuestao
  }
}

function embaralharAlternativas(alternativas) {
  const copy = [...alternativas]; // create a shallow copy
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]; // swap elements
  }
  return copy;
}

function alternativasHtml(alternativas, embaralhar, tipoAlternativa) {

  if (embaralhar) {
    alternativas = embaralharAlternativas(alternativas);
  }

  const alternativasHtml = alternativas
    .map((alternativa, index) => {
      return `
        <div class="linha-alternativa">
          <span class="media-esq">
            ${conversorDeIndicesParaAlternativas(index, tipoAlternativa)}
          </span>
          <span class="media-corpo"><p>${alternativa}</p></span>
        </div>`;
    })
    .join("");

  return `
    <div class="coluna-sm-12 adaptive-margin-bottom">
      ${alternativasHtml}
    </div>
  `;
}

function associacoesHtml(associacoes) {
  return associacoes ? `<div class="duas-colunas">
						<div>
							${associacoes.coluna1.map(
    (itemColuna) => {
      return `
                      <div class="linha-alternativa">
                        <span class="media-esq">${itemColuna.item}</span>
                        <span class="media-corpo">${itemColuna.descricao}</span>
                      </div>
                    `
    }
  ).join('')
    }
						</div>
						<div>
              ${associacoes.coluna2.map(
      (itemColuna) => {
        return `
                      <div class="linha-alternativa">
                        <span class="media-esq">${itemColuna.item}</span>
                        <span class="media-corpo">${itemColuna.descricao}</span>
                      </div>
                    `
      }
    ).join('')
    }
						</div>
					</div>
          <div style="padding-bottom: 12px;"></div>` : ''
}

function assercaoRazaoHtml(assercoes) {

  return assercoes ? ` <div>${assercoes.assercao1}</div>
                        <br>

                        <p class="centro">PORQUE</p>
                        <br>

                        <div>${assercoes.assercao2}</div>
                      <br>` : ''
}

function afirmacoesHtml(afirmacoes, justificarFalsas) {
  return afirmacoes.map((afirmacao) => {
    return `
      <div class="coluna-sm-12">
      <div class="linha-alternativa">
        <span class="media-esq">${afirmacao.item}</span>
        <span class="media-corpo">${afirmacao.descricao}</span>
      </div>
      ${justificarFalsas
        ? `<table class="class-table">
          <tr><td>&nbsp;</td></tr>
          <tr><td>&nbsp;</td></tr>
          <tr><td>&nbsp;</td></tr>
          </table>`
        : ""
      }
      </div>
    `;
  }).join('');
}

function createQuestoesTempContainer(provaModelo, opcoes = { gabarito: false }) {
  const tempContainer = document.createElement("div");

  tempContainer.setAttribute("id", "questoes-temp-container");

  tempContainer.innerHTML = generateAvalicaoHtml(provaModelo, opcoes);

  tempContainer.querySelectorAll("p").forEach((p) => (p.style.marginLeft = 0));

  tempContainer
    .querySelectorAll("figure")
    .forEach((figure) => figure.classList.add(DONTSPLIT));
  tempContainer
    .querySelectorAll("table")
    .forEach((table) => table.classList.add(DONTSPLIT));

  tempContainer.querySelectorAll(".adaptive-margin-bottom div").forEach((e) => {
    e.classList.add(DONTSPLIT);
  });

  return tempContainer;
}

function createPreviewQuestaoTempContainer(listaQuestao, cabecalho = true) {
  const provaModelo = { prova: { tipoAlternativa: 5 } }
  const tempContainer = document.createElement("div");

  const generateQuestaoHTML = (questao) => {

    return `
           <div class='questao-completa'>
            ${generateReferenciaHtml({ questao, infoReferencia: 'X', mostrarReferencia: true }, 14, 'Arial', '')}
            ${cabecalho ? `<div class='cabecalho-questao dontend'>
                                <div style="background:#A9A9A9;border:0px;padding:1px 1px;margin-bottom: 8px;">
                                  <span style="font-size:12px"><strong>QUESTÃO X</strong> ( valor: XX ponto(s) )</span>
                                </div>
                            </div>` : ''
      }
            ${generateQuestaoContent(questao, provaModelo)}
          </div>
      `;
  };

  tempContainer.innerHTML = listaQuestao.map(generateQuestaoHTML).join("");

  tempContainer.querySelectorAll("p").forEach((p) => (p.style.marginLeft = 0));
  tempContainer
    .querySelectorAll("figure")
    .forEach((figure) => figure.classList.add(DONTSPLIT));
  tempContainer
    .querySelectorAll("table")
    .forEach((table) => table.classList.add(DONTSPLIT));

  return tempContainer;
}

function linhasTabelaNumeradas(numberOfLines, withHeader = true) {
  const header = `
  <tr>
  <td class="side-number-header" colspan="2">Resposta</td>
  </tr>
  `;

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

function linhasTabela(numberOfLines, withHeader = true) {
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

function createAnswerLinhasSemRespostaSemBorda(numberOfLines) {
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

function createAnswerLinhasSemBordaComLinha(numberOfLines) {
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

function createAnswerCalculo(numberOfLines) {
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

function createAnswerBox(numberOfLines) {
  if (!numberOfLines) return "";
  const height = Math.max(30 * numberOfLines, 30);
  return `
    <div class="box">
      <div class="box-header">Resposta</div>
      <div class="box-content" style='height: ${height}px'></div>
    </div>
  `;
}

function createAnswerComCorrecao(numberOfLines) {
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
    (_, index) => `
    <div>
      <span class="table-column" style="width: 5%; border-right: 1px solid black;">${index + 1}</span>
      <span class="table-column" style="width: 80%;border-right: 1px solid black;">&nbsp;</span>
      <span class="table-column" style="width: 5%;border-right: 1px solid black;">&nbsp;</span>
      <span class="table-column" style="width: 5%;border-right: 1px solid black;">&nbsp;</span>
      <span class="table-column" style="width: 5%;">&nbsp;</span>
    </div>
  `
  ).join("");

  return `
    <div class="class-table w100 dontsplit tablelike">
      ${header}
      ${rows}
    </div>
  `;
}

function generateTipoLinhaHtml(provaQuestao) {

  if (provaQuestao.tipoLinha === null) {
    return "";
  }

  let tipoLinhaQuestao = "";
  switch (provaQuestao.tipoLinha.codigo) {
    case 1:
      tipoLinhaQuestao = linhasTabelaNumeradas(provaQuestao.numeroLinhas);
      break;
    case 2:
      tipoLinhaQuestao = linhasTabela(provaQuestao.numeroLinhas);
      break;
    case 3:
      tipoLinhaQuestao = createAnswerComCorrecao(provaQuestao.numeroLinhas);
      break;
    case 4:
      tipoLinhaQuestao = createAnswerBox(provaQuestao.numeroLinhas);
      break;
    case 5:
      tipoLinhaQuestao = linhasTabela(
        provaQuestao.numeroLinhas,
        false
      );
      break;
    case 6:
      tipoLinhaQuestao = createAnswerLinhasSemRespostaSemBorda(provaQuestao.numeroLinhas);
      break;
    case 7:
      tipoLinhaQuestao = createAnswerLinhasSemBordaComLinha(provaQuestao.numeroLinhas);
      break;
    case 8:
      tipoLinhaQuestao = createAnswerCalculo(provaQuestao.numeroLinhas);
      break;
  }

  return tipoLinhaQuestao;
}

export {
  replacePlaceholders,
  generateAvalicaoHtml,
  createQuestoesTempContainer,
  createPreviewQuestaoTempContainer,
};