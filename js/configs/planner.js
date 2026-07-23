const CONFIG = {
    formato: 'planner',
    nome: 'Planner Mesa (480×330)',
    folha: {
        largura: 480,
        altura: 330,
        argolas: {
            quantidade: 5,
            diametro: 5,
            margemTopo: 12,
            espacamento: 80,
            inicio: 55
        }
    },
    macete: {
        largura: 460,
        altura: 290
    },
    zona: {
        largura: 460,
        altura: 290,
        margemSuperior: 15,
        margemInferior: 15,
        separador: 0
    },
    zonas: [{
        id: 1,
        nome: 'PLANNER',
        topo: 25,
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
        enabled: true, rotacaoX: -15, rotacaoY: -5,
        sensibilidade: 0.03, maxRotacaoX: 25, maxRotacaoY: 25,
        parallaxEnabled: true, parallaxIntensity: 0.5
    },
    cores: {
        costasCalendario: 'rgb(216, 216, 207)',
        fundoParede: 'rgb(216, 216, 207)'
    },
    sombraParede: {
        enabled: true, cor: 'rgba(0, 0, 0, 0.2)',
        blur: 60, spread: 12, offsetX: 15, offsetY: 15
    },
    animacao: { duracao: 800, tipo: 'dissolve' },
    assets: {
        folhaBase: 'assets/planner/folha_base.png',
        mostrarFolhaBase: true,
        macetes: ['assets/planner/macete']
    },
    calendarios: [{
        nome: 'Planner FL',
        assets: {
            folhaBase: 'assets/planner/folha_base.png',
            macetes: ['assets/planner/macete']
        }
    }],
    designer: {
        mostrarGrelha: false, corLimites: '#ff0000',
        corFuro: '#00ff00', corGrelha: '#cccccc'
    }
};
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
