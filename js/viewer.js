/**
 * Classe Viewer
 * Gerencia a visualização da folha base e as transformações (zoom, pan, rotação 3D)
 */
class Viewer {
    constructor(config) {
        this.config = config;
        this.zoomAtual = config.zoom.padrao;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.isRotating = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.panStartX = 0;
        this.panStartY = 0;
        this.rotacaoX = 0;
        this.rotacaoY = 0;
        this.rotacaoStartX = 0;
        this.rotacaoStartY = 0;
        this.modoDesigner = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotacaoX = 0;
        this.targetRotacaoY = 0;
        
        this.container = null;
        this.folha = null;
        this.furo = null;
        this.grelha = null;
        this.imagemFundo = null;
    }

    /**
     * Inicializa o viewer
     */
    inicializar(containerId) {
        this.container = document.getElementById(containerId);
        
        // Aplicar cor de fundo (parede)
        this.container.style.backgroundColor = this.config.cores.fundoParede;
        
        this.criarFolha();
        this.criarFuro();
        this.criarGrelha();
        this.configurarEventos();
        
        // Calcular zoom inicial para caber no ecrã
        if (this.config.zoom.padrao === 'auto') {
            this.calcularZoomAuto();
        }
        
        // Aplicar rotação inicial para perspectiva dinâmica
        this.rotacaoX = this.config.rotacao3D.rotacaoX;
        this.rotacaoY = this.config.rotacao3D.rotacaoY;
        this.aplicarTransformacao();
    }

    /**
     * Calcula o zoom automático para caber no ecrã
     */
    calcularZoomAuto() {
        const containerRect = this.container.getBoundingClientRect();
        const folhaRect = this.folha.getBoundingClientRect();
        
        const scaleX = (containerRect.width - 40) / folhaRect.width;
        const scaleY = (containerRect.height - 40) / folhaRect.height;
        const scale = Math.min(scaleX, scaleY) * 100;
        
        this.zoomAtual = Math.max(this.config.zoom.min, Math.min(this.config.zoom.max, scale));
        this.aplicarTransformacao();
    }

    /**
     * Cria a folha base
     */
    criarFolha() {
        const folha = document.createElement('div');
        folha.className = 'folha-base';
        folha.id = 'folha-base';
        
        // Dimensões em mm
        folha.style.width = `${this.config.folha.largura}mm`;
        folha.style.height = `${this.config.folha.altura}mm`;
        folha.style.position = 'relative';
        folha.style.backgroundColor = '#ffffff';
        
        // Aplicar sombra parede se configurado
        if (this.config.sombraParede.enabled) {
            const s = this.config.sombraParede;
            folha.style.boxShadow = `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.cor}`;
        } else {
            folha.style.boxShadow = '0 0 30px rgba(0,0,0,0.2)';
        }
        
        folha.style.transition = 'transform 0.1s ease-out';
        folha.style.transformStyle = 'preserve-3d';
        
        // Imagem de fundo (folha base) - condicional
        if (this.config.assets.mostrarFolhaBase) {
            const imgFundo = document.createElement('img');
            imgFundo.className = 'folha-imagem';
            imgFundo.src = this.config.assets.folhaBase;
            imgFundo.style.width = '100%';
            imgFundo.style.height = '100%';
            imgFundo.style.objectFit = 'contain';
            imgFundo.style.position = 'absolute';
            imgFundo.style.top = '0';
            imgFundo.style.left = '0';
            imgFundo.id = 'folha-imagem-fundo';
            
            // Fallback se a imagem não carregar
            imgFundo.onerror = () => {
                console.warn('Imagem de fundo não encontrada, usando fundo branco');
                imgFundo.style.display = 'none';
            };
            
            folha.appendChild(imgFundo);
            this.imagemFundo = imgFundo;
        } else {
            // Criar elemento vazio para imagem de fundo (será preenchido pelo utilizador)
            this.imagemFundo = null;
        }
        
        this.container.appendChild(folha);
        this.folha = folha;
    }

    /**
     * Cria o furo
     */
    criarFuro() {
        const furo = document.createElement('div');
        furo.className = 'furo';
        furo.id = 'furo';
        
        // Posição do furo
        const centroX = this.config.folha.largura / 2;
        const centroY = this.config.folha.furo.centroTopo;
        
        furo.style.position = 'absolute';
        furo.style.width = `${this.config.folha.furo.diametro}mm`;
        furo.style.height = `${this.config.folha.furo.diametro}mm`;
        furo.style.borderRadius = '50%';
        furo.style.border = '2px solid #000000';
        furo.style.backgroundColor = 'transparent';
        furo.style.left = `${centroX - this.config.folha.furo.diametro / 2}mm`;
        furo.style.top = `${centroY - this.config.folha.furo.diametro / 2}mm`;
        furo.style.zIndex = '100';
        furo.style.display = 'none'; // Escondido por padrão
        
        this.folha.appendChild(furo);
        this.furo = furo;
    }

