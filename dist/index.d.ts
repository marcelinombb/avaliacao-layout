import { LayoutAvaliacaoBuilder } from './LayoutAvaliacaoBuilder';
import { LayoutAvaliacao } from './LayoutAvaliacao';
import { PagedJsRenderer } from './rendering/PagedJsRenderer';
import latexParser from './rendering/utils/latexParser';
import { replacePlaceholders, shuffleAndMultiply } from './rendering/utils/util';
declare const createLayout: () => LayoutAvaliacaoBuilder;
export { LayoutAvaliacao, createLayout, PagedJsRenderer as LayoutRenderer, latexParser, replacePlaceholders, shuffleAndMultiply };
