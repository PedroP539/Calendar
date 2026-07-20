# Calendário de Parede - Mockup Interativo

Aplicação HTML/CSS/JavaScript para revisão de design de calendário de parede.

## Estrutura do Projeto

```
calendar/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── viewer.js
│   ├── macete.js
│   ├── ui.js
│   └── config.js
└── assets/
    ├── folha_base.png
    ├── macete1/
    │   ├── macete1.png
    │   ├── macete2.png
    │   └── ...
    ├── macete2/
    │   ├── macete1.png
    │   ├── macete2.png
    │   └── ...
    └── macete3/
        ├── macete1.png
        ├── macete2.png
        └── ...
```

## Como Usar

### 1. Colocar as Imagens

Coloque as imagens nas pastas correspondentes:

- **Folha base**: `assets/folha_base.png`
- **Macete 1**: `assets/macete1/macete1.png` a `assets/macete1/macete12.png`
- **Macete 2**: `assets/macete2/macete1.png` a `assets/macete2/macete12.png`
- **Macete 3**: `assets/macete3/macete1.png` a `assets/macete3/macete12.png`

Os ficheiros devem ser nomeados com o prefixo "macete" seguido do número (macete1.png a macete12.png).

### 2. Abrir a Aplicação

Basta abrir o ficheiro `index.html` num navegador moderno.

Não requer servidor web - funciona localmente (offline).

## Funcionalidades

### Navegação de Macetes

- **Botões ◀ ▶**: Navegar mês a mês
- **Dropdown**: Selecionar diretamente qualquer mês
- **Independência**: Cada macete funciona de forma autónoma

### Zoom

- **Roda do rato**: Zoom in/out
- **Botões + -**: Zoom controlado
- **Ctrl + 0**: Reset zoom
- **Range**: 10% a 400%
- **Auto**: Ajusta automaticamente para caber no ecrã ao iniciar

### Pan (Arrastar)

- **Botão esquerdo + arrastar**: Mover a vista (pan)
- Funciona a qualquer nível de zoom

### Rotação 3D e Parallax

- **Movimento do rato**: Efeito parallax automático e suave
- **Botão direito + arrastar**: Rotação manual controlada
- **Botão Reset Rotação**: Voltar à posição original
- Permite visualizar o calendário de diferentes ângulos
- Rotação limitada (±25°) para nunca perder o layout
- Efeito parallax segue o movimento do rato de forma dinâmica
- Interpolação suave para transições naturais

### Fullscreen

- **Botão Fullscreen**: Alternar modo ecrã completo
- **Tecla F**: Atalho para fullscreen

### Modo Designer

- **Botão Modo Designer**: Mostra limites e grelha
- **Tecla D**: Atalho para modo designer
- Mostra:
  - Limites da folha
  - Limites dos macetes
  - Centro do furo
  - Grelha de 10mm

### Imagem de Fundo

- **Botão Imagem Fundo**: Alterna a visibilidade da imagem de fundo
- **Botão Carregar Fundo**: Permite carregar uma imagem de fundo do seu computador
- Permite revisar o design com ou sem a folha base
- Útil para verificar apenas o posicionamento dos macetes
- Formatos suportados: PNG, JPG, GIF, etc.

### Atalhos de Teclado Adicionais

- **R**: Reset rotação 3D
- **F**: Fullscreen
- **D**: Modo Designer
- **Ctrl + 0**: Reset vista completa

## Arquitetura

### Módulos JavaScript

- **config.js**: Todas as configurações e dimensões
- **macete.js**: Gestão individual de cada macete
- **viewer.js**: Visualização da folha base e transformações
- **ui.js**: Painel de controle e interface
- **app.js**: Ponto de entrada e orquestração

### Configuração

Todas as posições e dimensões estão centralizadas em `config.js`.

Para ajustar:
- Dimensões da folha
- Posição das zonas
- Tamanho do furo
- Configurações de zoom
- Cores do modo designer

## Especificações Técnicas

### Dimensões

- **Folha base**: 335mm × 835mm
- **Macetes**: 335mm × 165mm
- **Zonas**: 335mm × 195mm
- **Furo**: 5mm diâmetro, centro a 20mm do topo

### Cores

- **Costas dos calendários**: CMYK 6, 6, 10, 10 (RGB: 216, 216, 207)
- **Fundo parede**: CMYK 6, 6, 10, 10 (RGB: 216, 216, 207)
- Sombras configuradas para efeito de parede realista

### Tecnologias

- HTML5
- CSS3
- JavaScript ES6
- Sem dependências externas

### Compatibilidade

- Desktop (Chrome, Firefox, Safari, Edge)
- Tablet (iOS Safari, Chrome Android)

## Animações

Efeito de "flip page" ao mudar de mês:
- Simula a virar de uma página real
- Transição suave em 3D com rotação de 120°
- Flip no canto inferior direito para realismo
- Costas dos calendários visíveis durante a animação (cor CMYK 6,6,10,10)
- Pode ser alterado para fade ou slide no config.js

## Notas

- As imagens são carregadas automaticamente das pastas
- Não é necessário editar código para mudar PNGs
- A aplicação mantém a proporção da folha base
- Funciona completamente offline
- O macete 3 é posicionado com margem inferior para centragem
- A sensibilidade da rotação 3D foi ajustada para movimentos muito suaves
- As cores seguem a especificação CMYK 6, 6, 10, 10
- A sombra da parede dá um efeito realista de calendário pendurado
