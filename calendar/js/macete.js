class Macete {
    constructor(id, zonaConfig, config) {
        this.id = id;
        this.zonaConfig = zonaConfig;
        this.config = config;
        this.mesAtual = 0;
        this.imagens = [];
        this.elemento = null;
        this.imgBottom = null;
        this.imgTop = null;
        this.stackEl = null;
        this.carregado = false;
        this.aTransitar = false;
        this.onChange = null;
    }

    async carregarImagens(paths) {
        const pastaBase = (paths || this.config.assets.macetes)[this.id - 1];
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
                this.imagens.push(new Image());
            }
        }
        this.carregado = true;
    }

    async recarregarImagens(paths) {
        this.imagens = [];
        for (let i = 0; i < 12; i++) {
            const caminho = `${paths[this.id - 1]}/macete${i + 1}.png`;
            try {
                const img = new Image();
                img.src = caminho;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                this.imagens.push(img);
            } catch {
                this.imagens.push(new Image());
            }
        }
        this.carregado = true;
        this._mostrarMes(this.mesAtual);
    }

    setMes(mes) {
        if (mes >= 0 && mes < 12 && !this.aTransitar) {
            this.mesAtual = mes;
            this._transitarPara(mes);
        }
    }

    proximoMes() {
        if (this.aTransitar) return;
        this.mesAtual = (this.mesAtual + 1) % 12;
        this._transitarPara(this.mesAtual);
    }

    mesAnterior() {
        if (this.aTransitar) return;
        this.mesAtual = (this.mesAtual - 1 + 12) % 12;
        this._transitarPara(this.mesAtual);
    }

    getNomeMes() { return this.config.meses[this.mesAtual]; }

    _transitarPara(mes) {
        if (this.aTransitar) return;
        const imgNova = this.imagens[mes];
        if (!imgNova || !imgNova.complete) {
            this._mostrarMes(mes);
            return;
        }

        this.aTransitar = true;

        // Camada de cima recebe a nova imagem; camada de baixo mantém a atual
        this.imgTop.src = imgNova.src;
        this.imgTop.style.opacity = '0';

        // Força reflow para a transição aplicar
        void this.imgTop.offsetWidth;

        const duracao = (this.config.animacao.duracao || 800) + 'ms';
        this.imgTop.style.transition = `opacity ${duracao} ease`;
        this.imgBottom.style.transition = `opacity ${duracao} ease`;

        requestAnimationFrame(() => {
            this.imgTop.style.opacity = '1';
            this.imgBottom.style.opacity = '0';
        });

        clearTimeout(this._transicaoTimer);
        this._transicaoTimer = setTimeout(() => {
            // A nova imagem passa para a camada de baixo (base)
            this.imgBottom.src = imgNova.src;
            this.imgBottom.style.opacity = '1';
            this.imgTop.style.opacity = '0';
            this.imgTop.style.transition = 'none';
            this.imgBottom.style.transition = 'none';
            this.aTransitar = false;
            if (this.onChange) this.onChange();
        }, this.config.animacao.duracao || 800);

        if (this.onChange) this.onChange();
    }

    _mostrarMes(mes) {
        const img = this.imagens[mes];
        if (this.imgBottom && img) this.imgBottom.src = img.src;
        if (this.imgTop && img) this.imgTop.src = img.src;
    }

    /* Stacking visual - 12 páginas empilhadas com offset */
    _criarStack() {
        const container = document.createElement('div');
        container.className = 'macete-stack';
        container.style.cssText = `
            position:absolute;left:0;top:0;
            width:${this.config.macete.largura}mm;
            height:${this.config.macete.altura}mm;
        `;

        for (let i = 11; i >= 0; i--) {
            const folha = document.createElement('div');
            folha.className = 'macete-folha';
            const offset = i * 0.9;
            folha.style.cssText = `
                position:absolute;top:0;left:0;
                width:100%;height:100%;
                transform:translateY(${offset}px);
                background:linear-gradient(160deg, #d8d8d0, #d0d0c8);
                border-radius:1px;
                z-index:${i};
                box-shadow:4px 4px 0 rgba(0,0,0,0.2);
            `;
            container.appendChild(folha);
        }

        return container;
    }

    criarElemento() {
        const zona = document.createElement('div');
        zona.className = 'macete-zona';
        zona.id = `macete-zona-${this.id}`;
        zona.style.cssText = `
            position:absolute;
            left:${this.zonaConfig.esquerda}mm;
            top:${this.zonaConfig.topo}mm;
            width:${this.config.zona.largura}mm;
            height:${this.config.zona.altura}mm;
        `;

        const centro = document.createElement('div');
        centro.style.cssText = `
            display:flex;align-items:center;justify-content:center;
            width:100%;height:100%;
        `;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position:relative;
            width:${this.config.macete.largura}mm;
            height:${this.config.macete.altura}mm;
        `;

        // Stack visual (12 páginas empilhadas)
        const stack = this._criarStack();
        this.stackEl = stack;
        wrapper.appendChild(stack);

        // Duas camadas de imagem para crossfade (abaixo = base, cima = transição)
        const imgCss = `
            position:absolute;top:0;left:0;
            width:100%;height:100%;
            object-fit:contain;display:block;
            pointer-events:none;z-index:12;
        `;

        const imgBottom = document.createElement('img');
        imgBottom.className = 'macete-imagem';
        imgBottom.draggable = false;
        if (this.carregado && this.imagens[0]) imgBottom.src = this.imagens[0].src;
        imgBottom.style.cssText = imgCss + 'opacity:1;';
        this.imgBottom = imgBottom;
        wrapper.appendChild(imgBottom);

        const imgTop = document.createElement('img');
        imgTop.className = 'macete-imagem';
        imgTop.draggable = false;
        if (this.carregado && this.imagens[0]) imgTop.src = this.imagens[0].src;
        imgTop.style.cssText = imgCss + 'opacity:0;';
        this.imgTop = imgTop;
        wrapper.appendChild(imgTop);

        centro.appendChild(wrapper);
        zona.appendChild(centro);

        // Clique avança mês
        zona.addEventListener('click', (e) => {
            e.stopPropagation();
            this.proximoMes();
        });

        this.elemento = zona;
        return zona;
    }

    getElemento() { return this.elemento; }
    isCarregado() { return this.carregado; }
}

if (typeof module !== 'undefined' && module.exports) module.exports = Macete;