    /**
     * Cria a grelha do modo designer
     */
    criarGrelha() {
        const grelha = document.createElement('div');
        grelha.className = 'grelha-designer';
        grelha.id = 'grelha-designer';
        grelha.style.position = 'absolute';
        grelha.style.top = '0';
        grelha.style.left = '0';
        grelha.style.width = '100%';
        grelha.style.height = '100%';
        grelha.style.pointerEvents = 'none';
        grelha.style.display = 'none';
        grelha.style.zIndex = '50';
        
        // Criar linhas da grelha
        const intervalo = 10; // 10mm
        for (let x = 0; x <= this.config.folha.largura; x += intervalo) {
            const linha = document.createElement('div');
            linha.style.position = 'absolute';
            linha.style.left = `${x}mm`;
            linha.style.top = '0';
            linha.style.width = '1px';
            linha.style.height = '100%';
            linha.style.backgroundColor = this.config.designer.corGrelha;
            linha.style.opacity = '0.3';
            grelha.appendChild(linha);
        }
        
        for (let y = 0; y <= this.config.folha.altura; y += intervalo) {
            const linha = document.createElement('div');
            linha.style.position = 'absolute';
            linha.style.left = '0';
            linha.style.top = `${y}mm`;
            linha.style.width = '100%';
            linha.style.height = '1px';
            linha.style.backgroundColor = this.config.designer.corGrelha;
            linha.style.opacity = '0.3';
            grelha.appendChild(linha);
        }
        
        this.folha.appendChild(grelha);
        this.grelha = grelha;
    }

