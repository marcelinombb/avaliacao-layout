export class ReferenceService {
    /**
     * Group questions by reference and set metadata
     * @param {Question[]} questions 
     */
    static processReferences(questions) {
        const formatLista = (indices) =>
            indices.map((i) => i + 1).join(", ").replace(/,([^,]*)$/, " e$1");

        const questaoReferencia = questions.reduce((map, question, index) => {
            const ref = question.reference?.codigo;
            if (ref) {
                const existentes = map.get(ref) ?? [];
                map.set(ref, [...existentes, index]);
            }
            return map;
        }, new Map());

        for (const [codigo, indices] of questaoReferencia) {
            const primeira = questions[indices[0]];
            primeira.referenceInfo = formatLista(indices);
            primeira.showReference = true;
        }

        return questions;
    }
}
