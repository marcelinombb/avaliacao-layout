// layout-builder.js

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

/**
 * Manager para instâncias do Monaco Editor
 */
class MonacoManager {
    constructor() {
        this.editors = {};
        this.isInitialized = false;
        this.isInitializing = false;
        this.onReadyCallbacks = [];
        this.onChangeCallbacks = [];

        // Controle de colapso de Base64
        this.decorationsMap = {}; // editorId -> base64DecoIds
        this.expandedRangesMap = {}; // editorId -> Set(rangeKey)
    }

    init() {
        if (this.isInitialized || this.isInitializing) return;

        if (typeof require === 'undefined') {
            console.error('Monaco loader (loader.min.js) não foi encontrado no global scope.');
            return;
        }

        this.isInitializing = true;

        try {
            require.config({
                paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
            });

            require(['vs/editor/editor.main'], () => {
                this.createEditors();
                this.isInitialized = true;
                this.isInitializing = false;

                this.onReadyCallbacks.forEach(cb => cb());
                this.onReadyCallbacks = [];
            }, (err) => {
                console.error('Erro ao carregar os módulos do Monaco:', err);
                this.isInitializing = false;
            });
        } catch (e) {
            console.error('Erro crítico na inicialização do MonacoManager:', e);
            this.isInitializing = false;
        }
    }

    onReady(callback) {
        if (this.isInitialized) {
            callback();
        } else {
            this.onReadyCallbacks.push(callback);
        }
    }

    onChange(callback) {
        this.onChangeCallbacks.push(callback);
        if (this.isInitialized) {
            Object.values(this.editors).forEach(editor => {
                editor.onDidChangeModelContent(() => callback());
            });
        }
    }

    createEditors() {
        const editorConfigs = [
            { id: 'layout-cabecalho', container: 'container-cabecalho' },
            { id: 'layout-rodape', container: 'container-rodape' },
            { id: 'layout-folhaRosto', container: 'container-folhaRosto' },
            { id: 'layout-cabecalhoPagina', container: 'container-cabecalhoPagina' },
            { id: 'layout-cabecalhoQuestao', container: 'container-cabecalhoQuestao' },
            { id: 'layout-cabecalhoPrimeiraQuestao', container: 'container-cabecalhoPrimeiraQuestao' },
            { id: 'layout-rascunho', container: 'container-rascunho' },
            { id: 'layout-paginacao', container: 'container-paginacao' }
        ];

        editorConfigs.forEach(config => {
            const container = document.getElementById(config.container);
            const textarea = document.getElementById(config.id);
            if (container && textarea) {
                const editor = monaco.editor.create(container, {
                    value: textarea.value,
                    language: 'html',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                });
                this.editors[config.id] = editor;
                this.decorationsMap[config.id] = [];
                this.expandedRangesMap[config.id] = new Set();

                // Live Preview
                editor.onDidChangeModelContent(() => {
                    this.onChangeCallbacks.forEach(cb => cb());
                    this.updateBase64Decorations(config.id);
                });

                // Expande ao clicar no placeholder
                editor.onMouseDown((e) => {
                    if (e.target.element && e.target.element.classList.contains('base64-placeholder')) {
                        const position = e.target.position;
                        // Encontra qual range foi clicado
                        const currentDecos = editor.getLineDecorations(position.lineNumber);
                        const base64Deco = currentDecos.find(d => d.options.inlineClassName === 'base64-hidden' || d.options.afterContentClassName === 'base64-placeholder');

                        if (base64Deco) {
                            const range = base64Deco.range;
                            const key = `${range.startLineNumber}-${range.startColumn}-${range.endLineNumber}-${range.endColumn}`;
                            this.expandedRangesMap[config.id].add(key);
                            this.updateBase64Decorations(config.id);
                        }
                    }
                });

                // Inicializa decorações
                this.updateBase64Decorations(config.id);
            }
        });

        this.initFullscreenButtons();
    }

