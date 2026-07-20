/**
 * Classe UI
 * Gerencia o painel de controle e interface do utilizador
 */
class UI {
    constructor(config, macetes, viewer, app) {
        this.config = config;
        this.macetes = macetes;
        this.viewer = viewer;
        this.app = app;
        this.painel = null;
    }

    inicializar(containerId) {
        this.criarPainel(containerId);
        this.criarControlesCalendarios();
        this.criarControlesMacetes();
        this.criarControlesGlobais();
    }

    /**
     * Cria o painel de controle
     */
    criarPainel(containerId) {
        const container = document.getElementById(containerId);

        const painel = document.createElement('div');
        painel.className = 'painel-controle';
        painel.id = 'painel-controle';

        container.appendChild(painel);
        this.painel = painel;
    }

    criarControlesCalendarios() {
        const container = document.createElement('div');
        container.className = 'controles-calendarios';

        const label = document.createElement('span');
        label.textContent = 'Calendário:';
        label.className = 'cal-label';
        container.appendChild(label);

        const botoes = document.createElement('div');
        botoes.className = 'cal-botoes';

        this.config.calendarios.forEach((cal, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-cal' + (index === 0 ? ' ativo' : '');
            btn.textContent = cal.nome;
            btn.onclick = () => {
                this.app.alternarCalendario(index);
                botoes.querySelectorAll('.btn-cal').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
            };
            botoes.appendChild(btn);
        });

        container.appendChild(botoes);

        // Add button to upload custom base image for current calendar
        const btnUploadBase = document.createElement('button');
        btnUploadBase.className = 'btn-upload-base';
        btnUploadBase.textContent = 'Carregar Base Personalizada';
        btnUploadBase.onclick = () => {
            this.carregarImagemBase();
        };
        container.appendChild(btnUploadBase);

        // Hidden file input for base image upload
        const inputBase = document.createElement('input');
        inputBase.type = 'file';
        inputBase.accept = 'image/*';
        inputBase.id = 'input-base';
        inputBase.style.display = 'none';
        inputBase.onchange = (e) => {
            this.processarImagemBase(e.target.files[0]);
        };
        container.appendChild(inputBase);

        this.painel.appendChild(container);
    }

    /**
     * Cria os controles para cada macete
     */
    criarControlesMacetes() {
        this.macetes.forEach((macete, index) => {
            const controleMacete = this.criarControleMacete(macete, index);
            this.painel.appendChild(controleMacete);
        });
    }

