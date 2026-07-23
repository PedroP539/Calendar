const TRIANGLE_CONFIG = {
  width: 215,
  frontPanel: 127.5,
  backPanel: 127.5,
  aba1: 30,
  aba2: 30,
  sheetWidth: 215,
  sheetHeight: 105,

  get baseTotal() {
    return this.aba1 + this.aba2;
  },
  get halfBase() {
    return this.baseTotal / 2;
  },
  get assembledHeight() {
    return Math.sqrt(this.frontPanel ** 2 - this.halfBase ** 2);
  },
  get panelAngleRad() {
    return Math.acos(this.halfBase / this.frontPanel);
  },
  get panelAngleDeg() {
    return this.panelAngleRad * 180 / Math.PI;
  },

  rings: {
    count: 3,
    diameter: 8,
    wireDiameter: 1.5,
    widthPercentage: 0.95,
    marginTop: 8
  },

  meses: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],

  scale: 0.04,

  camera: {
    initialPosition: [8, 5, 10],
    target: [0, 1.5, 0]
  }
};
