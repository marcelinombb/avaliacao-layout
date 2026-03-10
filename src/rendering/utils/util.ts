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
  if (!dateStr || typeof dateStr !== "string") return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";

  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "";

  const mapaSemana = {
    0: "domingo",
    1: "segunda-feira",
    2: "terça-feira",
    3: "quarta-feira",
    4: "quinta-feira",
    5: "sexta-feira",
    6: "sábado",
  };

  return mapaSemana[date.getDay()];
}

function anoLetivo(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";

  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "";

  return date.getFullYear();
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
  if (!provaModelo || !provaModelo.prova) {
    return provaModelo;
  }

  const prova = provaModelo.prova;
  const turma = prova.turma;
  const instituicao = prova.instituicao;
  const tipoProva = prova.tipoProva;
  const instrucaoEspecifica = prova.instrucaoEspecifica;
  const layout = prova.layout;
  const dataRealizacao = prova.dataRealizacao ?? "";
  const totalQuestoes = provaModelo.listaProvaQuestao?.length ?? 0;

  const folhaDeRostoPlaceholder = {
    "#DATA#": dataRealizacao || "&nbsp;",
    "#DIASEMANA#": diaDaSemana(dataRealizacao) || "&nbsp;",
    "#CURSO#": turma?.cursoUnidade?.curso?.nome ?? "&nbsp;",
    "#DISCIPLINA#": turma?.disciplina ?? "&nbsp;",
    "#TURMA#": turma?.codigoTurma ?? "&nbsp;",
    "#CODIGO_TURMA#": turma?.codigoTurma ?? "&nbsp;",
    "#TIPOPROVA#": tipoProva?.nome ?? "&nbsp;",
    "#PERIODO#": turma?.periodoLetivo?.nome ?? "&nbsp;",
    "#MODELO#": " - Modelo " + (provaModelo.nome ?? ""),
    "#PROFESSOR#":
      (turma?.listaTurmaDisciplina?.[0]?.nomeProfessor ??
        prova.usuario?.nome) ??
      "&nbsp;",
    "#TURNO#": turma?.cursoUnidade?.turno?.nome ?? "&nbsp;",
    "#DURACAO#": prova.duracao ?? "&nbsp;",
    "#TOTALQUEST#": totalQuestoes,
    "#NUM_QUESTOES#": totalQuestoes,
    "#PONTOS#": prova.totalPontos ?? "&nbsp;",
    "#INSTRUCAO#": instrucaoEspecifica?.texto ?? "&nbsp;",
    "#ANO#": anoLetivo(dataRealizacao) || "&nbsp;",
    "#OBSERVACAO#": prova.observacao ?? "&nbsp;",
  };

  const cabecalhoPlaceholders = {
    "#LOGO#": instituicao?.linkFile ?? "",
    "#TIPOPROVA#": tipoProva?.nome ?? "&nbsp;",
    "#TIPOPROVANOME#": tipoProva?.nome ?? "&nbsp;",
    "#DISCIPLINA#": turma?.disciplina ?? "&nbsp;",
    "#CURSO#": turma?.cursoUnidade?.curso?.nome ?? "&nbsp;",
    "#TURMA#": turma?.codigoTurma ?? "&nbsp;",
    "#TURMANOME#": turma?.nome ?? "&nbsp;",
    "#NOME_TURMA#": turma?.nome ?? "&nbsp;",
    "#TURNO#": turma?.cursoUnidade?.turno?.nome ?? "&nbsp;",
    "#PERIODO#": turma?.periodoLetivo?.nome ?? "&nbsp;",
    "#TOTALQUEST#": totalQuestoes,
    "#LAYOUTNOME#": layout?.nome ?? "&nbsp;",
    "#NOMELAYOUT#": layout?.nome ?? "&nbsp;",
    "#INSTRUCAO#": instrucaoEspecifica?.texto ?? "&nbsp;",
    "#PONTOS#": prova.totalPontos ?? "&nbsp;",
    "#DATA#": dataRealizacao || "&nbsp;",
    "#ANO#": anoLetivo(dataRealizacao) || "&nbsp;",
  };

  const cabecalhoPaginaPlaceholders = {
    "#LOGO#": instituicao?.linkFile ?? "",
    "#DISCIPLINA#": turma?.disciplina ?? "&nbsp;",
    "#CURSO#": turma?.cursoUnidade?.curso?.nome ?? "&nbsp;",
    "#TURMA#": turma?.codigoTurma ?? "&nbsp;",
    "#CURSONOME#": turma?.cursoUnidade?.curso?.nome ?? "&nbsp;",
    "#PERIODO#": turma?.periodoLetivo?.nome ?? "&nbsp;",
    "#PERIODOLET#": turma?.periodoLetivo?.nome ?? "&nbsp;",
    "#TIPOPROVA#": tipoProva?.nome ?? "&nbsp;",
    "#TIPOPROVANOME#": tipoProva?.nome ?? "&nbsp;",
    "#ANO#": anoLetivo(dataRealizacao) || "&nbsp;",
  };

  const footerPlaceholders = {
    "#TURMA#": turma?.codigoTurma ?? "&nbsp;",
    "#site#": instituicao?.site ?? "&nbsp;",
  };

  if (layout) {
    layout.cabecalho = replacer(layout.cabecalho, cabecalhoPlaceholders);
    layout.folhaRosto = replacer(layout.folhaRosto, folhaDeRostoPlaceholder);
    layout.cabecalhoPagina = replacer(
      layout.cabecalhoPagina,
      cabecalhoPaginaPlaceholders
    );
    layout.rodape = replacer(layout.rodape, footerPlaceholders);
  }

  return provaModelo;
}

function shuffleAndMultiply(arr, multiplier) {
  // Shuffle group order
  const chunks = Array(multiplier).fill(arr).map(a => [...a]);
  for (let i = chunks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
  }

  // Flatten
  const multipliedArray = chunks.flat();

  // Shuffle all elements
  for (let i = multipliedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [multipliedArray[i], multipliedArray[j]] = [multipliedArray[j], multipliedArray[i]];
  }

  return multipliedArray;
}

export {
  shuffleAndMultiply,
  replacePlaceholders,
  conversorDeIndicesParaAlternativas
}