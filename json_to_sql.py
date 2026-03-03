import sys
import json

def generate_sql(json_filepath):
    with open(json_filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Map json fields to sql variables, with defaults
    nome = data.get('nome', '')
    cabecalho = data.get('cabecalho', '')
    rodape = data.get('rodape', '')
    folha_rosto = data.get('folhaRosto', '')
    paginacao = data.get('paginacao', '')
    tipo_folha = data.get('tipoFolha', '')
    margem = data.get('margem', 0)
    cabecalho_questao = data.get('cabecalhoQuestao', '')
    orientacao_folha = data.get('orientacaoFolha', '')
    rodape_rosto = data.get('rodapeRosto', '')
    instituicao = data.get('instituicao', 1)
    rascunho = data.get('rascunho', '')
    colunas = data.get('colunas', 1)
    marca_dagua = data.get('marcaDagua', '')
    cabecalho_pagina = data.get('cabecalhoPagina', '')
    fonte = data.get('fonte', '')
    fonte_tamanho = data.get('fonteTamanho', 10)
    origem_questao = data.get('origemQuestao', False)
    cabecalho_primeira_questao = data.get('cabecalhoPrimeiraQuestao', '')
    ordem_questao_personalizada = data.get('ordemQuestaoPersonalizada', False)
    ativo = True
    # Using '' for mapa and tamanhos_suportados and rodape_ultima_pagina if not exists
    mapa = None
    identificado = False
    tamanhos_suportados = data.get('tamanhosSuportados', '')
    rodape_ultima_pagina = data.get('rodapeUltimaPagina', '')
    espacamento_linhas = None

    # Function to format values for SQL
    def format_value(v):
        if isinstance(v, bool):
            return 'true' if v else 'false'
        elif isinstance(v, (int, float)):
            return str(v)
        elif v is None:
            return "NULL"
        else:
            # Escape single quotes and use single quotes around the string
            escaped_str = str(v).replace("'", "''")
            return f"'{escaped_str}'"

    values = [
        format_value(nome),
        format_value(cabecalho),
        format_value(rodape),
        format_value(folha_rosto),
        format_value(paginacao),
        format_value(tipo_folha),
        format_value(margem),
        format_value(cabecalho_questao),
        format_value(orientacao_folha),
        format_value(rodape_rosto),
        format_value(instituicao),
        format_value(rascunho),
        format_value(colunas),
        format_value(marca_dagua),
        format_value(cabecalho_pagina),
        format_value(fonte),
        format_value(fonte_tamanho),
        format_value(origem_questao),
        format_value(cabecalho_primeira_questao),
        format_value(ordem_questao_personalizada),
        format_value(ativo),
        format_value(mapa),
        format_value(identificado),
        format_value(tamanhos_suportados),
        format_value(rodape_ultima_pagina),
        format_value(espacamento_linhas)
    ]

    sql = f"""insert
\tinto
\tpublic.layout
(
\tnome,
\tcabecalho,
\trodape,
\tfolha_rosto,
\tpaginacao,
\ttipo_folha,
\tmargem,
\tcabecalho_questao,
\torientacao_folha,
\trodape_rosto,
\tinstituicao,
\trascunho,
\tcolunas,
\tmarca_dagua,
\tcabecalho_pagina,
\tfonte,
\tfonte_tamanho,
\torigem_questao,
\tcabecalho_primeira_questao,
\tordem_questao_personalizada,
\tativo,
\tmapa,
\tidentificado,
\ttamanhos_suportados,
\trodape_ultima_pagina,
\tespacamento_linhas)
values({', '.join(values)});"""
    print(sql)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python json_to_sql.py <arquivo.json>")
        sys.exit(1)
    generate_sql(sys.argv[1])
