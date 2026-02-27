// main.js
import { monacoManager } from './monaco-manager.js';

/**
 * Utilitário para debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const LOREM_IPSUM_TEXT = `
<p style="text-align: justify;"><strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit. Aliquam efficitur velit vitae dui tempor, quis vulputate ipsum congue. Phasellus nec lacinia tortor. Suspendisse potenti. Integer ut magna tincidunt, congue nisl non, interdum dui.</p>
<p style="text-align: justify;">Vestibulum finibus nulla at lectus ultricies commodo. Maecenas a eros in metus malesuada rhoncus vel et felis. Suspendisse sodales tellus sed ante aliquet, et facilisis est lacinia. Nunc ac accumsan erat. Praesent eu quam diam.</p>
`;

const LOREM_IPSUM_ALTERNATIVES = [
    `<p style="text-align: justify;">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>`,
    `<p style="text-align: justify;">In elementum, quam porta lobortis accumsan, mauris leo iaculis diam, rhoncus dignissim diam tellus ut ante.</p>`,
    `<p style="text-align: justify;">Nulla varius egestas vehicula. Morbi sit amet dui pretium, pulvinar turpis aliquet, semper enim.</p>`,
    `<p style="text-align: justify;">Curabitur laoreet iaculis metus, accumsan ultrices augue fermentum nec.</p>`,
    `<p style="text-align: justify;">Aenean et libero in massa ultrices vehicula quis ac sapien.</p>`
];

function generateMockQuestions(count) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
        questions.push({
            ordem: i,
            valor: 1,
            origem: "I",
            tipoLinha: { codigo: 0, nome: "Sem linha" },
            linhasBranco: 0,
            numeroLinhas: 1,
            quebraPagina: false,
            ordemAlternativa: 0,
            titulo: i == 1 ? "lingua portuguesa" : null,
            ordemPersonalizada: i == 1 ? "10" : null,
            questao: {
                codigo: `MOCK-${1000 + i}`,
                dificuldade: "Fácil",
                tipoQuestao: "Múltipla Escolha - Resposta Única",
                visualizaQuestao: JSON.stringify({
                    textoBase: LOREM_IPSUM_TEXT,
                    comando: `<p style="text-align: justify;">Com base no texto acima, a alternativa correta é:</p>`,
                    alternativas: LOREM_IPSUM_ALTERNATIVES,
                    afirmacoes: []
                })
            }
        });
    }
    return questions;
}

const mockProva = {
    prova: {
        totalPontos: 10,
        duracao: "02:00",
        dataRealizacao: "01/01/2026",
        tipoProva: { nome: "SIMULADO" },
        turma: {
            nome: "TURMA A",
            disciplina: "MOCK",
            periodoLetivo: { nome: "1ª ETAPA" },
            cursoUnidade: {
                curso: { nome: "ENSINO MÉDIO" },
                turno: { nome: "Manhã" }
            }
        },
        instituicao: {
            site: "www.example.com",
            logo: ""
        },
        instrucaoEspecifica: {
            texto: `<ul><li><p style="margin-left: 0px !important;">Este caderno de Prova contém 85 (oitenta e cinco) questões com 4 (quatro) alternativas cada, distribuídas da</p><p style="margin-left: 0px !important;">seguinte forma:</p><p style="margin-left: 0px !important;">Língua Portuguesa (12 questões: 01 a 12);</p><p style="margin-left: 0px !important;">Matemática (10 questões: 13 a 22);</p><p style="margin-left: 0px !important;">História (08 questões: 23 a 30);</p><p style="margin-left: 0px !important;">Geografia (08 questões: 31 a 38);</p><p style="margin-left: 0px !important;">Física (08 questões: 39 a 46);</p><p style="margin-left: 0px !important;">Química (08 questões: 47 a 54);</p><p style="margin-left: 0px !important;">Biologia (08 questões: 55 a 62);</p><p style="margin-left: 0px !important;">Educação Física (05 questões: 63 a 67);</p><p style="margin-left: 0px !important;">Filosofia (05 questões: 68 a 72);</p><p style="margin-left: 0px !important;">Sociologia (05 questões: 73 a 77);</p><p style="margin-left: 0px !important;">Línguas Estrangeiras (08 questões: 78 a 85).</p></li><li><p style="margin-left: 0px !important;">Estão contidas neste Caderno de Prova as questões das duas línguas estrangeiras: Espanhola e Inglesa.</p></li><li><p style="margin-left: 0px !important;">Você deverá escolher as questões de Língua Estrangeira, numeradas de 78 a 85, de acordo com sua opção no</p><p style="margin-left: 0px !important;">ato da matrícula.</p></li></ul>`
        }
    },
    nome: "Mock Avaliação"
};

function getLayoutConfigFromForm() {
    monacoManager.syncToTextareas();

    return {
        codigo: parseInt(document.getElementById('layout-codigo').value, 10) || 0,
        nome: document.getElementById('layout-nome').value,
        colunas: parseInt(document.getElementById('layout-colunas').value, 10) || 1,
        tipoFolha: document.getElementById('layout-tipoFolha').value,
        orientacaoFolha: document.getElementById('layout-orientacao').value,
        fonte: document.getElementById('layout-fonte').value,
        fonteTamanho: parseInt(document.getElementById('layout-fonteTamanho').value, 10) || 12,
        cabecalho: document.getElementById('layout-cabecalho').value,
        rodape: document.getElementById('layout-rodape').value,
        folhaRosto: document.getElementById('layout-folhaRosto').value,
        cabecalhoPagina: document.getElementById('layout-cabecalhoPagina').value,
        cabecalhoQuestao: document.getElementById('layout-cabecalhoQuestao').value,
        cabecalhoPrimeiraQuestao: document.getElementById('layout-cabecalhoPrimeiraQuestao').value,
        rascunho: document.getElementById('layout-rascunho').value,
        paginacao: document.getElementById('layout-paginacao').value,
        marcaDagua: document.getElementById('layout-marcaDagua').value,

        origemQuestao: false,
        ordemQuestaoPersonalizada: false,
        rodapeRosto: null,
        ativo: null,
        tamanhosSuportados: "12, 14, 16, 18",
        rodapeUltimaPagina: null,
        espacamentoLinhas: null,
        mapa: null,
        identificado: null,
        totalRegistros: null
    };
}

function renderizarPreview() {
    if (typeof window.AvaliacaoLayout === 'undefined') {
        setTimeout(renderizarPreview, 500);
        return;
    }

    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;

    const layoutConfig = getLayoutConfigFromForm();

    const formSubmitObj = {
        ...mockProva,
        listaProvaQuestao: generateMockQuestions(30)
    };

    formSubmitObj.prova.layout = layoutConfig;
    pagesContainer.classList.toggle("pages_pages_one_page", true);

    try {
        window.AvaliacaoLayout.replacePlaceholders(formSubmitObj);

        const builder = window.AvaliacaoLayout.createLayout()
            .pageHeader(layoutConfig.cabecalhoPagina)
            .fonteTamanho(layoutConfig.fonteTamanho)
            .folhaDeRosto({
                header: layoutConfig.cabecalho,
                content: layoutConfig.folhaRosto,
                footer: `<div class="footer-avaliacao">${layoutConfig.rodapeRosto ?? layoutConfig.rodape}</div>`
            })
            .pageFooter(layoutConfig.rodape)
            .colunas(layoutConfig.colunas)
            .rascunho(0)
            .ordemAlternativa(0)
            .tipoAlternativa(4)
            .paginacao();

        if (layoutConfig.marcaDagua) {
            builder.marcaDaguaInstituicao(layoutConfig.marcaDagua);
        }

        let layoutResult = builder.build(formSubmitObj);
        let layoutHtml = window.AvaliacaoLayout.latexParser(layoutResult.layoutHtml);

        pagesContainer.innerHTML = '';

        window.AvaliacaoLayout.LayoutRenderer.render({ ...layoutResult, layoutHtml }, ["../public/css/layout-avaliacao.css"], pagesContainer)
            .then(() => {
                resizer();
            })
            .catch(err => {
                console.error("Erro na renderização Paged.js:", err);
            });
    } catch (err) {
        console.error("Erro preparando layout builder:", err);
    }
}

const debouncedRender = debounce(renderizarPreview, 500);

function exportarJSON() {
    const layoutConfig = getLayoutConfigFromForm();
    const jsonString = JSON.stringify(layoutConfig, null, 4);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-output.json`;
    a.click();

    URL.revokeObjectURL(url);
}

function resizer() {
    let pages = document.querySelector(".pagedjs_pages");
    let container = document.querySelector(".preview-panel");

    if (pages && container) {
        let scale = (container.clientWidth * 0.95) / pages.offsetWidth;
        if (scale < 1) {
            pages.style.transform = `scale(${scale})`;
            pages.style.transformOrigin = "top center";
        } else {
            pages.style.transform = "none";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btn-render-preview').addEventListener('click', renderizarPreview);
    document.getElementById('btn-export-json').addEventListener('click', exportarJSON);

    window.addEventListener('resize', resizer);

    const inputs = document.querySelectorAll('#layout-form input, #layout-form select');
    inputs.forEach(input => {
        input.addEventListener('input', debouncedRender);
    });

    fetch('../layout-output.json')
        .then(res => res.json())
        .then(data => {
            const setVal = (id, val) => {
                const element = document.getElementById(id);
                if (val !== null && val !== undefined && element) {
                    element.value = val;
                }
            };
            setVal('layout-codigo', data.codigo);
            setVal('layout-nome', data.nome);
            setVal('layout-colunas', data.colunas);
            setVal('layout-tipoFolha', data.tipoFolha);
            setVal('layout-orientacao', data.orientacaoFolha);
            setVal('layout-fonte', data.fonte);
            setVal('layout-fonteTamanho', data.fonteTamanho);
            setVal('layout-cabecalho', data.cabecalho);
            setVal('layout-rodape', data.rodape);
            setVal('layout-folhaRosto', data.folhaRosto);
            setVal('layout-cabecalhoPagina', data.cabecalhoPagina);
            setVal('layout-cabecalhoQuestao', data.cabecalhoQuestao);
            setVal('layout-cabecalhoPrimeiraQuestao', data.cabecalhoPrimeiraQuestao === undefined ? data.cabecalhoQuestao : data.cabecalhoPrimeiraQuestao);
            setVal('layout-rascunho', data.rascunho);
            setVal('layout-paginacao', data.paginacao);
            setVal('layout-marcaDagua', data.marcaDagua);

            monacoManager.init();
            monacoManager.onChange(debouncedRender);

            monacoManager.onReady(() => {
                renderizarPreview();
            });
        })
        .catch(err => {
            console.error("Erro ao carregar layout-output.json:", err);
            monacoManager.init();
            monacoManager.onChange(debouncedRender);
            monacoManager.onReady(() => {
                renderizarPreview();
            });
        });
});
