/**
 * ViewerTriangle - Visualização 3D do calendário triangular montado
 * Mostra o produto final (triângulo montado com folhas penduradas)
 */
class ViewerTriangle {
    constructor(config) {
        this.config = config;
        this.container = null;
        this.scene = null;
        this.mesAtual = 0;
        this.imagens = [];
        this.carregado = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.rotacaoX = 15;
        this.rotacaoY = -20;
        this.zoomAtual = 100;
        this.modoDesigner = false;
        this.onChange = null;
    }

    async inicializar(containerId) {
        this.container = document.getElementById(containerId);
        this.container.style.backgroundColor = this.config.cores.fundoParede;
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';

        await this.carregarImagens();

        this.criarCena();
        this.configurarEventos();
        this.aplicarTransformacao();

        document.getElementById('loading-screen').classList.add('hidden');
    }

    async carregarImagens() {
        const pastaBase = this.config.assets.macetes[0];
        for (let i = 0; i < 12; i++) {
            const caminho = `${pastaBase}/macete${i + 1}.png`;
            try {
                const img = new Image();
                img.src = caminho;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                this.imagens.push(img);
            } catch {
                this.imagens.push(null);
            }
        }
        this.carregado = true;
    }

    criarCena() {
        this.scene = document.createElement('div');
        this.scene.className = 'tri-scene';
        this.scene.style.cssText = `
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            perspective: 1200px;
            perspective-origin: 50% 40%;
        `;
        this.container.appendChild(this.scene);

        const wrapper = document.createElement('div');
        wrapper.className = 'tri-wrapper';
        wrapper.id = 'tri-wrapper';
        wrapper.style.cssText = `
            transform-style: preserve-3d;
            transform-origin: center center;
            transition: transform 0.05s ease-out;
            position: relative;
            width: 0; height: 0;
        `;
        this.scene.appendChild(wrapper);
        this.wrapper = wrapper;

        // Dimensões reais do config
        const baseW = this.config.folha.largura;           // 215mm
        const faceH = this.config.triangular.segmentos[0].altura; // 127.5mm
        const folhaW = this.config.triangular.folha.largura; // 215mm
        const folhaH = this.config.triangular.folha.altura;  // 105mm
        const S = 1.7; // escala

        // ── FACE FRENTE ──
        const faceFront = document.createElement('div');
        faceFront.className = 'tri-face-front';
        faceFront.id = 'tri-face-front';
        faceFront.style.cssText = `
            position: absolute;
            width: ${baseW * S}px;
            height: ${faceH * S}px;
            transform-origin: top center;
            transform: rotateX(5deg);
            background: linear-gradient(160deg, #e0e0d8, #d0d0c8);
            border: 1px solid #bbb;
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
            display: flex; align-items: flex-start; justify-content: center;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        `;
        wrapper.appendChild(faceFront);
        this.faceFront = faceFront;

        // ── FACE VERSO (por trás, ligeiramente deslocada) ──
        const faceBack = document.createElement('div');
        faceBack.className = 'tri-face-back';
        faceBack.id = 'tri-face-back';
        faceBack.style.cssText = `
            position: absolute;
            width: ${baseW * S}px;
            height: ${faceH * S}px;
            transform-origin: top center;
            transform: rotateX(-15deg) translateZ(${-30 * S}px);
            background: linear-gradient(160deg, #c8c8c0, #b8b8b0);
            border: 1px solid #aaa;
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
            overflow: hidden;
        `;
        wrapper.appendChild(faceBack);
        this.faceBack = faceBack;

        // ── BASE (retângulo inferior que dá profundidade) ──
        const baseEl = document.createElement('div');
        baseEl.className = 'tri-base';
        baseEl.style.cssText = `
            position: absolute;
            width: ${baseW * S * 0.92}px;
            height: ${35 * S}px;
            left: ${baseW * S * 0.04}px;
            top: ${faceH * S - 2}px;
            background: linear-gradient(180deg, #d0d0c8, #c0c0b8);
            border: 1px solid #bbb;
            border-top: none;
            border-radius: 0 0 4px 4px;
            z-index: -1;
        `;
        wrapper.appendChild(baseEl);
        this.baseEl = baseEl;

        // ── FOLHA PENDURADA ──
        const sheetContainer = document.createElement('div');
        sheetContainer.className = 'tri-sheet';
        sheetContainer.id = 'tri-sheet';
        const sheetW = folhaW * S * 0.94;
        const sheetH = folhaH * S;
        const sheetX = (baseW * S - sheetW) / 2;
        const sheetY = 6 * S; // próximo do topo (apex do triângulo)
        sheetContainer.style.cssText = `
            position: absolute;
            width: ${sheetW}px;
            height: ${sheetH}px;
            left: ${sheetX}px;
            top: ${sheetY}px;
            background: #f5f5f0;
            border: 1px solid #ccc;
            border-radius: 2px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            overflow: hidden;
            z-index: 10;
        `;
        this.sheetImg = document.createElement('img');
        this.sheetImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        if (this.carregado && this.imagens[0]) this.sheetImg.src = this.imagens[0].src;
        sheetContainer.appendChild(this.sheetImg);
        faceFront.appendChild(sheetContainer);
        this.sheetContainer = sheetContainer;

        // ── FUROS DAS ARGOLAS ──
        const argolas = this.config.folha.argolas;
        if (argolas) {
            const qtd = argolas.quantidade;
            const esp = argolas.espacamento;
            const inicio = argolas.inicio;
            for (let i = 0; i < qtd; i++) {
                const cx = (inicio + i * esp) * S;
                const cy = argolas.margemTopo * S;
                const ring = document.createElement('div');
                ring.style.cssText = `
                    position: absolute;
                    width: ${argolas.diametro * 1.6}px;
                    height: ${argolas.diametro * 1.6}px;
                    left: ${cx - argolas.diametro * 0.8}px;
                    top: ${cy - argolas.diametro * 0.8}px;
                    border: 2px solid #999;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    z-index: 20;
                    box-shadow: inset 0 0 4px rgba(0,0,0,0.25);
                `;
                faceFront.appendChild(ring);
            }
        }

        // ── SOMBRA ──
        const shadow = document.createElement('div');
        shadow.style.cssText = `
            position: absolute;
            width: ${baseW * S * 0.5}px;
            height: ${50 * S}px;
            left: ${baseW * S * 0.25}px;
            top: ${(faceH + 20) * S}px;
            background: rgba(0,0,0,0.12);
            border-radius: 50%;
            filter: blur(20px);
            z-index: -2;
        `;
        wrapper.appendChild(shadow);

        // ── ELEMENTOS DESIGNER ──
        this.elementosDesigner = [];
        const labelFrente = document.createElement('div');
        labelFrente.textContent = 'FACE FRENTE 215×127.5';
        labelFrente.style.cssText = `
            position: absolute; left: 50%; top: 60%;
            transform: translate(-50%, -50%);
            font-size: 13px; font-weight: bold; color: #ff0000;
            z-index: 30; display: none; pointer-events: none;
            background: rgba(255,255,255,0.7); padding: 2px 8px;
            border-radius: 3px;
        `;
        wrapper.appendChild(labelFrente);
        this.elementosDesigner.push(labelFrente);

        const labelVerso = document.createElement('div');
        labelVerso.textContent = 'FACE VERSO 215×127.5';
        labelVerso.style.cssText = `
            position: absolute; left: 50%; top: 20%;
            transform: translate(-50%, -50%);
            font-size: 13px; font-weight: bold; color: #ff6600;
            z-index: 30; display: none; pointer-events: none;
            background: rgba(255,255,255,0.7); padding: 2px 8px;
            border-radius: 3px;
        `;
        wrapper.appendChild(labelVerso);
        this.elementosDesigner.push(labelVerso);
    }

