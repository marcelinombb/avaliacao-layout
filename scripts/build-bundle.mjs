import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

console.log('[build-bundle] Iniciando geração do bundle de estilos e runner PDF...');

// 1. Localizar preview.css do editor
const editorDistPreview = path.resolve(pkgRoot, '../ngx-exitus-tiptap-editor/dist/ngx-exitus-tiptap-editor/preview.css');
const nodeModulesEditorPreview = path.resolve(pkgRoot, 'node_modules/ngx-exitus-tiptap-editor/preview.css');
let editorCssContent = '';

if (fs.existsSync(editorDistPreview)) {
  console.log(`[build-bundle] Usando preview.css local de ${editorDistPreview}`);
  editorCssContent = fs.readFileSync(editorDistPreview, 'utf8');
} else if (fs.existsSync(nodeModulesEditorPreview)) {
  console.log(`[build-bundle] Usando preview.css de node_modules`);
  editorCssContent = fs.readFileSync(nodeModulesEditorPreview, 'utf8');
} else {
  console.warn('[build-bundle] Aviso: preview.css do editor não encontrado!');
}

// 2. Ler estilos do avaliacao-layout
const questaoCssPath = path.resolve(pkgRoot, 'public/css/exitus-questao-style.css');
const linhasCssPath = path.resolve(pkgRoot, 'public/css/linhas-resposta.css');
const layoutCssPath = path.resolve(pkgRoot, 'public/css/layout-avaliacao.css');
const pagesCssPath = path.resolve(pkgRoot, 'public/css/pages.css');
const printCssPath = path.resolve(pkgRoot, 'public/css/print.css');

const questaoCss = fs.existsSync(questaoCssPath) ? fs.readFileSync(questaoCssPath, 'utf8') : '';
const linhasCss = fs.existsSync(linhasCssPath) ? fs.readFileSync(linhasCssPath, 'utf8') : '';
const layoutCss = fs.existsSync(layoutCssPath) ? fs.readFileSync(layoutCssPath, 'utf8') : '';
const pagesCss = fs.existsSync(pagesCssPath) ? fs.readFileSync(pagesCssPath, 'utf8') : '';
const printCss = fs.existsSync(printCssPath) ? fs.readFileSync(printCssPath, 'utf8') : '';

// 3. Montar CSS unificado
const tableBorderFix = `
/* Correção de bordas para tabelas sem borda */
.exitus-tiptap-editor table[data-no-borders] {
  border-style: none !important;
}
.exitus-tiptap-editor table[data-no-borders] td,
.exitus-tiptap-editor table[data-no-borders] th {
  border-style: none !important;
}
`;

const unifiedCss = [
  '/* === 1. Estilos do Editor de Texto (ngx-exitus-tiptap-editor) === */',
  editorCssContent,
  '/* === 2. Correções de Tabela do Editor === */',
  tableBorderFix,
  '/* === 3. Estilos de Questão e Tipografia === */',
  questaoCss,
  '/* === 4. Estilos de Linhas de Resposta e Quadro Resposta === */',
  linhasCss,
  '/* === 5. Estilos de Layout de Avaliação (Paged.js @page) === */',
  layoutCss,
  '/* === 6. Estilos de Páginas e Preview === */',
  pagesCss,
  '/* === 7. Estilos de Impressão === */',
  printCss
].join('\n\n');

// 4. Gravar dist/avaliacao-layout.css
const distDir = path.resolve(pkgRoot, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.resolve(distDir, 'avaliacao-layout.css'), unifiedCss, 'utf8');
console.log(`[build-bundle] dist/avaliacao-layout.css gerado com sucesso (${Buffer.byteLength(unifiedCss)} bytes)`);

// 5. Atualizar public/css/preview-editor.css para manter compatibilidade com index.html e layout-builder
if (editorCssContent) {
  fs.writeFileSync(path.resolve(pkgRoot, 'public/css/preview-editor.css'), editorCssContent, 'utf8');
  console.log('[build-bundle] public/css/preview-editor.css sincronizado com preview.css do editor');
}

