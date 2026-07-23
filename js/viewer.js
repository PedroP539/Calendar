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
        this.furos = [];
        this.grelha = null;
        this.imagemFundo = null;
        this.calendarioAtivo = 0;
        this.elementosDesigner = [];
    }

    inicializar(containerId) {
        this.container = document.getElementById(containerId);
        this.container.style.backgroundColor = this.config.cores.fundoParede;
        
        this.criarFolha();
        this.criarFuros();
        this.criarGrelha();
        this.criarVincoDesigner();
        this.configurarEventos();
        
        if (this.config.zoom.padrao === 'auto') {
            this.calcularZoomAuto();
        }
        
        this.rotacaoX = this.config.rotacao3D.rotacaoX;
        this.rotacaoY = this.config.rotacao3D.rotacaoY;
        this.aplicarTransformacao();
    }

    calcularZoomAuto() {
        const containerRect = this.container.getBoundingClientRect();
        const folhaRect = this.folha.getBoundingClientRect();
        const scaleX = (containerRect.width - 40) / folhaRect.width;
        const scaleY = (containerRect.height - 40) / folhaRect.height;
        const scale = Math.min(scaleX, scaleY) * 100;
        this.zoomAtual = Math.max(this.config.zoom.min, Math.min(this.config.zoom.max, scale));
        this.aplicarTransformacao();
    }

    criarFolha() {
        const folha = document.createElement('div');
        folha.className = 'folha-base';
        folha.id = 'folha-base';
        folha.style.width = `${this.config.folha.largura}mm`;
        folha.style.height = `${this.config.folha.altura}mm`;
        folha.style.position = 'relative';
        folha.style.backgroundColor = '#ffffff';

        if (this.config.sombraParede.enabled) {
            const s = this.config.sombraParede;
            folha.style.boxShadow = `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.cor}`;
        } else {
            folha.style.boxShadow = '0 0 30px rgba(0,0,0,0.2)';
        }
        folha.style.transition = 'transform 0.1s ease-out';
        folha.style.transformStyle = 'preserve-3d';

        if (this.config.assets.mostrarFolhaBase) {
            this.imagemFundo = document.createElement('img');
            this.imagemFundo.className = 'folha-imagem';
            this.imagemFundo.id = 'folha-imagem-fundo';
            this.imagemFundo.src = this.config.calendarios[0].assets.folhaBase;
            this.imagemFundo.style.width = '100%';
            this.imagemFundo.style.height = '100%';
            this.imagemFundo.style.objectFit = 'contain';
            this.imagemFundo.style.position = 'absolute';
            this.imagemFundo.style.top = '0';
            this.imagemFundo.style.left = '0';
            this.imagemFundo.style.zIndex = '0';
            this.imagemFundo.onerror = () => {
                this.imagemFundo.style.display = 'none';
            };
            folha.appendChild(this.imagemFundo);
        } else {
            this.imagemFundo = null;
        }

        this.container.appendChild(folha);
        this.folha = folha;
    }

    criarFuros() {
        const argolas = this.config.folha.argolas;
        if (!argolas) return;

        const centroX = this.config.folha.largura / 2;
        const quantidade = argolas.quantidade || 1;
        const espacamento = argolas.espacamento || 60;
        const inicio = argolas.inicio !== undefined ? argolas.inicio : (centroX - (quantidade - 1) * espacamento / 2);

        for (let i = 0; i < quantidade; i++) {
            const furo = document.createElement('div');
            furo.className = 'furo';
            furo.style.position = 'absolute';
            furo.style.width = `${argolas.diametro}mm`;
            furo.style.height = `${argolas.diametro}mm`;
            furo.style.borderRadius = '50%';
            furo.style.border = '2px solid #000000';
            furo.style.backgroundColor = 'transparent';
            furo.style.left = `${inicio + i * espacamento - argolas.diametro / 2}mm`;
            furo.style.top = `${argolas.margemTopo - argolas.diametro / 2}mm`;
            furo.style.zIndex = '100';
            furo.style.display = 'none';
            this.folha.appendChild(furo);
            this.furos.push(furo);
        }
    }

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

        const intervalo = 10;
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

    criarVincoDesigner() {
        // Flyer: linhas de vinco verticais
        if (this.config.flyer && this.config.flyer.vincos) {
            this.config.flyer.vincos.forEach(vinco => {
                const el = document.createElement('div');
                el.className = 'vinco-designer';
                el.style.position = 'absolute';
                el.style.width = '2px';
                el.style.height = '100%';
                el.style.left = `${vinco.posicao}mm`;
                el.style.top = '0';
                el.style.backgroundColor = this.config.designer.corVinco || '#ff0000';
                el.style.opacity = '0.8';
                el.style.display = 'none';
                el.style.zIndex = '60';
                el.style.pointerEvents = 'none';
                this.folha.appendChild(el);
                this.elementosDesigner.push(el);
            });
        }

        // Triangular: linhas de vinco horizontais entre segmentos
        if (this.config.triangular && this.config.triangular.segmentos) {
            let yOffset = 0;
            this.config.triangular.segmentos.forEach((seg, idx) => {
                if (idx > 0) {
                    const el = document.createElement('div');
                    el.className = 'vinco-designer';
                    el.style.position = 'absolute';
                    el.style.width = '100%';
                    el.style.height = '2px';
                    el.style.left = '0';
                    el.style.top = `${yOffset}mm`;
                    el.style.backgroundColor = idx === 1 || idx === 3 ? this.config.designer.corVinco || '#ff0000' : this.config.designer.corDobra || '#ff6600';
                    el.style.display = 'none';
                    el.style.zIndex = '60';
                    el.style.pointerEvents = 'none';
                    this.folha.appendChild(el);
                    this.elementosDesigner.push(el);
                    
                    // Label
                    const label = document.createElement('div');
                    label.className = 'vinco-label';
                    label.textContent = `vinco ${idx}`;
                    label.style.position = 'absolute';
                    label.style.left = '5px';
                    label.style.top = `${yOffset + 3}mm`;
                    label.style.fontSize = '9px';
                    label.style.color = '#ff0000';
                    label.style.display = 'none';
                    label.style.zIndex = '61';
                    label.style.pointerEvents = 'none';
                    this.folha.appendChild(label);
                    this.elementosDesigner.push(label);
                }
                yOffset += seg.altura;
            });

            // Labels dos segmentos
            yOffset = 0;
            this.config.triangular.segmentos.forEach((seg) => {
                const label = document.createElement('div');
                label.textContent = seg.nome;
                label.style.position = 'absolute';
                label.style.left = '50%';
                label.style.top = `${yOffset + seg.altura / 2 - 5}mm`;
                label.style.transform = 'translateX(-50%)';
                label.style.fontSize = '11px';
                label.style.fontWeight = 'bold';
                label.style.color = '#ff0000';
                label.style.display = 'none';
                label.style.zIndex = '61';
                label.style.pointerEvents = 'none';
                this.folha.appendChild(label);
                this.elementosDesigner.push(label);
                yOffset += seg.altura;
            });
        }

        // Flyer: labels dos painéis
        if (this.config.flyer && this.config.flyer.paineis) {
            this.config.flyer.paineis.forEach(panel => {
                const label = document.createElement('div');
                label.textContent = panel.nome;
                label.style.position = 'absolute';
                label.style.left = `${panel.esquerda + 5}mm`;
                label.style.top = `${panel.topo + 10}mm`;
                label.style.fontSize = '10px';
                label.style.fontWeight = 'bold';
                label.style.color = this.config.designer.corLimites || '#ff0000';
                label.style.display = 'none';
                label.style.zIndex = '61';
                label.style.pointerEvents = 'none';
                this.folha.appendChild(label);
                this.elementosDesigner.push(label);
            });
        }
    }

    configurarEventos() {
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -this.config.zoom.passo : this.config.zoom.passo;
            this.aplicarZoom(this.zoomAtual + delta);
        });

        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.panStartX = this.panX;
                this.panStartY = this.panY;
                this.container.style.cursor = 'grabbing';
            } else if (e.button === 2 && this.config.rotacao3D.enabled) {
                e.preventDefault();
                this.isRotating = true;
                this.rotacaoStartX = e.clientX;
                this.rotacaoStartY = e.clientY;
                this.container.style.cursor = 'crosshair';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.config.rotacao3D.parallaxEnabled && !this.isRotating) {
                const containerRect = this.container.getBoundingClientRect();
                const centerX = containerRect.width / 2;
                const centerY = containerRect.height / 2;
                const normX = (e.clientX - containerRect.left - centerX) / centerX;
                const normY = (e.clientY - containerRect.top - centerY) / centerY;
                this.targetRotacaoY = normX * this.config.rotacao3D.maxRotacaoY * this.config.rotacao3D.parallaxIntensity;
                this.targetRotacaoX = -normY * this.config.rotacao3D.maxRotacaoX * this.config.rotacao3D.parallaxIntensity;
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
                let novaRotacaoY = this.rotacaoY + deltaX * this.config.rotacao3D.sensibilidade;
                let novaRotacaoX = this.rotacaoX - deltaY * this.config.rotacao3D.sensibilidade;
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

        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    aplicarZoom(novoZoom) {
        this.zoomAtual = Math.max(this.config.zoom.min, Math.min(this.config.zoom.max, novoZoom));
        this.aplicarTransformacao();
    }

    aplicarTransformacao() {
        const scale = this.zoomAtual / 100;
        let transform = `translate(${this.panX}px, ${this.panY}px) scale(${scale})`;
        if (this.config.rotacao3D.enabled) {
            transform += ` rotateX(${this.rotacaoX}deg) rotateY(${this.rotacaoY}deg)`;
        }
        this.folha.style.transform = transform;
    }

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

    alternarModoDesigner() {
        this.modoDesigner = !this.modoDesigner;

        this.furos.forEach(furo => { furo.style.display = this.modoDesigner ? 'block' : 'none'; });
        this.grelha.style.display = this.modoDesigner ? 'block' : 'none';

        const zonas = document.querySelectorAll('.macete-zona');
        zonas.forEach(zona => {
            zona.style.border = this.modoDesigner ? `2px dashed ${this.config.designer.corLimites}` : 'none';
        });

        this.elementosDesigner.forEach(el => {
            el.style.display = this.modoDesigner ? 'block' : 'none';
        });

        return this.modoDesigner;
    }

    adicionarMacete(elementoMacete) {
        this.folha.appendChild(elementoMacete);
    }

    getFolha() { return this.folha; }

    alternarImagemFundo() {
        const visivel = this.imagemFundo && this.imagemFundo.style.display !== 'none';
        if (this.imagemFundo) this.imagemFundo.style.display = visivel ? 'none' : 'block';
        return !visivel;
    }

    setImagemFundoVisivel(visivel) {
        if (this.imagemFundo) this.imagemFundo.style.display = visivel ? 'block' : 'none';
    }

    setCalendarioAtivo(index) {
        if (!this.imagemFundo) return;
        if (index === this.calendarioAtivo) return;
        this.calendarioAtivo = index;
        this.imagemFundo.src = this.config.calendarios[index].assets.folhaBase;
    }

    atualizarImagemFundo(novaSrc) {
        if (this.imagemFundo) {
            this.imagemFundo.src = novaSrc;
            this.imagemFundo.style.display = 'block';
        } else {
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

if (typeof module !== 'undefined' && module.exports) module.exports = Viewer;