    configurarEventos() {
        // Rotação com arrastar do rato
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.container.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.dragStartX;
                const deltaY = e.clientY - this.dragStartY;
                this.rotacaoY += deltaX * 0.3;
                this.rotacaoX += deltaY * 0.2;
                this.rotacaoX = Math.max(-30, Math.min(60, this.rotacaoX));
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.aplicarTransformacao();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.container.style.cursor = 'default';
        });

        // Zoom com roda
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoomAtual = Math.max(30, Math.min(300, this.zoomAtual - e.deltaY * 0.1));
            this.aplicarTransformacao();
        });

        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    aplicarTransformacao() {
        if (!this.wrapper) return;
        const scale = this.zoomAtual / 100;
        this.wrapper.style.transform = `
            rotateX(${this.rotacaoX}deg)
            rotateY(${this.rotacaoY}deg)
            scale(${scale})
        `;
    }

    setMes(mes) {
        if (mes >= 0 && mes < 12) {
            this.mesAtual = mes;
            if (this.carregado && this.imagens[mes]) {
                this.sheetImg.src = this.imagens[mes].src;
            }
            if (this.onChange) this.onChange();
        }
    }

    proximoMes() {
        this.setMes((this.mesAtual + 1) % 12);
    }

    mesAnterior() {
        this.setMes((this.mesAtual - 1 + 12) % 12);
    }

    getNomeMes() { return this.config.meses[this.mesAtual]; }

    alternarModoDesigner() {
        this.modoDesigner = !this.modoDesigner;
        this.elementosDesigner.forEach(el => {
            el.style.display = this.modoDesigner ? 'block' : 'none';
        });
        // Bordas nas faces
        if (this.faceFront) {
            this.faceFront.style.border = this.modoDesigner ? '2px dashed #ff0000' : '1px solid #bbb';
        }
        if (this.faceBack) {
            this.faceBack.style.border = this.modoDesigner ? '2px dashed #ff6600' : '1px solid #aaa';
        }
        return this.modoDesigner;
    }

    alternarImagemFundo() {
        // Não aplicável à vista 3D
        return false;
    }

    reset() {
        this.rotacaoX = 15;
        this.rotacaoY = -20;
        this.zoomAtual = 100;
        this.aplicarTransformacao();
    }

    calcularZoomAuto() {
        this.zoomAtual = 100;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = ViewerTriangle;