// 6. Copiar assets de marca d'água para dist/assets
const publicMarcadaguaDir = path.resolve(pkgRoot, 'public/assets/marcadagua');
const distMarcadaguaDir = path.resolve(distDir, 'assets/marcadagua');
if (fs.existsSync(publicMarcadaguaDir)) {
  fs.mkdirSync(distMarcadaguaDir, { recursive: true });
  fs.cpSync(publicMarcadaguaDir, distMarcadaguaDir, { recursive: true });
  console.log('[build-bundle] Assets de marca d\'água copiados para dist/assets/marcadagua');
}

// 7. Gerar dist/pdf.html auto-contido
const pdfHtmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação PDF</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css"
        integrity="sha384-WcoG4HRXMzYzfCgiyfrySxx90XSl2rxY5mnVY5TwtWE6KLrArNKn0T/mOgNL0Mmi" crossorigin="anonymous">
    <link rel="stylesheet" href="avaliacao-layout.css">
</head>
<body>
    <div id="pages-container" class="exitus-tiptap-editor"></div>

    <script src="avaliacao-layout.umd.js"></script>
    <script type="module">
        const pagesContainer = document.getElementById('pages-container');

        window.generatePdf = async (provaModelo) => {
            window.__PAGED_READY__ = false;

            AvaliacaoLayout.replacePlaceholders(provaModelo);

            const { cabecalhoPagina, cabecalho, folhaRosto, paginacao, rodape, rodapeRosto, colunas, marcaDagua } = provaModelo.prova.layout;
            const { folhasRascunho, tipoAlternativa, ordemAlternativa } = provaModelo.prova;
            const { rascunho, usuario, numeroCte } = provaModelo;

            let rodapeInfo = "";
            if (rascunho) {
                rodapeInfo = usuario ?? '';
            } else {
                rodapeInfo = numeroCte ?? '';
            }

            const layoutBuilder = new AvaliacaoLayout.LayoutAvaliacaoBuilder()
                .pageHeader(cabecalhoPagina)
                .fonteTamanho(parseInt(provaModelo.fonteTamanho))
                .folhaDeRosto({
                    header: cabecalho,
                    content: folhaRosto,
                    footer: \`<div class="footer-avaliacao">\${rodapeRosto ?? rodape}</div>\`
                })
                .pageFooter(rodape)
                .colunas(colunas)
                .identificacao(rodapeInfo)
                .rascunho(folhasRascunho)
                .paginacao();

            if (tipoAlternativa) {
                layoutBuilder.tipoAlternativa(tipoAlternativa);
            }

            if (ordemAlternativa) {
                layoutBuilder.ordemAlternativa(ordemAlternativa);
            }

            if (rascunho) {
                if (typeof layoutBuilder.marcaDaguaRascunho === 'function') {
                    layoutBuilder.marcaDaguaRascunho("assets/marcadagua/marcadagua_semfundo.png");
                } else if (typeof layoutBuilder.marcaDaquaRascunho === 'function') {
                    layoutBuilder.marcaDaquaRascunho("assets/marcadagua/marcadagua_semfundo.png");
                }
            }

            if (marcaDagua) {
                layoutBuilder.marcaDaguaInstituicao(marcaDagua);
            }

            let layoutResult = layoutBuilder.build(provaModelo);
            const layoutHtml = AvaliacaoLayout.latexParser(layoutResult.layoutHtml);

            await AvaliacaoLayout.LayoutRenderer.render({ ...layoutResult, layoutHtml }, ["avaliacao-layout.css"], pagesContainer);

            window.__PAGED_READY__ = true;
        };
    </script>
</body>
</html>
`;

fs.writeFileSync(path.resolve(distDir, 'pdf.html'), pdfHtmlContent, 'utf8');
fs.writeFileSync(path.resolve(pkgRoot, 'pdf.html'), pdfHtmlContent, 'utf8');
console.log('[build-bundle] dist/pdf.html e pdf.html gerados com sucesso');
console.log('[build-bundle] Concluído com sucesso!');
