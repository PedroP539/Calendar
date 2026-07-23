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
        // Container 3D
        this.scene = document.createElement('div');
        this.scene.className = 'tri-scene';
        this.scene.style.cssText = `
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            perspective: 1200px;
            perspective-origin: 50% 40%;
        `;
        this.container.appendChild(this.scene);

        // Wrapper 3D que vai ser rodado
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

        // Dimensões base (escala para caber no ecrã)
        const baseW = this.config.folha.largura;     // 215mm
        const faceH = this.config.triangular.segmentos[0].altura; // 127.5mm
        const folhaH = this.config.triangular.folha.altura; // 105mm
        const S = 1.8; // scale factor para visualização

        // ── FACE FRENTE (triângulo, lado visível) ──
        const faceFront = document.createElement('div');
        faceFront.className = 'tri-face-front';
        faceFront.id = 'tri-face-front';
        faceFront.style.cssText = `
            position: absolute;
            width: ${baseW * S}px;
            height: ${faceH * S}px;
            transform-origin: top center;
            background: #d8d8d0;
            border: 1px solid #bbb;
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
            display: flex; align-items: flex-start; justify-content: center;
            overflow: hidden;
        `;
        wrapper.appendChild(faceFront);
        this.faceFront = faceFront;

        // ── FACE VERSO (triângulo, lado direito em perspectiva) ──
        const faceBack = document.createElement('div');
        faceBack.className = 'tri-face-back';
        faceBack.id = 'tri-face-back';
        const profundidade = faceH * S * 0.5; // profundidade do triângulo
        faceBack.style.cssText = `
            position: absolute;
            width: ${baseW * S}px;
            height: ${faceH * S}px;
            transform-origin: top center;
            background: #c8c8c0;
            border: 1px solid #aaa;
            clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
            overflow: hidden;
        `;
        // Posicionar atrás: rotateX(180deg) + translateZ
        // A face de trás é a imagem espelhada da frente
        // A base do triângulo tem profundidade = altura * tan(30°)... 
        // Simplificando: a face de trás está a profundidade atrás
        wrapper.appendChild(faceBack);
        this.faceBack = faceBack;

        // ── ABA BASE (parte inferior da base triangular) ──
        const base = document.createElement('div');
        base.className = 'tri-base';
        base.style.cssText = `
            position: absolute;
            width: ${baseW * S * 0.25}px;
            height: ${30 * S}px;
            transform-origin: top center;
            background: #d0d0c8;
            border: 1px solid #bbb;
            border-top: none;
            left: ${baseW * S * 0.375}px;
            top: ${faceH * S}px;
            border-radius: 0 0 3px 3px;
        `;
        wrapper.appendChild(base);
        this.base = base;

        // ── FOLHA PENDURADA (mês atual) ──
        const sheetContainer = document.createElement('div');
        sheetContainer.className = 'tri-sheet';
        sheetContainer.id = 'tri-sheet';
        sheetContainer.style.cssText = `
            position: absolute;
            width: ${baseW * S * 0.88}px;
            height: ${folhaH * S}px;
            left: ${baseW * S * 0.06}px;
            top: ${15 * S}px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 2px;
            box-shadow: 2px 4px 12px rgba(0,0,0,0.15);
            overflow: hidden;
            z-index: 10;
        `;
        // Imagem da folha
        this.sheetImg = document.createElement('img');
        this.sheetImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        if (this.carregado && this.imagens[0]) this.sheetImg.src = this.imagens[0].src;
        sheetContainer.appendChild(this.sheetImg);
        faceFront.appendChild(sheetContainer);
        this.sheetContainer = sheetContainer;

        // ── ARGOLAS ──
        const argolas = this.config.folha.argolas;
        if (argolas) {
            const qtd = argolas.quantidade || 3;
            const esp = (baseW * S * 0.6) / (qtd - 1);
            const inicio = baseW * S * 0.2;
            for (let i = 0; i < qtd; i++) {
                const ring = document.createElement('div');
                ring.className = 'tri-ring';
                const x = inicio + i * esp;
                ring.style.cssText = `
                    position: absolute;
                    width: ${argolas.diametro * S * 1.2}px;
                    height: ${argolas.diametro * S * 1.2}px;
                    left: ${x - argolas.diametro * S * 0.6}px;
                    top: ${-argolas.diametro * S * 0.8}px;
                    border: 2px solid #999;
                    border-radius: 50%;
                    background: none;
                    z-index: 20;
                    box-shadow: inset 0 0 3px rgba(0,0,0,0.2);
                `;
                faceFront.appendChild(ring);
            }
        }

        // ── SOMBRA ──
        const shadow = document.createElement('div');
        shadow.className = 'tri-shadow';
        shadow.style.cssText = `
            position: absolute;
            width: ${baseW * S * 0.6}px;
            height: ${40 * S}px;
            left: ${baseW * S * 0.2}px;
            top: ${(faceH + 25) * S}px;
            background: rgba(0,0,0,0.15);
            border-radius: 50%;
            filter: blur(15px);
            z-index: -1;
        `;
        wrapper.appendChild(shadow);

        // ── ELEMENTOS DESIGNER ──
        this.elementosDesigner = [];

        // Labels dos lados
        const labelFrente = document.createElement('div');
        labelFrente.textContent = 'FACE FRENTE';
        labelFrente.style.cssText = `
            position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
            font-size: 14px; font-weight: bold; color: #ff0000; z-index: 30;
            display: none; pointer-events: none;
        `;
        wrapper.appendChild(labelFrente);
        this.elementosDesigner.push(labelFrente);
        this.labelFrente = labelFrente;

        const labelVerso = document.createElement('div');
        labelVerso.textContent = 'FACE VERSO';
        labelVerso.style.cssText = `
            position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
            font-size: 14px; font-weight: bold; color: #ff6600; z-index: 30;
            display: none; pointer-events: none;
        `;
        wrapper.appendChild(labelVerso);
        this.elementosDesigner.push(labelVerso);
        this.labelVerso = labelVerso;
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
