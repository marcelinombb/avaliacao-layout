// monaco-manager.js

export class MonacoManager {
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
            console.error('Monaco loader (loader.js) não foi encontrado no global scope.');
            return;
        }

        this.isInitializing = true;

        try {
            require.config({
                paths: { 'vs': 'node_modules/monaco-editor/min/vs' }
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
                // `monaco` global is available after require(['vs/editor/editor.main'])
                const editor = window.monaco.editor.create(container, {
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

                // Intercepta Copiar para devolver o Base64 real em vez do token
                const domElement = editor.getDomNode();
                if (domElement) {
                    domElement.addEventListener('copy', (e) => {
                        const selection = editor.getSelection();
                        if (selection && !selection.isEmpty()) {
                            let selectedText = editor.getModel().getValueInRange(selection);

                            // Verifica se há tokens no texto selecionado
                            if (selectedText.includes('__BASE64_')) {
                                const newText = selectedText.replace(/__BASE64_([a-zA-Z0-9]+)__/g, (match, base64Id) => {
                                    return this.base64Map[base64Id] || match;
                                });

                                // Se o texto mudou, coloca no clipboard manualmente
                                if (newText !== selectedText) {
                                    e.clipboardData.setData('text/plain', newText);
                                    e.preventDefault();
                                }
                            }
                        }
                    });
                }

                // Abre janela flutuante ao clicar no placeholder
                editor.onMouseDown((e) => {
                    if (e.target.element && e.target.element.classList.contains('base64-placeholder')) {
                        const position = e.target.position;
                        // Encontra qual range foi clicado
                        const currentDecos = editor.getLineDecorations(position.lineNumber);
                        const base64DecoHidden = currentDecos.find(d => d.options.inlineClassName === 'base64-hidden');

                        if (base64DecoHidden) {
                            const range = base64DecoHidden.range;
                            const text = editor.getModel().getValueInRange(range);
                            const match = text.match(/__BASE64_([a-zA-Z0-9]+)__/);
                            if (match) {
                                this.openBase64Editor(config.id, match[1]);
                            }
                        }
                    }
                });

                // Inicializa decorações
                this.updateBase64Decorations(config.id);
            }
        });

        this.initFullscreenButtons();
        this.initResizers();
    }

    initResizers() {
        const wrappers = document.querySelectorAll('.editor-wrapper');
        wrappers.forEach(wrapper => {
            // Se já tem resizer, ignora
            if (wrapper.querySelector('.editor-resizer')) return;

            const resizer = document.createElement('div');
            resizer.className = 'editor-resizer';
            resizer.title = 'Arraste para redimensionar';
            wrapper.appendChild(resizer);

            const container = wrapper.querySelector('.monaco-editor-container');
            const editorId = container.id.replace('container-', 'layout-');
            const editor = this.editors[editorId];

            let isResizing = false;
            let startY, startHeight;

            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                startY = e.pageY;
                startHeight = container.offsetHeight;

                // Previne seleção de texto durante o redimensionamento
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'ns-resize';

                const onMouseMove = (e) => {
                    if (!isResizing) return;
                    const deltaY = e.pageY - startY;
                    const newHeight = Math.max(100, startHeight + deltaY);
                    container.style.height = `${newHeight}px`;

                    if (editor) {
                        editor.layout();
                    }
                };

                const onMouseUp = () => {
                    isResizing = false;
                    document.body.style.userSelect = '';
                    document.body.style.cursor = '';
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            });
        });
    }

    /**
     * Substitui a string base64 longa por um token no modelo para evitar quebras visuais e decora o token
     */
    updateBase64Decorations(id) {
        const editor = this.editors[id];
        if (!editor || !window.monaco) return;

        if (this.isInternalEdit) return;
        if (!this.base64Map) this.base64Map = {};

        const model = editor.getModel();
        const text = model.getValue();

        // Captura base64 reais maiores que 100 caracteres
        const regex = /(data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100,})/g;
        let match;
        const edits = [];

        while ((match = regex.exec(text)) !== null) {
            const rawBase64 = match[1];
            const base64Id = Math.random().toString(36).substring(2, 10);
            this.base64Map[base64Id] = rawBase64;

            const startPos = model.getPositionAt(match.index);
            const endPos = model.getPositionAt(match.index + rawBase64.length);

            edits.push({
                range: new window.monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                text: `__BASE64_${base64Id}__`,
                forceMoveMarkers: true
            });
        }

        if (edits.length > 0) {
            this.isInternalEdit = true;
            editor.executeEdits("base64-replacer", edits);
            this.isInternalEdit = false;
        }

        const newText = model.getValue();
        const tokenRegex = /__BASE64_([a-zA-Z0-9]+)__/g;
        const newDecorations = [];
        let tokenMatch;

        while ((tokenMatch = tokenRegex.exec(newText)) !== null) {
            const startPos = model.getPositionAt(tokenMatch.index);
            const endPos = model.getPositionAt(tokenMatch.index + tokenMatch[0].length);
            const range = new window.monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column);

            newDecorations.push({
                range: range,
                options: {
                    inlineClassName: 'base64-hidden',
                    stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            });

            newDecorations.push({
                range: new window.monaco.Range(startPos.lineNumber, startPos.column, startPos.lineNumber, startPos.column),
                options: {
                    beforeContentClassName: 'base64-placeholder',
                    stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            });
        }

        this.decorationsMap[id] = editor.deltaDecorations(this.decorationsMap[id] || [], newDecorations);

        if (typeof editor.setHiddenAreas === 'function') {
            editor.setHiddenAreas([]);
        }
    }

    openBase64Editor(editorId, base64Id) {
        const editor = this.editors[editorId];
        if (!editor || !window.monaco) return;

        const base64Content = this.base64Map[base64Id] || "";

        // Cria a janela flutuante
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '99999';

        const modal = document.createElement('div');
        modal.style.backgroundColor = '#1e1e1e';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.width = '80%';
        modal.style.maxWidth = '800px';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.gap = '15px';
        modal.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

        const title = document.createElement('h3');
        title.innerText = 'Editar Imagem Base64';
        title.style.margin = '0';
        title.style.color = '#fff';
        title.style.fontFamily = 'sans-serif';

        const textarea = document.createElement('textarea');
        textarea.value = base64Content;
        textarea.style.width = '100%';
        textarea.style.height = '150px';
        textarea.style.fontFamily = 'monospace';
        textarea.style.backgroundColor = '#2d2d2d';
        textarea.style.color = '#d4d4d4';
        textarea.style.border = '1px solid #3c3c3c';
        textarea.style.padding = '10px';
        textarea.style.resize = 'vertical';
        textarea.style.boxSizing = 'border-box';

        const imgPreview = document.createElement('img');
        imgPreview.src = base64Content;
        imgPreview.style.maxWidth = '100%';
        imgPreview.style.maxHeight = '250px';
        imgPreview.style.objectFit = 'contain';
        imgPreview.style.border = '1px dashed #555';
        imgPreview.style.display = 'block';
        imgPreview.style.margin = '0 auto';

        // Interface de Upload
        const uploadContainer = document.createElement('div');
        uploadContainer.style.display = 'flex';
        uploadContainer.style.justifyContent = 'center';
        uploadContainer.style.margin = '10px 0';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const btnUpload = document.createElement('button');
        btnUpload.innerText = 'Converter Imagem para Base64';
        btnUpload.style.padding = '8px 16px';
        btnUpload.style.cursor = 'pointer';
        btnUpload.style.backgroundColor = '#2c7a7b';
        btnUpload.style.color = 'white';
        btnUpload.style.border = 'none';
        btnUpload.style.borderRadius = '4px';
        btnUpload.onclick = () => fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                textarea.value = base64;
                imgPreview.src = base64;
            };
            reader.readAsDataURL(file);
        };

        uploadContainer.appendChild(fileInput);
        uploadContainer.appendChild(btnUpload);

        textarea.addEventListener('input', () => {
            imgPreview.src = textarea.value;
        });

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'flex-end';
        btnContainer.style.gap = '10px';

        const btnCancel = document.createElement('button');
        btnCancel.innerText = 'Cancelar';
        btnCancel.style.padding = '8px 16px';
        btnCancel.style.cursor = 'pointer';
        btnCancel.style.backgroundColor = '#444';
        btnCancel.style.color = 'white';
        btnCancel.style.border = 'none';
        btnCancel.style.borderRadius = '4px';
        btnCancel.onclick = () => {
            document.body.removeChild(overlay);
        };

        const btnSave = document.createElement('button');
        btnSave.innerText = 'Salvar';
        btnSave.style.padding = '8px 16px';
        btnSave.style.cursor = 'pointer';
        btnSave.style.backgroundColor = '#0e639c';
        btnSave.style.color = 'white';
        btnSave.style.border = 'none';
        btnSave.style.borderRadius = '4px';
        btnSave.onclick = () => {
            const newValue = textarea.value;
            const model = editor.getModel();
            const fullText = model.getValue();
            const regex = new RegExp(`__BASE64_${base64Id}__`, 'g');
            let match;
            const edits = [];
            while ((match = regex.exec(fullText)) !== null) {
                const start = model.getPositionAt(match.index);
                const end = model.getPositionAt(match.index + match[0].length);
                edits.push({
                    range: new window.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                    text: newValue,
                    forceMoveMarkers: true
                });
            }
            if (edits.length > 0) {
                editor.executeEdits("base64-editor", edits);
            }
            document.body.removeChild(overlay);
        };

        btnContainer.appendChild(btnCancel);
        btnContainer.appendChild(btnSave);

        modal.appendChild(title);
        modal.appendChild(imgPreview);
        modal.appendChild(uploadContainer);
        modal.appendChild(textarea);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
        textarea.focus();
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

    getRealValue(id) {
        if (!this.editors[id]) return "";
        let text = this.editors[id].getValue();
        if (!this.base64Map) return text;
        return text.replace(/__BASE64_([a-zA-Z0-9]+)__/g, (match, base64Id) => {
            return this.base64Map[base64Id] || match;
        });
    }

    syncToTextareas() {
        Object.keys(this.editors).forEach(id => {
            const textarea = document.getElementById(id);
            if (textarea) {
                textarea.value = this.getRealValue(id);
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

export const monacoManager = new MonacoManager();
