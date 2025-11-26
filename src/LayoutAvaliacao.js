import { QuadroResposta } from "./QuadroResposta.js";
import { conversorDeIndicesParaAlternativas } from "./util.js"

const DONTSPLIT = "dontsplit";

export class LayoutAvaliacao {
    constructor(provaModelo, layoutOptions) {
        this.provaModelo = provaModelo;
        this.layoutOptions = layoutOptions
    }

    anexosHtml() {
        const listaAnexos = this.provaModelo.prova.listaProvaAnexo;
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

    formataCabecalho(questao) {

        if(!this.provaModelo.prova || !this.provaModelo.prova.layout) return "";

        const {
            cabecalhoPrimeiraQuestao,
            cabecalhoQuestao,
            ordemQuestaoPersonalizada
        } = this.provaModelo.prova.layout;

        const cabecalhoTemplate =
            questao.ordem === 1 ? cabecalhoPrimeiraQuestao : cabecalhoQuestao;

        const ordem = ordemQuestaoPersonalizada
            ? questao.ordemPersonalizada ?? ""
            : questao.ordem;

        return cabecalhoTemplate
            .replace("#ORDEM#", ordem)
            .replace("#VALOR#", questao.valor.toString().replace(".", ","));
    }

    afirmacoesHtml(afirmacoes, justificarFalsas) {
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

    assercaoRazaoHtml(assercoes) {

        return assercoes ? ` <div>${assercoes.assercao1}</div>
                        <br>

                        <p class="centro">PORQUE</p>
                        <br>

                        <div>${assercoes.assercao2}</div>
                      <br>` : ''
    }

    buildAssociacao(coluna) {
        return coluna.map(
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

    associacoesHtml(associacoes) {

        if (associacoes) {

            return `<div class="duas-colunas">
						<div>
							${this.buildAssociacao(associacoes.coluna1)}
						</div>
						<div>
                            ${this.buildAssociacao(associacoes.coluna2)}
						</div>
					</div>
                    <div style="padding-bottom: 12px;"></div>
                    `
        }

        return ""
    }

    alternativasHtml(alternativas, ordemAlternativas = null) {

        const TIPO_ORDENACAO = {
            NAO_EMBARALHAR: 0,
            ALEATORIO: 1,
            ASCENDENTE: 2,
            DESCENDENTE: 3,
        };

        function embaralharAlternativas(alternativas) {
            const copy = [...alternativas];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        }

        const tipoAlternativa = this.provaModelo.prova.tipoAlternativa;

        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = 'position: absolute; visibility: hidden; left: -9999px;';
        document.body.appendChild(tempContainer);

        const alternativasComLargura = alternativas.map((texto, idx) => {
            const div = document.createElement('div');
            div.className = 'linha-alternativa';
            div.innerHTML = `
                <span class="media-esq">${conversorDeIndicesParaAlternativas(idx, tipoAlternativa)}</span>
                <span class="media-corpo"><p>${texto}</p></span>
            `;
            tempContainer.appendChild(div);

            const conteudoAlternativa = div.querySelector('.media-corpo');
            const width = conteudoAlternativa.getBoundingClientRect().width;

            return { texto, indiceOriginal: idx, width, element: div };
        });

        document.body.removeChild(tempContainer);

        let alternativasOrdenadas = alternativasComLargura;

        if (ordemAlternativas !== null) {
            switch (ordemAlternativas) {
                case TIPO_ORDENACAO.ALEATORIO:
                    alternativasOrdenadas = embaralharAlternativas(alternativasComLargura);
                    break;
                case TIPO_ORDENACAO.ASCENDENTE:
                    alternativasOrdenadas = [...alternativasComLargura].sort((a, b) => a.width - b.width);
                    break;
                case TIPO_ORDENACAO.DESCENDENTE:
                    alternativasOrdenadas = [...alternativasComLargura].sort((a, b) => b.width - a.width);
                    break;
                // NAO_EMBARALHAR (0) ou default: mantém ordem original
            }
        }else {
             alternativasOrdenadas = [...alternativasComLargura].sort((a, b) => a.width - b.width);
        }

        const alternativasHtml = alternativasOrdenadas
            .map((item, index) => {
                return `
                <div class="linha-alternativa">
                <span class="media-esq">
                    ${conversorDeIndicesParaAlternativas(index, tipoAlternativa)}
                </span>
                <span class="media-corpo"><p>${item.texto}</p></span>
                </div>`;
            })
            .join("");

        return `
            <div class="coluna-sm-12 adaptive-margin-bottom avaliacao-alternativas">
            ${alternativasHtml}
            </div>
        `;
    }

    generateReferenciaInfo() {
        const { listaProvaQuestao } = this.provaModelo;

        // Função auxiliar para formatar lista: "1, 2 e 3"
        const formatLista = (indices) =>
            indices.map((i) => i + 1).join(", ").replace(/,([^,]*)$/, " e$1");

        // Agrupar questões por referência
        const questaoReferencia = listaProvaQuestao.reduce((map, questao, index) => {
            const ref = questao.questao.referencia?.codigo;
            if (ref) {
                const existentes = map.get(ref) ?? [];
                map.set(ref, [...existentes, index]);
            }
            return map;
        }, new Map());

        // Definir info nas primeiras questões de cada referência
        for (const [codigo, indices] of questaoReferencia) {
            const primeira = listaProvaQuestao[indices[0]];
            primeira.infoReferencia = formatLista(indices);
            primeira.mostrarReferencia = true;
        }
    }

    generateReferenciaHtml(provaQuestao) {

        if(!this.provaModelo.prova || !this.provaModelo.prova.layout) return "";

        const { origemQuestao, fonte } = this.provaModelo.prova.layout;
        const { referencia } = provaQuestao.questao;

        if (!referencia || !referencia.texto || !provaQuestao.mostrarReferencia) return "";

        const origemQuestaoHtml = origemQuestao
            ? `<span class="fonte-questao-width italic">
            (${referencia.fonte.descricao} - ${referencia.fonte.anoFonte})
            </span>`
            : "";

        return `
            <div style="margin-top: 10px; margin-bottom:15px; font-size:${this.layoutOptions.fontSize}px; font-family: ${fonte};" >
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

    layoutQuestaoPorTipoHtml(questao, ordemAlternativas = null) {
        try {

            const tipoQuestao = questao.tipoQuestao;

            const questaoObj = JSON.parse(questao.visualizaQuestao);

            const isMultiplaEscolha = questaoObj.alternativas && questaoObj.alternativas.length > 0;

            switch (tipoQuestao) {
                case 'Aberta - Associação':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte}
                        ${questaoObj.instrucao ?? ''}
                        ${questaoObj.textoBase ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${this.associacoesHtml(questaoObj.associacoes)}
                        </div>
                    `;
                case 'Múltipla Escolha - Associação':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte}
                        ${questaoObj.instrucao ?? ''}
                        ${questaoObj.textoBase ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${this.associacoesHtml(questaoObj.associacoes)}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${this.alternativasHtml(questaoObj.alternativas, ordemAlternativas)}
                        </div>
                    `;
                case 'Múltipla Escolha - Alternativas Constantes':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte}
                        ${questaoObj.instrucao ?? ''}
                        ${questaoObj.textoBase ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${isMultiplaEscolha ? this.afirmacoesHtml(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${this.alternativasHtml(questaoObj.alternativas, ordemAlternativas)}
                        </div>
                    `;
                default:
                    return `
                    <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte}
                        ${questaoObj.instrucao ?? ''}
                        ${questaoObj.textoBase ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando ?? ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${!isMultiplaEscolha ? this.afirmacoesHtml(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        ${this.associacoesHtml(questaoObj.associacoes)}
                        ${this.assercaoRazaoHtml(questaoObj.assercoes)}
                        ${isMultiplaEscolha ? this.afirmacoesHtml(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        ${this.alternativasHtml(questaoObj.alternativas, ordemAlternativas)}
                    </div>
                    `;
            }
        } catch (error) {
            return questao.visualizaQuestao
        }
    }

    questaoCompletaHtml(questao) {

        const linhasDeEspacamento = "<br>".repeat(questao.linhasBranco);

        const columnBreak = questao.quebraPagina ? "<div class='columnbreak'></div>" : "";

        const dontSplit = this.provaModelo.prova.quebraQuestao ? "" : DONTSPLIT;

        return `
          <div class='tiptap'>
              <div class='questao-completa ${dontSplit}'>
                  ${this.generateReferenciaHtml(questao)}
                  <div class='cabecalho-questao dontend'>
                      ${this.formataCabecalho(questao)}
                  </div>
                  ${this.layoutQuestaoPorTipoHtml(questao.questao, questao.ordemAlternativas)}
              </div>
              ${QuadroResposta.tipoQuadroRespostaHtml(questao)}
              ${this.layoutOptions.gabarito ? questao.questao.visualizaResposta : ''}
              <div>${linhasDeEspacamento}</div>
              ${columnBreak}
          </div>
      `;
    }

    questoesHtml() {

        this.generateReferenciaInfo()

        return this.provaModelo.listaProvaQuestao
            .map(questao => this.questaoCompletaHtml(questao))
            .join("")
    }

    avalicaoHtml() {

        const folhaDeRosto = this.layoutOptions.folhaDeRosto ? `<div id="folha-rosto">${this.layoutOptions.folhaDeRosto}</div>` : "";

        const questoesHtml = this.layoutOptions.quantidadeColunas == 2 ? `<div id='duas-colunas'>${this.questoesHtml()}</div>` : this.questoesHtml();

        const anexos = this.anexosHtml();

        const rascunhos = `<div class="rascunho"></div>`.repeat(this.layoutOptions.quantidadeFolhasRascunho);

        const avalicaoHtml = folhaDeRosto + questoesHtml + anexos + rascunhos;

        return avalicaoHtml
     }

}
