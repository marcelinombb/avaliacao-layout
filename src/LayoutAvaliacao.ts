import { Assessment } from "./domain/Assessment";
import { ReferenceService } from "./domain/ReferenceService";
import { AssessmentHtmlRenderer } from "./rendering/AssessmentHtmlRenderer";
import { LayoutOptions } from "./types/LayoutOptions";

export class LayoutAvaliacao {
    assessment: Assessment;
    layoutOptions: LayoutOptions;

    constructor(assessment: Assessment, layoutOptions: LayoutOptions) {
        this.assessment = assessment;
        this.layoutOptions = layoutOptions;
    }

    avalicaoHtml(): string {
        // 1. Domain Logic: Process References
        ReferenceService.processReferences(this.assessment.questions);

        // 2. Prepare for Presentation
        const renderer = new AssessmentHtmlRenderer(this.assessment, this.layoutOptions);

        // 3. Return formatted data
        return renderer.render();
    }
}
