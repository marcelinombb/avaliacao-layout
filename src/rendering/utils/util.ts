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

const COLUMN_TYPE_FORMATTERS = {
  1: (i) => String(i + 1),
  2: (i) => toRoman(i + 1) + ".",
  3: (i) => numberToLetter(i, true) + ".",
  4: (i) => numberToLetter(i) + ".",
  5: (i) => numberToLetter(i, true) + ")",
  6: (i) => numberToLetter(i) + ")",
  7: (i) => `(${numberToLetter(i)})`,
  8: (i) => `${numberToLetter(i)} (&nbsp;&nbsp;&nbsp;)`,
  9: (i) => `<div class="item_enem" style="vertical-align:middle;border-radius:50%;width:18px;height:18px;background:black;color:white;display:table-cell;text-align:center;" >${numberToLetter(i)}</div>`,
  10: () => "",
};

function conversorDeIndicesParaAlternativas(indice, tipoColuna) {
  const formatter = COLUMN_TYPE_FORMATTERS[tipoColuna];
  return formatter ? formatter(indice) : indice;
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

function resolveProvaDateFields(prova, provaModelo) {
  const dataRealizacao = prova.dataRealizacao ?? "";
  const totalQuestoes = provaModelo.listaProvaQuestao?.length ?? 0;
  const etapaNome = prova.etapa?.nome ?? "&nbsp;";
  const periodoLetivoNome = prova.turma?.periodoLetivo?.nome ?? "&nbsp;";
  return {
    dataRealizacao,
    totalQuestoes,
    periodoEtapa: periodoLetivoNome + " - " + etapaNome,
  };
}

function resolveProvaDetails(prova) {
  return {
    duracao: prova.duracao ?? "&nbsp;",
    totalPontos: prova.totalPontos ?? "&nbsp;",
    observacao: prova.observacao ?? "&nbsp;",
    nomeUsuario: prova.usuario?.nome,
  };
}

function resolveTurmaBasic(turma) {
  return {
    disciplina: turma?.disciplina ?? "&nbsp;",
    codigoTurma: turma?.codigoTurma ?? "&nbsp;",
    nomeTurma: turma?.nome ?? "&nbsp;",
    nomeProfessorTurma: turma?.listaTurmaDisciplina?.[0]?.nomeProfessor,
  };
}

function resolveTurmaUnidade(turma) {
  return {
    nomeCurso: turma?.cursoUnidade?.curso?.nome ?? "&nbsp;",
    nomeTurno: turma?.cursoUnidade?.turno?.nome ?? "&nbsp;",
  };
}

function resolveInstitution(prova) {
  return {
    logoUrl: prova.instituicao?.linkFile ?? "",
    site: prova.instituicao?.site ?? "&nbsp;",
  };
}

function resolveProvaMetadata(prova, provaModelo) {
  return {
    nomeTipoProva: prova.tipoProva?.nome ?? "&nbsp;",
    instrucaoTexto: prova.instrucaoEspecifica?.texto ?? "&nbsp;",
    nomeLayout: prova.layout?.nome ?? "&nbsp;",
    nomeModelo: provaModelo.nome ?? "",
    layout: prova.layout,
  };
}

function buildProvaContext(provaModelo) {
  const prova = provaModelo.prova;
  const turma = prova.turma;
  const dateFields = resolveProvaDateFields(prova, provaModelo);
  const details = resolveProvaDetails(prova);
  const turmaBasic = resolveTurmaBasic(turma);
  const turmaUnidade = resolveTurmaUnidade(turma);
  const institution = resolveInstitution(prova);
  const metadata = resolveProvaMetadata(prova, provaModelo);
  const professor = (turmaBasic.nomeProfessorTurma ?? details.nomeUsuario) ?? "&nbsp;";
  return {
    ...dateFields, ...details, ...turmaBasic, ...turmaUnidade, ...institution, ...metadata,
    professor,
    ano: String(anoLetivo(dateFields.dataRealizacao) || "&nbsp;"),
    diaSemana: diaDaSemana(dateFields.dataRealizacao) || "&nbsp;",
  };
}

function buildFolhaDeRostoPlaceholders(ctx) {
  return {
    "#DATA#": ctx.dataRealizacao || "&nbsp;",
    "#DIASEMANA#": ctx.diaSemana,
    "#CURSO#": ctx.nomeCurso,
    "#DISCIPLINA#": ctx.disciplina,
    "#TURMA#": ctx.codigoTurma,
    "#CODIGO_TURMA#": ctx.codigoTurma,
    "#TIPOPROVA#": ctx.nomeTipoProva,
    "#PERIODO#": ctx.periodoEtapa,
    "#MODELO#": " - Modelo " + ctx.nomeModelo,
    "#PROFESSOR#": ctx.professor,
    "#TURNO#": ctx.nomeTurno,
    "#DURACAO#": ctx.duracao,
    "#TOTALQUEST#": ctx.totalQuestoes,
    "#NUM_QUESTOES#": ctx.totalQuestoes,
    "#PONTOS#": ctx.totalPontos,
    "#INSTRUCAO#": ctx.instrucaoTexto,
    "#ANO#": ctx.ano,
    "#OBSERVACAO#": ctx.observacao,
  };
}

function buildCabecalhoPlaceholders(ctx) {
  return {
    "#LOGO#": ctx.logoUrl,
    "#TIPOPROVA#": ctx.nomeTipoProva,
    "#TIPOPROVANOME#": ctx.nomeTipoProva,
    "#DISCIPLINA#": ctx.disciplina,
    "#CURSO#": ctx.nomeCurso,
    "#TURMA#": ctx.codigoTurma,
    "#TURMANOME#": ctx.nomeTurma,
    "#NOME_TURMA#": ctx.nomeTurma,
    "#TURNO#": ctx.nomeTurno,
    "#PERIODO#": ctx.periodoEtapa,
    "#TOTALQUEST#": ctx.totalQuestoes,
    "#LAYOUTNOME#": ctx.nomeLayout,
    "#NOMELAYOUT#": ctx.nomeLayout,
    "#INSTRUCAO#": ctx.instrucaoTexto,
    "#PONTOS#": ctx.totalPontos,
    "#DATA#": ctx.dataRealizacao || "&nbsp;",
    "#ANO#": ctx.ano,
  };
}

function buildCabecalhoPaginaPlaceholders(ctx) {
  return {
    "#LOGO#": ctx.logoUrl,
    "#DISCIPLINA#": ctx.disciplina,
    "#CURSO#": ctx.nomeCurso,
    "#TURMA#": ctx.codigoTurma,
    "#CURSONOME#": ctx.nomeCurso,
    "#PERIODO#": ctx.periodoEtapa,
    "#PERIODOLET#": ctx.periodoEtapa,
    "#TIPOPROVA#": ctx.nomeTipoProva,
    "#TIPOPROVANOME#": ctx.nomeTipoProva,
    "#ANO#": ctx.ano,
  };
}

function buildFooterPlaceholders(ctx) {
  return {
    "#TURMA#": ctx.codigoTurma,
    "#site#": ctx.site,
  };
}

function replacePlaceholders(provaModelo) {
  if (!provaModelo || !provaModelo.prova) {
    return provaModelo;
  }

  const ctx = buildProvaContext(provaModelo);
  const { layout } = ctx;

  if (layout) {
    layout.cabecalho = replacer(layout.cabecalho, buildCabecalhoPlaceholders(ctx));
    layout.folhaRosto = replacer(layout.folhaRosto, buildFolhaDeRostoPlaceholders(ctx));
    layout.cabecalhoPagina = replacer(layout.cabecalhoPagina, buildCabecalhoPaginaPlaceholders(ctx));
    layout.rodape = replacer(layout.rodape, buildFooterPlaceholders(ctx));
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
