import { renderQuestion, QuestionContext } from "../Hbs";
import { Question } from "../../domain/Question";
import { AssessmentLayout } from "../../domain/Assessment";
import { LayoutOptions } from "../../types/LayoutOptions";

export class QuestionRenderer {
    question: Question;
    assessmentLayout: AssessmentLayout;
    options: LayoutOptions;

    constructor(question: Question, assessmentLayout: AssessmentLayout, options: LayoutOptions) {
        this.question = question;
        this.assessmentLayout = assessmentLayout;
        this.options = options;
    }

    render() {
        const context: QuestionContext = {
            question: this.question,
            displayOrder: this.question.order,
            assessmentLayout: this.assessmentLayout,
            options: this.options,
            isMultiplaEscolha: false,
            useRaw: false
        };

        try {
            const questaoObj = this.question.visualizaQuestaoParsed;
            if (!questaoObj) {
                // If parsing failed or data is missing, use raw content
                context.useRaw = true;
            } else {
                if (questaoObj.alternativas && questaoObj.alternativas.length > 0) {
                    context.isMultiplaEscolha = true;
                }
            }
        } catch (error) {
            context.useRaw = true;
        }

        return renderQuestion(context);
    }
}

