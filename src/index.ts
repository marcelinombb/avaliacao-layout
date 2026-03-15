import { LayoutAvaliacaoBuilder } from './LayoutAvaliacaoBuilder';

const createLayout = () => new LayoutAvaliacaoBuilder();

export { createLayout };
export { LayoutAvaliacaoBuilder } from './LayoutAvaliacaoBuilder';
export { PagedJsRenderer as LayoutRenderer } from './rendering/PagedJsRenderer';