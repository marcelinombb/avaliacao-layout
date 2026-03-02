import { LayoutAvaliacaoBuilder } from './LayoutAvaliacaoBuilder';
import { PagedJsRenderer as LayoutRenderer } from './rendering/PagedJsRenderer';
import latexParser from './rendering/utils/latexParser';
import { replacePlaceholders } from './rendering/utils/util';
const createLayout = () => new LayoutAvaliacaoBuilder();

export {
    createLayout, LayoutAvaliacaoBuilder, replacePlaceholders, latexParser, LayoutRenderer
}