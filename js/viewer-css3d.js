class ViewerCSS3D {
  constructor(container, config) {
    this.cfg = config;
    this.s = 2;
    this.monthIndex = new Date().getMonth();
    this.year = new Date().getFullYear();
    this.isFlipping = false;
    this._drag = { active: false, lastX: 0, lastY: 0 };
    this._rotX = -10;
    this._rotY = -25;

    this._build(container);
    this._attachEvents(container);
    this._render();
  }

  _build(container) {
    const s = this.s;
    const w = this.cfg.width * s;
    const sh = this.cfg.sheetHeight * s;
    const fh = this.cfg.frontPanel * s;
    const hb = this.cfg.halfBase * s;
    const ah = this.cfg.assembledHeight * s;
    const bt = this.cfg.baseTotal * s;
    const tiltDeg = this.cfg.panelAngleDeg;

    container.innerHTML = '';
    container.style.cssText = `
      perspective: 1800px; overflow: hidden; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: #f0ebe3; cursor: grab; user-select: none; position: relative;
    `;

    const scene = this._scene = document.createElement('div');
    scene.style.cssText = `
      transform-style: preserve-3d; width: ${w}px; height: ${ah}px;
      transform: rotateX(${this._rotX}deg) rotateY(${this._rotY}deg);
    `;

    // Back face (renders behind)
    const fBack = document.createElement('div');
    fBack.style.cssText = `
      position: absolute; width: ${w}px; height: ${fh}px;
      top: 0; left: 0; transform-origin: top center;
      background: #ede9e2; border: 1px solid #d5d0c8;
      transform: rotateX(${-tiltDeg}deg);
    `;
    scene.appendChild(fBack);

    // Bottom face
    const bottom = document.createElement('div');
    bottom.style.cssText = `
      position: absolute; width: ${w}px; height: ${bt}px;
      top: ${ah - bt / 2}px; left: 0;
      background: #e8e4dc; border: 1px solid #d5d0c8;
      transform-origin: center center;
      transform: rotateX(90deg) translateZ(${-bt / 2}px);
    `;
    scene.appendChild(bottom);

    // Pages container
    const pageBox = this._pageBox = document.createElement('div');
    pageBox.style.cssText = `
      position: absolute; top: 0; left: 0; width: ${w}px; height: ${sh}px;
      transform-style: preserve-3d;
    `;
    scene.appendChild(pageBox);

    // Create 12 pages
    this._pages = [];
    const zBase = hb * (sh / ah);
    const zStep = 0.5;

    for (let i = 0; i < 12; i++) {
      const mi = (this.monthIndex + i) % 12;
      let yr = this.year;
      if (this.monthIndex + i >= 12) yr++;

      const zOff = zBase + (11 - i) * zStep;

      const div = document.createElement('div');
      div.style.cssText = `
        position: absolute; top: 0; left: 1px; width: ${w - 2}px; height: ${sh}px;
        background: #faf8f5;
        transform-origin: top center;
        transform: translateZ(${zOff}px);
        border: 1px solid #e8e4dc;
        overflow: hidden;
        pointer-events: none;
      `;
      div.innerHTML = this._genCalHTML(mi, yr, i);
      pageBox.appendChild(div);
      this._pages.push(div);
    }

    // Front face (renders in front of pages, covers the ridge)
    const fFront = document.createElement('div');
    fFront.style.cssText = `
      position: absolute; width: ${w}px; height: ${fh}px;
      top: 0; left: 0; transform-origin: top center;
      background: #f0ece6; border: 1px solid #d5d0c8;
      transform: rotateX(${tiltDeg}deg);
    `;
    scene.appendChild(fFront);

    // Wire-o rings (at front face Z position at the ridge)
    const usedW = w * this.cfg.rings.widthPercentage;
    const pitch = 5.08 * s;
    const num = Math.floor(usedW / pitch);
    const startX = (w - usedW) / 2 + pitch / 2;
    const wireR = (this.cfg.rings.diameter / 2) * s;
    const wireBW = this.cfg.rings.wireDiameter * s / 2;

    for (let i = 0; i < num; i++) {
      const x = startX + i * pitch;
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute; top: ${-wireR}px; left: ${x - wireR}px;
        width: ${wireR * 2}px; height: ${wireR * 2}px;
        border-radius: 50%;
        border: ${wireBW}px solid #b0b0b4;
        box-sizing: border-box;
        transform: translateZ(${zBase + 11 * zStep}px);
        pointer-events: none;
      `;
      scene.appendChild(ring);
    }

    container.appendChild(scene);

    // Shadow
    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%);
      width: ${w * 0.85}px; height: 24px;
      background: radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%);
      pointer-events: none;
    `;
    container.appendChild(shadow);
  }

  _genCalHTML(monthIndex, year, uid) {
    const meses = this.cfg.meses;
    const dw = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fd = new Date(year, monthIndex, 1).getDay();
    const dim = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    const isToday = (d) => d === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear();

    let days = '';
    for (let d = 1; d <= dim; d++) {
      const dow = (fd + d - 1) % 7;
      const cls = isToday(d) ? 'today' : (dow === 0 || dow === 6 ? 'wknd' : '');
      days += `<span class="${cls}">${d}</span>`;
    }

    return `
      <div class="cp" style="
        padding: 3px 5px; height: 100%; display: flex; flex-direction: column;
        font-family: system-ui, sans-serif; font-size: 9px;
      ">
        <div style="
          background:#2c5f2d; color:#fff; padding:2px 5px; border-radius:3px;
          font-weight:700; font-size:10px; text-align:center; margin-bottom:2px;
        ">${meses[monthIndex]} ${year}</div>
        <div style="
          display:grid; grid-template-columns:repeat(7,1fr); text-align:center;
          font-weight:600; color:#888; font-size:7px; margin-bottom:1px;
        ">${dw.map(d => `<span>${d}</span>`).join('')}</div>
        <div style="
          display:grid; grid-template-columns:repeat(7,1fr); text-align:center;
          font-size:7px; flex:1; align-content:start;
        ">${days}</div>
      </div>
    `;
  }

  _render() {
    this._scene.style.transform = `rotateX(${this._rotX}deg) rotateY(${this._rotY}deg)`;
  }

  _attachEvents(container) {
    const onDown = (e) => {
      this._drag.active = true;
      const t = e.touches ? e.touches[0] : e;
      this._drag.lastX = t.clientX;
      this._drag.lastY = t.clientY;
      container.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!this._drag.active) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - this._drag.lastX;
      const dy = t.clientY - this._drag.lastY;
      this._rotY += dx * 0.5;
      this._rotX += dy * 0.3;
      this._rotX = Math.max(-45, Math.min(45, this._rotX));
      this._drag.lastX = t.clientX;
      this._drag.lastY = t.clientY;
      this._render();
    };
    const onUp = () => {
      this._drag.active = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    container.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }

  flipPage(direction) {
    if (this.isFlipping || this._pages.length < 2) return;
    this.isFlipping = true;

    const s = this.s;
    const sh = this.cfg.sheetHeight * s;
    const ah = this.cfg.assembledHeight * s;
    const hb = this.cfg.halfBase * s;
    const zBase = hb * (sh / ah);
    const zStep = 0.5;

    const curr = this._pages[0];

    const newMi = (this.monthIndex + direction + 12) % 12;
    let newYr = this.year;
    if (direction > 0 && newMi === 0) newYr++;
    else if (direction < 0 && newMi === 11) newYr--;

    const start = performance.now();
    const dur = 600;

    const anim = (tNow) => {
      const t = Math.min((tNow - start) / dur, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const angle = e * 180;
      const lift = Math.sin(e * Math.PI) * 50;
      const zMove = Math.sin(e * Math.PI) * 12;

      curr.style.transform =
        `translateZ(${zBase + 11 * zStep + zMove}px) translateY(${-lift}px) rotateX(${-angle}deg)`;

      if (t < 1) requestAnimationFrame(anim);
      else {
        this._pageBox.removeChild(curr);
        this._pageBox.insertBefore(curr, this._pageBox.firstChild);
        curr.style.transform = `translateZ(${zBase}px) rotateX(0deg)`;
        this._pages.push(this._pages.shift());

        const front = this._pages[0];
        front.innerHTML = this._genCalHTML(newMi, newYr, 0);

        for (let i = 0; i < 12; i++) {
          this._pages[i].style.transform =
            `translateZ(${zBase + (11 - i) * zStep}px) rotateX(0deg)`;
        }

        this.monthIndex = newMi;
        this.year = newYr;
        this.isFlipping = false;
      }
    };

    requestAnimationFrame(anim);
  }
}
