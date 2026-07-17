/**
 * Aplicação Principal - Calendário de Parede
 * Ponto de entrada e orquestração dos componentes
 */

class CalendarApp {
    constructor() {
        this.config = null;
        this.viewer = null;
        this.ui = null;
        this.macetes = [];
        this.calendarioAtual = 0;
    }

    async inicializar() {
        try {
            this.config = CONFIG;

            this.viewer = new Viewer(this.config);
            this.viewer.inicializar('viewer-container');

            const assets = this.config.calendarios[0].assets;
            this.viewer.atualizarImagemFundo(assets.folhaBase);
            await this.criarMacetes(assets);

            this.ui = new UI(this.config, this.macetes, this.viewer, this);
            this.ui.inicializar('ui-container');

            this.macetes.forEach((macete, index) => {
                const elemento = macete.criarElemento();
                this.viewer.adicionarMacete(elemento);
                macete.onChange = () => {
                    this.ui.atualizarControleMacete(macete, index);
                };
            });

            this.configurarAtalhos();
            console.log('Aplicação inicializada com sucesso!');

        } catch (erro) {
            console.error('Erro ao inicializar aplicação:', erro);
            this.mostrarErro(erro);
        }
    }

    async criarMacetes(assets) {
        for (let i = 0; i < 3; i++) {
            const macete = new Macete(i + 1, this.config.zonas[i], this.config);
            await macete.carregarImagens(assets.macetes);
            this.macetes.push(macete);
        }
    }

    async alternarCalendario(index) {
        if (index === this.calendarioAtual || !this.config.calendarios[index]) return;
        this.calendarioAtual = index;
        const assets = this.config.calendarios[index].assets;

        await Promise.all(this.macetes.map(m => m.recarregarImagens(assets.macetes)));

        this.viewer.atualizarImagemFundo(assets.folhaBase);
        this.ui.atualizarTodos();
    }

    /**
     * Configura atalhos de teclado
     */
    configurarAtalhos() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + 0 para reset
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                this.viewer.reset();
                this.ui.atualizarZoomValor();
            }
            
            // Ctrl + + para zoom in
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.viewer.aplicarZoom(this.viewer.zoomAtual + this.config.zoom.passo);
                this.ui.atualizarZoomValor();
            }
            
            // Ctrl + - para zoom out
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                this.viewer.aplicarZoom(this.viewer.zoomAtual - this.config.zoom.passo);
                this.ui.atualizarZoomValor();
            }
            
            // F para fullscreen
            if (e.key === 'f' || e.key === 'F') {
                this.ui.toggleFullscreen();
            }
            
            // D para modo designer
            if (e.key === 'd' || e.key === 'D') {
                const btnDesigner = document.querySelector('.btn-designer');
                if (btnDesigner) {
                    btnDesigner.click();
                }
            }
            
            // R para reset rotação
            if (e.key === 'r' || e.key === 'R') {
                const btnResetRotacao = document.querySelector('.btn-reset-rotacao');
                if (btnResetRotacao) {
                    btnResetRotacao.click();
                }
            }
        });
    }

    /**
     * Mostra erro ao utilizador
     */
    mostrarErro(erro) {
        const container = document.getElementById('app-container');
        const mensagemErro = document.createElement('div');
        mensagemErro.className = 'mensagem-erro';
        mensagemErro.innerHTML = `
            <h2>Erro ao inicializar aplicação</h2>
            <p>${erro.message}</p>
            <p>Verifique se os ficheiros de assets existem nas pastas corretas.</p>
        `;
        container.appendChild(mensagemErro);
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalendarApp();
    app.inicializar();
});
