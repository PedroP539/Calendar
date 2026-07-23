const CONFIG = {
    formato: 'triangle',
    nome: 'Calendário Triangular (215×315 base)',
    folha: {
        largura: 215,
        altura: 315,
        argolas: {
            quantidade: 3,
            diametro: 5,
            margemTopo: 8,
            espacamento: 65,
            inicio: 42
        }
    },
    triangular: {
        segmentos: [
            { nome: 'FACE FRENTE', largura: 215, altura: 127.5, tipo: 'face' },
            { nome: 'ABA 1', largura: 215, altura: 30, tipo: 'aba' },
            { nome: 'ABA 2', largura: 215, altura: 30, tipo: 'aba' },
            { nome: 'FACE VERSO', largura: 215, altura: 127.5, tipo: 'face' }
        ],
        folha: {
            largura: 215,
            altura: 105,
            furo: { diametro: 5, distanciaTopo: 8 }
        },
        quantidadeFolhas: 13
    },
    macete: {
        largura: 195,
        altura: 85
    },
    zona: {
        largura: 195,
        altura: 85,
        margemSuperior: 10,
        margemInferior: 10,
        separador: 0
    },
    zonas: [{
        id: 1,
        nome: 'FOLHA MÊS',
        topo: 215,
        esquerda: 10
    }],
    margemInferior: 10,
    meses: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril',
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    zoom: { min: 10, max: 400, passo: 10, padrao: 'auto' },
    rotacao3D: {
        enabled: true, rotacaoX: 0, rotacaoY: 0,
        sensibilidade: 0.03, maxRotacaoX: 25, maxRotacaoY: 25,
        parallaxEnabled: true, parallaxIntensity: 0.5
    },
    cores: {
        costasCalendario: 'rgb(216, 216, 207)',
        fundoParede: 'rgb(216, 216, 207)'
    },
    sombraParede: {
        enabled: true, cor: 'rgba(0, 0, 0, 0.2)',
        blur: 30, spread: 6, offsetX: 10, offsetY: 10
    },
    animacao: { duracao: 800, tipo: 'dissolve' },
    assets: {
        folhaBase: 'assets/triangle/folha_base.png',
        mostrarFolhaBase: true,
        macetes: ['assets/triangle/macete']
    },
    calendarios: [{
        nome: 'Triangular FL',
        assets: {
            folhaBase: 'assets/triangle/folha_base.png',
            macetes: ['assets/triangle/macete']
        }
    }],
    designer: {
        mostrarGrelha: false, corLimites: '#ff0000',
        corFuro: '#00ff00', corGrelha: '#cccccc',
        corVinco: '#ff0000',
        corDobra: '#ff6600'
    }
};
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