    /**
     * Configura os eventos de zoom, pan e rotação 3D
     */
    configurarEventos() {
        // Zoom com roda do rato (sem Ctrl)
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -this.config.zoom.passo : this.config.zoom.passo;
            this.aplicarZoom(this.zoomAtual + delta);
        });

        // Pan com arrastar (botão esquerdo) ou rotação 3D (botão direito)
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botão esquerdo - Pan
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.panStartX = this.panX;
                this.panStartY = this.panY;
                this.container.style.cursor = 'grabbing';
            } else if (e.button === 2 && this.config.rotacao3D.enabled) { // Botão direito - Rotação 3D
                e.preventDefault();
                this.isRotating = true;
                this.rotacaoStartX = e.clientX;
                this.rotacaoStartY = e.clientY;
                this.container.style.cursor = 'crosshair';
            }
        });

        document.addEventListener('mousemove', (e) => {
            // Efeito parallax com movimento do rato
            if (this.config.rotacao3D.parallaxEnabled && !this.isRotating) {
                const containerRect = this.container.getBoundingClientRect();
                const centerX = containerRect.width / 2;
                const centerY = containerRect.height / 2;
                
                // Calcular posição normalizada do rato (-1 a 1)
                const normX = (e.clientX - containerRect.left - centerX) / centerX;
                const normY = (e.clientY - containerRect.top - centerY) / centerY;
                
                // Aplicar rotação baseada na posição do rato
                this.targetRotacaoY = normX * this.config.rotacao3D.maxRotacaoY * this.config.rotacao3D.parallaxIntensity;
                this.targetRotacaoX = -normY * this.config.rotacao3D.maxRotacaoX * this.config.rotacao3D.parallaxIntensity;
                
                // Interpolação suave
                this.rotacaoX += (this.targetRotacaoX - this.rotacaoX) * 0.1;
                this.rotacaoY += (this.targetRotacaoY - this.rotacaoY) * 0.1;
                
                this.aplicarTransformacao();
            }
            
            if (this.isDragging) {
                const deltaX = e.clientX - this.dragStartX;
                const deltaY = e.clientY - this.dragStartY;
                this.panX = this.panStartX + deltaX;
                this.panY = this.panStartY + deltaY;
                this.aplicarTransformacao();
            } else if (this.isRotating && this.config.rotacao3D.enabled) {
                const deltaX = e.clientX - this.rotacaoStartX;
                const deltaY = e.clientY - this.rotacaoStartY;
                
                // Aplicar rotação com limites
                let novaRotacaoY = this.rotacaoY + deltaX * this.config.rotacao3D.sensibilidade;
                let novaRotacaoX = this.rotacaoX - deltaY * this.config.rotacao3D.sensibilidade;
                
                // Limitar rotação para não perder layout
                novaRotacaoY = Math.max(-this.config.rotacao3D.maxRotacaoY, Math.min(this.config.rotacao3D.maxRotacaoY, novaRotacaoY));
                novaRotacaoX = Math.max(-this.config.rotacao3D.maxRotacaoX, Math.min(this.config.rotacao3D.maxRotacaoX, novaRotacaoX));
                
                this.rotacaoY = novaRotacaoY;
                this.rotacaoX = novaRotacaoX;
                this.aplicarTransformacao();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isRotating = false;
            this.container.style.cursor = 'default';
        });

        // Prevenir menu de contexto com botão direito
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Aplica o zoom
     */
    aplicarZoom(novoZoom) {
        this.zoomAtual = Math.max(
            this.config.zoom.min,
            Math.min(this.config.zoom.max, novoZoom)
        );
        this.aplicarTransformacao();
    }

    /**
     * Aplica a transformação (zoom + pan + rotação 3D)
     */
    aplicarTransformacao() {
        const scale = this.zoomAtual / 100;
        let transform = `translate(${this.panX}px, ${this.panY}px) scale(${scale})`;
        
        if (this.config.rotacao3D.enabled) {
            transform += ` rotateX(${this.rotacaoX}deg) rotateY(${this.rotacaoY}deg)`;
        }
        
        this.folha.style.transform = transform;
    }

    /**
     * Reseta o zoom, pan e rotação
     */
    reset() {
        if (this.config.zoom.padrao === 'auto') {
            this.calcularZoomAuto();
        } else {
            this.zoomAtual = this.config.zoom.padrao;
        }
        this.panX = 0;
        this.panY = 0;
        this.rotacaoX = this.config.rotacao3D.rotacaoX;
        this.rotacaoY = this.config.rotacao3D.rotacaoY;
        this.aplicarTransformacao();
    }

    /**
     * Alterna o modo designer
     */
    alternarModoDesigner() {
        this.modoDesigner = !this.modoDesigner;
        
        // Mostrar/esconder elementos do modo designer
        this.furo.style.display = this.modoDesigner ? 'block' : 'none';
        this.grelha.style.display = this.modoDesigner ? 'block' : 'none';
        
        // Mostrar limites das zonas
        const zonas = document.querySelectorAll('.macete-zona');
        zonas.forEach(zona => {
            zona.style.border = this.modoDesigner ? `2px dashed ${this.config.designer.corLimites}` : 'none';
        });
        
        return this.modoDesigner;
    }

    /**
     * Adiciona um macete à folha
     */
    adicionarMacete(elementoMacete) {
        this.folha.appendChild(elementoMacete);
    }

    /**
     * Obtém o elemento da folha
     */
    getFolha() {
        return this.folha;
    }

    /**
     * Alterna a visibilidade da imagem de fundo
     */
    alternarImagemFundo() {
        if (this.imagemFundo) {
            const visivel = this.imagemFundo.style.display !== 'none';
            this.imagemFundo.style.display = visivel ? 'none' : 'block';
            return !visivel;
        }
        return false;
    }

    /**
     * Define a visibilidade da imagem de fundo
     */
    setImagemFundoVisivel(visivel) {
        if (this.imagemFundo) {
            this.imagemFundo.style.display = visivel ? 'block' : 'none';
        }
    }

    /**
     * Atualiza a imagem de fundo com um novo caminho
     */
    atualizarImagemFundo(novaSrc) {
        if (this.imagemFundo) {
            this.imagemFundo.src = novaSrc;
            this.imagemFundo.style.display = 'block';
        } else {
            // Se não existe, cria a imagem de fundo
            const imgFundo = document.createElement('img');
            imgFundo.className = 'folha-imagem';
            imgFundo.src = novaSrc;
            imgFundo.style.width = '100%';
            imgFundo.style.height = '100%';
            imgFundo.style.objectFit = 'contain';
            imgFundo.style.position = 'absolute';
            imgFundo.style.top = '0';
            imgFundo.style.left = '0';
            imgFundo.id = 'folha-imagem-fundo';
            
            this.folha.insertBefore(imgFundo, this.folha.firstChild);
            this.imagemFundo = imgFundo;
        }
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Viewer;
}
