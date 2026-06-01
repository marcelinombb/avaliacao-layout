import { AssessmentInput, QuestionInput, AttachmentInput, AssessmentLayoutInput } from '../types/AssessmentInput';

export function fromProvaModelo3(provaModelo3): AssessmentInput {
    const { prova, listaProvaQuestao } = provaModelo3;
    const listaProvaAnexo = prova?.listaProvaAnexo;

    const questions: QuestionInput[] = (listaProvaQuestao || []).map(q => ({
        id: q.questao.codigo,
        order: q.ordem,
        title: q.titulo,
        customOrder: q.ordemPersonalizada,
        value: q.valor,
        type: q.questao.tipoQuestao,
        reference: q.questao.referencia,
        orderAlternative: q.ordemAlternativa,
        visualizaQuestaoRaw: q.questao.visualizaQuestao,
        linhasBranco: q.linhasBranco,
        quebraPagina: q.quebraPagina,
        visualizaResposta: q.questao.visualizaResposta,
        tipoLinha: q.tipoLinha,
        numeroLinhas: q.numeroLinhas,
    }));

    const attachments: AttachmentInput[] = listaProvaAnexo || [];

    const layout: AssessmentLayoutInput = { ...(prova?.layout || {}), quebraQuestao: prova?.quebraQuestao };

    return {
        id: prova?.id,
        title: prova?.descricao,
        questions,
        attachments,
        layout,
    };
}
