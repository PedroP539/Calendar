const CONFIG = {
    formato: 'wall-fl',
    nome: 'Calendário Parede FL (330×480)',
    folha: {
        largura: 330,
        altura: 480,
        argolas: {
            quantidade: 4,
            diametro: 6,
            margemTopo: 14,
            espacamento: 60,
            inicio: 55
        }
    },
    macete: {
        largura: 310,
        altura: 440
    },
    zona: {
        largura: 310,
        altura: 440,
        margemSuperior: 20,
        margemInferior: 20,
        separador: 0
    },
    zonas: [{
        id: 1,
        nome: 'CALENDÁRIO',
        topo: 30,
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
        enabled: true, rotacaoX: 8, rotacaoY: 0,
        sensibilidade: 0.03, maxRotacaoX: 25, maxRotacaoY: 25,
        parallaxEnabled: true, parallaxIntensity: 0.5
    },
    cores: {
        costasCalendario: 'rgb(216, 216, 207)',
        fundoParede: 'rgb(216, 216, 207)'
    },
    sombraParede: {
        enabled: true, cor: 'rgba(0, 0, 0, 0.2)',
        blur: 40, spread: 8, offsetX: 12, offsetY: 12
    },
    animacao: { duracao: 800, tipo: 'dissolve' },
    assets: {
        folhaBase: 'assets/wall-fl/folha_base.png',
        mostrarFolhaBase: true,
        macetes: ['assets/wall-fl/macete']
    },
    calendarios: [{
        nome: 'Calendário FL',
        assets: {
            folhaBase: 'assets/wall-fl/folha_base.png',
            macetes: ['assets/wall-fl/macete']
        }
    }],
    designer: {
        mostrarGrelha: false, corLimites: '#ff0000',
        corFuro: '#00ff00', corGrelha: '#cccccc'
    }
};
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
