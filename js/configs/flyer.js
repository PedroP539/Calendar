const CONFIG = {
    formato: 'flyer',
    nome: 'Flyer Tríptico A4 (210×297)',
    folha: {
        largura: 210,
        altura: 297
    },
    flyer: {
        paineis: [
            { id: 1, nome: 'Capa (frente dir.)', topo: 0, esquerda: 140, largura: 70, altura: 297, tipo: 'frente' },
            { id: 2, nome: 'Interior centro', topo: 0, esquerda: 70, largura: 70, altura: 297, tipo: 'frente' },
            { id: 3, nome: 'Contracapa (frente esq.)', topo: 0, esquerda: 0, largura: 70, altura: 297, tipo: 'frente' },
            { id: 4, nome: 'Verso capa (verso esq.)', topo: 0, esquerda: 0, largura: 70, altura: 297, tipo: 'verso' },
            { id: 5, nome: 'Verso centro', topo: 0, esquerda: 70, largura: 70, altura: 297, tipo: 'verso' },
            { id: 6, nome: 'Verso contracapa (verso dir.)', topo: 0, esquerda: 140, largura: 70, altura: 297, tipo: 'verso' }
        ],
        vincos: [
            { posicao: 70, tipo: 'vertical' },
            { posicao: 140, tipo: 'vertical' }
        ]
    },
    macete: {
        largura: 60,
        altura: 277
    },
    zona: {
        largura: 60,
        altura: 277,
        margemSuperior: 10,
        margemInferior: 10,
        separador: 0
    },
    zonas: [
        { id: 1, nome: 'PAINEL 1', topo: 10, esquerda: 145 },
        { id: 2, nome: 'PAINEL 2', topo: 10, esquerda: 75 },
        { id: 3, nome: 'PAINEL 3', topo: 10, esquerda: 5 }
    ],
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
        costasCalendario: 'rgb(255, 255, 255)',
        fundoParede: 'rgb(216, 216, 207)'
    },
    sombraParede: {
        enabled: true, cor: 'rgba(0, 0, 0, 0.2)',
        blur: 30, spread: 6, offsetX: 10, offsetY: 10
    },
    animacao: { duracao: 800, tipo: 'dissolve' },
    assets: {
        folhaBase: 'assets/flyer/folha_base.png',
        mostrarFolhaBase: true,
        macetes: ['assets/flyer/macete']
    },
    calendarios: [{
        nome: 'Flyer FL',
        assets: {
            folhaBase: 'assets/flyer/folha_base.png',
            macetes: ['assets/flyer/macete']
        }
    }],
    designer: {
        mostrarGrelha: false, corLimites: '#ff0000',
        corFuro: '#00ff00', corGrelha: '#cccccc',
        corVinco: '#ff0000',
        mostrarPainelInfo: true
    }
};
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