    /**
     * Identifica e colapsa strings base64 longas
     */
    /**
     * Identifica e colapsa a tag <img> INTEIRA se contiver base64 longo
     */
    updateBase64Decorations(id) {
        const editor = this.editors[id];
        if (!editor) return;

        const model = editor.getModel();
        const text = model.getValue();

        // Regex para capturar a tag <img> inteira que contém um base64 longo
        // Procura por <img ... src="data:image/...;base64, ... >
        const regex = /<img[\s\S]+?src=["']data:image\/[^;]+;base64,[\s\S]+?["'][\s\S]*?>/g;

        const newDecorations = [];
        const hiddenAreas = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Verifica se a parte do Base64 dentro do match é realmente longa (fail-safe)
            if (match[0].length < 100) continue;

            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + match[0].length);
            const range = new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);
            const rangeKey = `${range.startLineNumber}-${range.startColumn}-${range.endLineNumber}-${range.endColumn}`;

            if (!this.expandedRangesMap[id].has(rangeKey)) {
                // 1. Esconde a tag inteira (CSS cuida das linhas que sobrarem)
                newDecorations.push({
                    range: range,
                    options: {
                        inlineClassName: 'base64-hidden',
                        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                    }
                });

                // 2. Coloca o marcador no início de onde a tag começaria
                newDecorations.push({
                    range: new monaco.Range(startPos.lineNumber, startPos.column, startPos.lineNumber, startPos.column),
                    options: {
                        beforeContentClassName: 'base64-placeholder',
                        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                    }
                });

                // 3. Colapsa fisicamente as linhas para remover a altura
                if (range.endLineNumber > range.startLineNumber) {
                    hiddenAreas.push(new monaco.Range(
                        range.startLineNumber + 1, 1,
                        range.endLineNumber, model.getLineMaxColumn(range.endLineNumber)
                    ));

                    // Se a tag ocupa múltiplas linhas e começa após o início da primeira linha,
                    // o Monaco ainda mostra a primeira linha. O inlineClassName cuida dela.
                }
            }
        }

        this.decorationsMap[id] = editor.deltaDecorations(this.decorationsMap[id], newDecorations);

        if (typeof editor.setHiddenAreas === 'function') {
            editor.setHiddenAreas(hiddenAreas);
        }
    }

    initFullscreenButtons() {
        document.querySelectorAll('.btn-toggle-fullscreen').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                this.toggleFullscreen(targetId);
            };
        });
    }

    toggleFullscreen(id) {
        const wrapper = document.getElementById(`wrapper-${id}`);
        if (!wrapper) return;

        const isFullscreen = wrapper.classList.toggle('fullscreen-wrapper');
        const iconBtn = wrapper.querySelector('.btn-toggle-fullscreen');

        if (isFullscreen) {
            iconBtn.innerHTML = '✕';
            iconBtn.title = 'Fechar';
            document.body.style.overflow = 'hidden';
        } else {
            iconBtn.innerHTML = '⛶';
            iconBtn.title = 'Tela Cheia';
            document.body.style.overflow = '';
        }

        if (this.editors[id]) {
            setTimeout(() => {
                this.editors[id].layout();
                this.editors[id].focus();
            }, 50);
        }
    }

    syncToTextareas() {
        Object.keys(this.editors).forEach(id => {
            const textarea = document.getElementById(id);
            if (textarea) {
                textarea.value = this.editors[id].getValue();
            }
        });
    }

    setValue(id, value) {
        if (this.editors[id]) {
            this.editors[id].setValue(value || '');
            this.updateBase64Decorations(id);
        }
    }
}

const monacoManager = new MonacoManager();

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
    if (typeof AvaliacaoLayout === 'undefined') {
        setTimeout(renderizarPreview, 500);
        return;
    }

    const pagesContainer = document.getElementById('pages-container');
    if (!pagesContainer) return;

    const layoutConfig = getLayoutConfigFromForm();

    const formSubmitObj = {
        ...mockProva,
        listaProvaQuestao: generateMockQuestions(15)
    };

    formSubmitObj.prova.layout = layoutConfig;
    pagesContainer.classList.toggle("pages_pages_one_page", true);

    try {
        AvaliacaoLayout.replacePlaceholders(formSubmitObj);

        const builder = new AvaliacaoLayout.LayoutAvaliacaoBuilder()
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
        let layoutHtml = AvaliacaoLayout.latexParser(layoutResult.layoutHtml);

        pagesContainer.innerHTML = '';

        AvaliacaoLayout.LayoutRenderer.render({ ...layoutResult, layoutHtml }, ["public/css/layout-avaliacao.css"], pagesContainer)
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

    fetch('./layout-output.json')
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
