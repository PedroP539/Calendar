/**
 * Configuração do Calendário de Parede
 * Todas as dimensões e posições centralizadas neste ficheiro
 */

const CONFIG = {
    // Dimensões da folha base (em mm)
    folha: {
        largura: 335,
        altura: 835,
        furo: {
            diametro: 5,
            centroTopo: 20,
            centradoHorizontalmente: true
        }
    },

    // Dimensões dos macetes (em mm)
    macete: {
        largura: 335,
        altura: 165
    },

    // Dimensões das zonas dos macetes (em mm)
    zona: {
        largura: 335,
        altura: 205,
        margemSuperior: 20,
        margemInferior: 20,
        separador: 5
    },

    // Posição das zonas na folha (em mm)
    // Folha: 835mm, de cima para baixo:
    // 0-205mm: Imagem principal
    // 205-210mm: Vinco (5mm)
    // 210-415mm: Macete 1 (205mm)
    // 415-420mm: Vinco (5mm)
    // 420-625mm: Macete 2 (205mm)
    // 625-630mm: Vinco (5mm)
    // 630-835mm: Macete 3 (205mm)
    zonas: [
        {
            id: 1,
            nome: 'MACETE 1',
            topo: 190,
            esquerda: 0
        },
        {
            id: 2,
            nome: 'MACETE 2',
            topo: 400,
            esquerda: 0
        },
        {
            id: 3,
            nome: 'MACETE 3',
            topo: 610,
            esquerda: 0
        }
    ],

    // Margem inferior da folha (para centralizar o último macete)
    margemInferior: 10,

    // Zona da imagem principal
    imagemPrincipal: {
        topo: 30,
        altura: 195,
        largura: 335,
        esquerda: 0
    },

    // Nomes dos meses
    meses: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ],

    // Configuração de zoom
    zoom: {
        min: 10,
        max: 400,
        passo: 10,
        padrao: 'auto' // 'auto' calcula para caber no ecrã
    },

    // Configuração de rotação 3D
    rotacao3D: {
        enabled: true,
        rotacaoX: 10,
        rotacaoY: 0,
        sensibilidade: 0.03,
        maxRotacaoX: 25,
        maxRotacaoY: 25,
        parallaxEnabled: true,
        parallaxIntensity: 0.5
    },

    // Cores CMYK convertidas para RGB
    cores: {
        // CMYK 6, 6, 10, 10 -> RGB approximately (216, 216, 207)
        costasCalendario: 'rgb(216, 216, 207)',
        fundoParede: 'rgb(216, 216, 207)'
    },

    // Configuração de sombra parede
    sombraParede: {
        enabled: true,
        cor: 'rgba(0, 0, 0, 0.2)',
        blur: 40,
        spread: 8,
        offsetX: 12,
        offsetY: 12
    },

    // Configuração de animação
    animacao: {
        duracao: 800,
        tipo: 'dissolve'
    },

    // Caminhos dos assets (para o primeiro calendário)
    assets: {
        folhaBase: 'assets/folha_base.png',
        mostrarFolhaBase: true,
        macetes: [
            'assets/macete1',
            'assets/macete2',
            'assets/macete3'
        ]
    },

    // Múltiplos calendários
    calendarios: [
        {
            nome: 'Calendário 1',
            assets: {
                folhaBase: 'assets/folha_base.png',
                macetes: ['assets/macete1', 'assets/macete2', 'assets/macete3']
            }
        },
        {
            nome: 'Calendário 2',
            assets: {
                folhaBase: 'assets/folha_base_calendario2.png',
                macetes: ['assets/calendario2/macete1', 'assets/calendario2/macete2', 'assets/calendario2/macete3']
            }
        }
    ],

    // Configuração do modo designer
    designer: {
        mostrarGrelha: false,
        corLimites: '#ff0000',
        corFuro: '#00ff00',
        corGrelha: '#cccccc'
    }
};

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
