import HandlebarsRuntime from "handlebars/runtime";
const Handlebars = (HandlebarsRuntime as any).default || HandlebarsRuntime;

import { conversorDeIndicesParaAlternativas } from "./utils/util";
import { QuadroRespostaRenderer } from "./components/QuadroRespostaRenderer";

// Import templates
import questionTpl from "./templates/question.hbs";
import headerTpl from "./templates/header.hbs";
import referenceTpl from "./templates/reference.hbs";
import bodyTpl from "./templates/body.hbs";
import alternativesTpl from "./templates/alternatives.hbs";
import statementsTpl from "./templates/statements.hbs";
import associationsTpl from "./templates/associations.hbs";
import assertionsTpl from "./templates/assertions.hbs";
import responseBoxTpl from "./templates/responseBox.hbs";

// Register Partials
Handlebars.registerPartial("reference", referenceTpl);
Handlebars.registerPartial("header", headerTpl);
Handlebars.registerPartial("body", bodyTpl);
Handlebars.registerPartial("alternatives", alternativesTpl);
Handlebars.registerPartial("statements", statementsTpl);
Handlebars.registerPartial("associations", associationsTpl);
Handlebars.registerPartial("assertions", assertionsTpl);
Handlebars.registerPartial("responseBox", responseBoxTpl);

// Register Helpers
Handlebars.registerHelper("repeat", (str, count) => {
    return (str || "").repeat(count || 0);
});

Handlebars.registerHelper("formatHeader", (primeiraQuestaoTpl, questaoTpl, order, displayOrder, value) => {
    const template = order === 1 ? primeiraQuestaoTpl : questaoTpl;
    return (template || "")
        .replace("#ORDEM#", displayOrder)
        .replace("#VALOR#", String(value || 0).replace(".", ","));
});

Handlebars.registerHelper("renderResponseBox", (tipoLinhaCodigo, numeroLinhas) => {
    return new Handlebars.SafeString(QuadroRespostaRenderer.tipoQuadroRespostaHtml(tipoLinhaCodigo, numeroLinhas));
});

Handlebars.registerHelper("formatAlternativeIndex", (index, tipoAlternativa) => {
    return conversorDeIndicesParaAlternativas(index, tipoAlternativa);
});

Handlebars.registerHelper("switch", function (this: any, value, options) {
    if (!options.data) {
        options.data = {};
    }
    options.data._switch_value_ = value;
    options.data._switch_break_ = false;
    return options.fn(this);
});

Handlebars.registerHelper("case", function (this: any, value, options) {
    if (options.data && options.data._switch_value_ == value && !options.data._switch_break_) {
        options.data._switch_break_ = true;
        return options.fn(this);
    }
});

Handlebars.registerHelper("default", function (this: any, options) {
    if (options.data && !options.data._switch_break_) {
        return options.fn(this);
    }
});

export const renderQuestion = (context: any) => {
    return (questionTpl as any)(context, {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    });
};
