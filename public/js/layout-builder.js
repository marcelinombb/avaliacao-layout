// layout-builder.js

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

// Gera questões longas para testar quebra de página e colunas.
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


// Retorna um objeto com todos os valores atuais dos inputs do form
function getLayoutConfigFromForm() {
    return {
        codigo: parseInt(document.getElementById('layout-codigo').value, 10),
        nome: document.getElementById('layout-nome').value,
        colunas: parseInt(document.getElementById('layout-colunas').value, 10),
        tipoFolha: document.getElementById('layout-tipoFolha').value,
        orientacaoFolha: document.getElementById('layout-orientacao').value,
        fonte: document.getElementById('layout-fonte').value,
        fonteTamanho: parseInt(document.getElementById('layout-fonteTamanho').value, 10),
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
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';

    const pagesContainer = document.getElementById('pages-container');
    pagesContainer.innerHTML = '';

    // Obter config
    const layoutConfig = getLayoutConfigFromForm();

    // Montar o objeto root (similar ao return da API) para injeção na biblioteca
    // A biblioteca aceita a prova inteira para fazer os merges ("replacePlaceholders", etc)
    const formSubmitObj = {
        ...mockProva,
        listaProvaQuestao: generateMockQuestions(15) // Gera 15 questoes de mock
    };

    formSubmitObj.prova.layout = layoutConfig;

    // Configura a class do wrapper
    pagesContainer.classList.toggle("pages_pages_one_page", true);

    // Usa a biblioteca para montar o HTML
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
            .rascunho(0)   // Forcando 0 rascunhos para simplificar preview
            .ordemAlternativa(0)
            .tipoAlternativa(4) // 4 = A., B., C...
            .paginacao();

        if (layoutConfig.marcaDagua) {
            builder.marcaDaguaInstituicao(layoutConfig.marcaDagua);
        }

        let layoutResult = builder.build(formSubmitObj);

        let layoutHtml = AvaliacaoLayout.latexParser(layoutResult.layoutHtml);

        AvaliacaoLayout.LayoutRenderer.render({ ...layoutResult, layoutHtml }, ["public/css/layout-avaliacao.css"], pagesContainer)
            .then(() => {
                if (overlay) overlay.style.display = 'none';
                resizer();
            })
            .catch(err => {
                console.error("Erro na renderização Paged.js", err);
                if (overlay) overlay.style.display = 'none';
            });
    } catch (err) {
        console.error("Erro preparando layout builder:", err);
        if (overlay) overlay.style.display = 'none';
        alert("Erro ao montar layout. Verifique o console.");
    }
}

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
        // Reduz levemente o scale para caber bem no painel da direita
        let scale = (container.clientWidth * 0.9) / pages.offsetWidth;
        if (scale < 1) {
            pages.style.transform = `scale(${scale})`;
            pages.style.transformOrigin = "top center";
        } else {
            pages.style.transform = "none";
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {

    // Binding dos botoes
    document.getElementById('btn-render-preview').addEventListener('click', renderizarPreview);
    document.getElementById('btn-export-json').addEventListener('click', exportarJSON);

    // Ajusta zoom quando janela é esticada
    window.addEventListener('resize', resizer);

    // Carregar o JSON inicial (layout-output.json que ja estava na pasta)
    fetch('./layout-output.json')
        .then(res => res.json())
        .then(data => {
            // Popula os campos com os dados lidos
            const setVal = (id, val) => {
                if (val !== null && val !== undefined && document.getElementById(id)) {
                    document.getElementById(id).value = val;
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

            // Depois de popular, já renderiza pela primeira vez
            renderizarPreview();
        })
        .catch(err => {
            console.error("Erro ao carregar layout-output.json", err);
            // Mesmo com erro, tenta renderizar usando os values padrão do HTML
            renderizarPreview();
        });
});
