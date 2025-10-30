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
    replacePlaceholders
}