    /**
     * Cria o controle de um macete individual
     */
    criarControleMacete(macete, index) {
        const container = document.createElement('div');
        container.className = 'controle-macete';
        container.id = `controle-macete-${index + 1}`;
        
        // Título
        const titulo = document.createElement('h3');
        titulo.textContent = `Macete ${index + 1}`;
        titulo.className = 'controle-titulo';
        container.appendChild(titulo);
        
        // Navegação (botão anterior, nome do mês, botão próximo)
        const navegacao = document.createElement('div');
        navegacao.className = 'navegacao-macete';
        
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn-navegacao';
        btnAnterior.textContent = '◀';
        btnAnterior.onclick = () => {
            macete.mesAnterior();
            this.atualizarControleMacete(macete, index);
        };
        
        const nomeMes = document.createElement('span');
        nomeMes.className = 'nome-mes';
        nomeMes.id = `nome-mes-${index + 1}`;
        nomeMes.textContent = macete.getNomeMes();
        
        const btnProximo = document.createElement('button');
        btnProximo.className = 'btn-navegacao';
        btnProximo.textContent = '▶';
        btnProximo.onclick = () => {
            const novoMes = macete.proximoMes();
            this.atualizarControleMacete(macete, index);
        };
        
        navegacao.appendChild(btnAnterior);
        navegacao.appendChild(nomeMes);
        navegacao.appendChild(btnProximo);
        container.appendChild(navegacao);
        
        // Dropdown para seleção direta do mês
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-container';
        
        const select = document.createElement('select');
        select.className = 'select-mes';
        select.id = `select-mes-${index + 1}`;
        
        this.config.meses.forEach((mes, mesIndex) => {
            const option = document.createElement('option');
            option.value = mesIndex;
            option.textContent = mes;
            if (mesIndex === macete.mesAtual) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.onchange = (e) => {
            const novoMes = parseInt(e.target.value);
            macete.setMes(novoMes);
            this.atualizarControleMacete(macete, index);
        };
        
        dropdownContainer.appendChild(select);
        container.appendChild(dropdownContainer);
        
        return container;
    }

    /**
     * Atualiza o controle de um macete
     */
    atualizarControleMacete(macete, index) {
        const nomeMes = document.getElementById(`nome-mes-${index + 1}`);
        const select = document.getElementById(`select-mes-${index + 1}`);
        
        if (nomeMes) {
            nomeMes.textContent = macete.getNomeMes();
        }
        
        if (select) {
            select.value = macete.mesAtual;
        }
    }

    /**
     * Cria os controles globais
     */
    criarControlesGlobais() {
        const separador = document.createElement('hr');
        separador.className = 'separador-controles';
        this.painel.appendChild(separador);
        
        const controlesGlobais = document.createElement('div');
        controlesGlobais.className = 'controles-globais';
        
        // Controles de zoom
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'zoom-container';
        
        const zoomLabel = document.createElement('span');
        zoomLabel.textContent = 'Zoom:';
        zoomLabel.className = 'zoom-label';
        zoomContainer.appendChild(zoomLabel);
        
        const btnZoomMenos = document.createElement('button');
        btnZoomMenos.className = 'btn-zoom';
        btnZoomMenos.textContent = '-';
        btnZoomMenos.onclick = () => {
            this.viewer.aplicarZoom(this.viewer.zoomAtual - this.config.zoom.passo);
        };
        zoomContainer.appendChild(btnZoomMenos);
        
        const zoomValor = document.createElement('span');
        zoomValor.className = 'zoom-valor';
        zoomValor.id = 'zoom-valor';
        zoomValor.textContent = `${this.viewer.zoomAtual}%`;
        zoomContainer.appendChild(zoomValor);
        
        const btnZoomMais = document.createElement('button');
        btnZoomMais.className = 'btn-zoom';
        btnZoomMais.textContent = '+';
        btnZoomMais.onclick = () => {
            this.viewer.aplicarZoom(this.viewer.zoomAtual + this.config.zoom.passo);
        };
        zoomContainer.appendChild(btnZoomMais);
        
        controlesGlobais.appendChild(zoomContainer);
        
        // Botão reset
        const btnReset = document.createElement('button');
        btnReset.className = 'btn-reset';
        btnReset.textContent = 'Reset Vista';
        btnReset.onclick = () => {
            this.viewer.reset();
            this.atualizarZoomValor();
        };
        controlesGlobais.appendChild(btnReset);
        
        // Botão reset rotação 3D
        const btnResetRotacao = document.createElement('button');
        btnResetRotacao.className = 'btn-reset-rotacao';
        btnResetRotacao.textContent = 'Reset Rotação';
        btnResetRotacao.onclick = () => {
            this.viewer.rotacaoX = 0;
            this.viewer.rotacaoY = 0;
            this.viewer.aplicarTransformacao();
        };
        controlesGlobais.appendChild(btnResetRotacao);
        
        // Botão fullscreen
        const btnFullscreen = document.createElement('button');
        btnFullscreen.className = 'btn-fullscreen';
        btnFullscreen.textContent = 'Fullscreen';
        btnFullscreen.onclick = () => {
            this.toggleFullscreen();
        };
        controlesGlobais.appendChild(btnFullscreen);
        
        // Botão modo designer
        const btnDesigner = document.createElement('button');
        btnDesigner.className = 'btn-designer';
        btnDesigner.textContent = 'Modo Designer';
        btnDesigner.onclick = () => {
            const ativo = this.viewer.alternarModoDesigner();
            btnDesigner.textContent = ativo ? 'Designer: ON' : 'Modo Designer';
            btnDesigner.classList.toggle('ativo', ativo);
        };
        controlesGlobais.appendChild(btnDesigner);
        
        // Botão imagem de fundo
        const btnImagemFundo = document.createElement('button');
        btnImagemFundo.className = 'btn-imagem-fundo';
        btnImagemFundo.textContent = 'Imagem Fundo: OFF';
        btnImagemFundo.onclick = () => {
            const visivel = this.viewer.alternarImagemFundo();
            btnImagemFundo.textContent = visivel ? 'Imagem Fundo: ON' : 'Imagem Fundo: OFF';
            btnImagemFundo.classList.toggle('ativo', visivel);
        };
        controlesGlobais.appendChild(btnImagemFundo);
        
        // Botão carregar imagem de fundo
        const btnCarregarFundo = document.createElement('button');
        btnCarregarFundo.className = 'btn-carregar-fundo';
        btnCarregarFundo.textContent = 'Carregar Fundo';
        btnCarregarFundo.onclick = () => {
            this.carregarImagemFundo();
        };
        controlesGlobais.appendChild(btnCarregarFundo);
        
        // Input file escondido para carregar imagem
        const inputFundo = document.createElement('input');
        inputFundo.type = 'file';
        inputFundo.accept = 'image/*';
        inputFundo.id = 'input-fundo';
        inputFundo.style.display = 'none';
        inputFundo.onchange = (e) => {
            this.processarImagemFundo(e.target.files[0]);
        };
        controlesGlobais.appendChild(inputFundo);

        // Botão remover macetes para ver o fundo
        const btnRemover = document.createElement('button');
        btnRemover.className = 'btn-remover-macetes';
        btnRemover.textContent = 'REMOVER MACETES';
        btnRemover.onclick = () => {
            const ocultos = this.macetes[0] && this.macetes[0].getElemento().style.display === 'none';
            this.macetes.forEach(m => {
                m.getElemento().style.display = ocultos ? '' : 'none';
            });
            btnRemover.textContent = ocultos ? 'REMOVER MACETES' : 'MOSTRAR MACETES';
            btnRemover.classList.toggle('ativo', !ocultos);
        };
        controlesGlobais.appendChild(btnRemover);
        
        // Botão alternar parallax
        const btnParallax = document.createElement('button');
        btnParallax.className = 'btn-parallax';
        btnParallax.textContent = 'Parallax: ON';
        btnParallax.classList.add('ativo');
        btnParallax.onclick = () => {
            this.viewer.config.rotacao3D.parallaxEnabled = !this.viewer.config.rotacao3D.parallaxEnabled;
            btnParallax.textContent = this.viewer.config.rotacao3D.parallaxEnabled ? 'Parallax: ON' : 'Parallax: OFF';
            btnParallax.classList.toggle('ativo', this.viewer.config.rotacao3D.parallaxEnabled);
        };
        controlesGlobais.appendChild(btnParallax);
        
        this.painel.appendChild(controlesGlobais);
    }

    /**
     * Atualiza o valor do zoom na UI
     */
    atualizarZoomValor() {
        const zoomValor = document.getElementById('zoom-valor');
        if (zoomValor) {
            zoomValor.textContent = `${this.viewer.zoomAtual}%`;
        }
    }

    /**
     * Alterna o modo fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    /**
     * Atualiza todos os controles
     */
    atualizarTodos() {
        this.macetes.forEach((macete, index) => {
            this.atualizarControleMacete(macete, index);
        });
        this.atualizarZoomValor();
    }

    /**
     * Abre o diálogo para carregar imagem de fundo
     */
    carregarImagemFundo() {
        const inputFundo = document.getElementById('input-fundo');
        if (inputFundo) {
            inputFundo.click();
        }
    }

    /**
     * Processa a imagem de fundo carregada
     */
    processarImagemFundo(ficheiro) {
        if (!ficheiro) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.viewer.atualizarImagemFundo(dataUrl);

            // Guardar fundo no calendário atual
            this.config.calendarios[this.app.calendarioAtual].assets.folhaBase = dataUrl;

            // Atualizar botão para mostrar que está ativo
            const btnImagemFundo = document.querySelector('.btn-imagem-fundo');
            if (btnImagemFundo) {
                btnImagemFundo.textContent = 'Imagem Fundo: ON';
                btnImagemFundo.classList.add('ativo');
            }
        };
        reader.readAsDataURL(ficheiro);
    }

    /**
     * Abre o diálogo para carregar imagem base personalizada
     */
    carregarImagemBase() {
        const inputBase = document.getElementById('input-base');
        if (inputBase) {
            inputBase.click();
        }
    }

    /**
     * Processa a imagem base carregada
     */
    processarImagemBase(ficheiro) {
        if (!ficheiro) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.viewer.atualizarImagemFundo(dataUrl);

            // Guardar imagem base no calendário atual
            this.config.calendarios[this.app.calendarioAtual].assets.folhaBase = dataUrl;

            // Atualizar botão para mostrar que foi carregada
            const btnUploadBase = document.querySelector('.btn-upload-base');
            if (btnUploadBase) {
                btnUploadBase.textContent = 'Base Personalizada ✓';
                btnUploadBase.classList.add('ativo');
            }
        };
        reader.readAsDataURL(ficheiro);
    }

    /**
     * Atualiza o estado do botão de base personalizada ao mudar de calendário
     */
    atualizarBotaoBasePersonalizada() {
        const btnUploadBase = document.querySelector('.btn-upload-base');
        if (btnUploadBase) {
            const currentBase = this.config.calendarios[this.app.calendarioAtual].assets.folhaBase;
            // Check if it's a data URL (custom uploaded) or a file path
            if (currentBase.startsWith('data:')) {
                btnUploadBase.textContent = 'Base Personalizada ✓';
                btnUploadBase.classList.add('ativo');
            } else {
                btnUploadBase.textContent = 'Carregar Base Personalizada';
                btnUploadBase.classList.remove('ativo');
            }
        }
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
