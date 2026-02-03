import { conversorDeIndicesParaAlternativas } from "../utils/util.js";
import { QuadroRespostaRenderer } from "./QuadroRespostaRenderer.js";

export class QuestionRenderer {
    constructor(question, assessmentLayout, options) {
        this.question = question;
        this.assessmentLayout = assessmentLayout;
        this.options = options;
    }

    render() {
        const dontSplit = this.assessmentLayout.quebraQuestao ? "" : "dontsplit";
        const linesBreak = "<br>".repeat(this.question.linhasBranco || 0);
        const columnBreak = this.question.quebraPagina ? "<div class='quebra-pagina'></div>" : "";

        return `
          <div class='tiptap'>
              <div class='questao-completa ${dontSplit}'>
                  ${this.renderReference()}
                  <div class='cabecalho-questao dontend'>
                      ${this.renderHeader()}
                  </div>
                  ${this.renderBody()}
              </div>
              ${this.renderResponseQuadro()}
              ${this.options.gabarito ? (this.question.visualizaResposta || '') : ''}
              <div>${linesBreak}</div>
              ${columnBreak}
          </div>
        `;
    }

    renderHeader() {
        if (!this.assessmentLayout) return "";

        const {
            cabecalhoPrimeiraQuestao,
            cabecalhoQuestao
        } = this.assessmentLayout;

        const cabecalhoTemplate = this.question.order === 1 ? cabecalhoPrimeiraQuestao : cabecalhoQuestao;

        return (cabecalhoTemplate || "")
            .replace("#ORDEM#", this.question.displayOrder)
            .replace("#VALOR#", String(this.question.value || 0).replace(".", ","));
    }

    renderReference() {
        const { origemQuestao, fonte } = this.assessmentLayout || {};
        const { reference } = this.question;

        if (!reference || !reference.texto || !this.question.showReference) return "";

        const origemQuestaoHtml = origemQuestao
            ? `<span class="fonte-questao-width italic">
            (${reference.fonte.descricao} - ${reference.fonte.anoFonte})
            </span>`
            : "";

        return `
            <div style="margin-top: 10px; margin-bottom:15px; font-size:${this.options.fontSize}px; font-family: ${fonte};" >
                <div class="referencia-style" style="margin-top: 0px;">
                    Para as questões ${this.question.referenceInfo}
                </div>
                <div>
                    ${origemQuestaoHtml}
                    <span>${reference.texto}</span>
                </div>
            </div>
        `;
    }

    renderBody() {
        try {
            const questaoObj = this.question.visualizaQuestaoParsed;
            const isMultiplaEscolha = questaoObj.alternativas && questaoObj.alternativas.length > 0;

            switch (this.question.type) {
                case 'Aberta - Associação':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte || ''}
                        ${questaoObj.instrucao || ''}
                        ${questaoObj.textoBase || ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando || ''}
                        ${this.renderAssociacoes(questaoObj.associacoes)}
                        </div>
                    `;
                case 'Múltipla Escolha - Associação':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte || ''}
                        ${questaoObj.instrucao || ''}
                        ${questaoObj.textoBase || ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${this.renderAssociacoes(questaoObj.associacoes)}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando || ''}
                        ${this.renderAlternativas(questaoObj.alternativas)}
                        </div>
                    `;
                case 'Múltipla Escolha - Alternativas Constantes':
                    return `
                        <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte || ''}
                        ${questaoObj.instrucao || ''}
                        ${questaoObj.textoBase || ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${isMultiplaEscolha ? this.renderAfirmacoes(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando || ''}
                        ${this.renderAlternativas(questaoObj.alternativas)}
                        </div>
                    `;
                default:
                    return `
                    <div class="adaptive-block-avalicao-visualize">
                        ${questaoObj.fonte || ''}
                        ${questaoObj.instrucao || ''}
                        ${questaoObj.textoBase || ''}
                        <div style="padding-bottom: 12px;"></div>
                        ${questaoObj.comando || ''}
                        ${!isMultiplaEscolha ? this.renderAfirmacoes(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        ${this.renderAssociacoes(questaoObj.associacoes)}
                        ${this.renderAssercoes(questaoObj.assercoes)}
                        ${isMultiplaEscolha ? this.renderAfirmacoes(questaoObj.afirmacoes, questaoObj.justificarFalsas) : ''}
                        ${this.renderAlternativas(questaoObj.alternativas)}
                    </div>
                    `;
            }
        } catch (error) {
            return this.question.visualizaQuestaoRaw;
        }
    }

    renderAlternativas(alternativas) {
        if (!alternativas) return "";
        const alternativasHtml = alternativas
            .map((alternativa, index) => {
                return `
                <div class="linha-alternativa">
                <span class="media-esq">
                    ${conversorDeIndicesParaAlternativas(index, this.assessmentLayout?.tipoAlternativa)}
                </span>
                <span class="media-corpo"><p>${alternativa}</p></span>
                </div>`;
            })
            .join("");

        return `
            <div class="coluna-sm-12 adaptive-margin-bottom avaliacao-alternativas" data-ordem-alternativa="${this.question.orderAlternative ?? 0}">
                ${alternativasHtml}
            </div>
        `;
    }

    renderAfirmacoes(afirmacoes, justificarFalsas) {
        if (!afirmacoes) return "";
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

    renderAssociacoes(associacoes) {
        if (!associacoes) return "";
        const buildAssociacao = (coluna) => coluna.map(item => `
            <div class="linha-alternativa">
                <span class="media-esq">${item.item}</span>
                <span class="media-corpo">${item.descricao}</span>
            </div>
        `).join('');

        return `<div class="duas-colunas">
                    <div>${buildAssociacao(associacoes.coluna1)}</div>
                    <div>${buildAssociacao(associacoes.coluna2)}</div>
                </div>
                <div style="padding-bottom: 12px;"></div>`;
    }

    renderAssercoes(assercoes) {
        return assercoes ? ` <div>${assercoes.assercao1}</div>
                        <br><p class="centro">PORQUE</p><br>
                        <div>${assercoes.assercao2}</div>
                        <br>` : '';
    }

    renderResponseQuadro() {
        return QuadroRespostaRenderer.tipoQuadroRespostaHtml(this.question);
    }
}
