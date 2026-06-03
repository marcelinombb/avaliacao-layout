import { LayoutAvaliacaoBuilder, TIPO_ORDENACAO, TIPO_ALTERNATIVA } from './LayoutAvaliacaoBuilder';
import { PagedJsRenderer as LayoutRenderer } from './rendering/PagedJsRenderer';
import latexParser from './rendering/utils/latexParser';
import { replacePlaceholders } from './rendering/utils/util';
const createLayout = () => new LayoutAvaliacaoBuilder();

export {
    createLayout, LayoutAvaliacaoBuilder, replacePlaceholders, latexParser, LayoutRenderer,
    TIPO_ORDENACAO, TIPO_ALTERNATIVA,
}
export type { BuildResult } from './LayoutAvaliacaoBuilder';
export type { AssessmentInput, AssessmentLayoutInput, QuestionInput, AttachmentInput, ReferenceInput } from './types/AssessmentInput';
export { fromProvaModelo } from './adapter/ProvaModeloAdapter';
