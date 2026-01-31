import { GenerateAssessmentLayout } from "./core/application/use-cases/GenerateAssessmentLayout.js";

export class LayoutAvaliacao {
    constructor(provaModelo, layoutOptions) {
        this.provaModelo = provaModelo;
        this.layoutOptions = layoutOptions;
        this.generateUseCase = new GenerateAssessmentLayout();
    }

    /**
     * @deprecated Use GenerateAssessmentLayout use case directly for clean architecture
     */
    avalicaoHtml() {
        const result = this.generateUseCase.execute(this.provaModelo, this.layoutOptions);
        return result.html;
    }

    // These methods can be kept as dummies or removed if they are only internal
    // If they are public API, they should delegate to presenters, but usually they seem internal to LayoutAvaliacao.
}
