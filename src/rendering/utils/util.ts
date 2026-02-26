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

function anoLetivo(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed in JS

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

  const folhaDeRostoPlaceholder = {
    "#DATA#": provaModelo.prova.dataRealizacao,
    "#DIASEMANA#": diaDaSemana(provaModelo.prova.dataRealizacao),
    "#CURSO#": provaModelo.prova.turma?.cursoUnidade.curso.nome,
    "#DISCIPLINA#": provaModelo.prova.turma?.disciplina,
    "#TURMA#": provaModelo.prova.turma?.codigoTurma,
    "#CODIGO_TURMA#": provaModelo.prova.turma?.codigoTurma,
    "#TIPOPROVA#": provaModelo.prova.tipoProva.notaParcial,
    "#PERIODO#": provaModelo.prova.turma?.periodoLetivo.nome ?? "&nbsp;",
    "#MODELO#": " - Modelo " + provaModelo.nome,
    "#PROFESSOR#":
      provaModelo.prova.turma?.listaTurmaDisciplina?.[0]?.nomeProfessor == null &&
        provaModelo.prova.usuario != null
        ? provaModelo.prova.usuario.nome
        : provaModelo.prova.turma?.listaTurmaDisciplina?.[0]?.nomeProfessor,
    "#TURNO#": provaModelo.prova.turma?.cursoUnidade.turno.nome,
    "#DURACAO#": provaModelo.prova.duracao,
    "#TOTALQUEST#": provaModelo.listaProvaQuestao.length,
    "#NUM_QUESTOES#": provaModelo.listaProvaQuestao.length,
    "#PONTOS#": provaModelo.prova.totalPontos,
    "#INSTRUCAO#": provaModelo.prova.instrucaoEspecifica?.texto,
    "#ANO#": anoLetivo(provaModelo.prova.dataRealizacao),
    "#OBSERVACAO#": provaModelo.prova.observacao,
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
    "#ANO#": anoLetivo(provaModelo.prova.dataRealizacao),
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
    "#ANO#": anoLetivo(provaModelo.prova.dataRealizacao),
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