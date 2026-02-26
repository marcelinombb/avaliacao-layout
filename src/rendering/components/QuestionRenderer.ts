import { renderQuestion } from "../Hbs";

export class QuestionRenderer {
    question: any;
    assessmentLayout: any;
    options: any;

    constructor(question: any, assessmentLayout: any, options: any) {
        this.question = question;
        this.assessmentLayout = assessmentLayout;
        this.options = options;
    }

    render() {
        const context: any = {
            question: this.question,
            displayOrder: this.question.order,
            assessmentLayout: this.assessmentLayout,
            options: this.options,
            isMultiplaEscolha: false,
            useRaw: false
        };

        console.log(this.question);

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

