export class Question {
    constructor({
        id,
        order,
        customOrder,
        value,
        type,
        content,
        reference,
        alternatives = [],
        afirmacoes = [],
        associacoes = null,
        assercoes = null,
        visualizaQuestaoRaw = null,
        orderAlternative = 0
    }) {
        this.id = id;
        this.order = order;
        this.customOrder = customOrder;
        this.value = value;
        this.type = type;
        this.content = content; // Can be instructions, textBase, comando
        this.reference = reference;
        this.alternatives = alternatives;
        this.afirmacoes = afirmacoes;
        this.associacoes = associacoes;
        this.assercoes = assercoes;
        this.visualizaQuestaoRaw = visualizaQuestaoRaw;
        this.orderAlternative = orderAlternative;

        // Fields for UI logic handled during processing
        this.referenceInfo = null;
        this.showReference = false;
    }

    get displayOrder() {
        return this.customOrder ?? this.order;
    }
}
