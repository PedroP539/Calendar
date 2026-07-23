class ViewerBabylon {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.cfg = config;
    this.s = config.scale;
    this.monthIndex = new Date().getMonth();
    this.year = new Date().getFullYear();
    this.isFlipping = false;
    this._init();
  }

  _init() {
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true, stencil: true
    });
    this.engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3(0.94, 0.92, 0.89);

    this._createCamera();
    this._createLights();
    this._createTable();
    this._createTent();
    this._createPages();
    this._createWireO();
    this._resize();

    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => this.scene.render());
    });
  }

  _createCamera() {
    this.camera = new BABYLON.ArcRotateCamera(
      'cam', -0.6, 1.0, 14,
      new BABYLON.Vector3(0, 2, 0), this.scene
    );
    this.camera.lowerRadiusLimit = 3;
    this.camera.upperRadiusLimit = 30;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2.05;
    this.camera.attachControl(this.canvas, true);
  }

  _createLights() {
    const hemi = new BABYLON.HemisphericLight(
      'hemi', new BABYLON.Vector3(0, 1, -0.2), this.scene
    );
    hemi.intensity = 0.4;
    hemi.diffuse = new BABYLON.Color3(1, 0.96, 0.9);
    hemi.groundColor = new BABYLON.Color3(0.5, 0.45, 0.4);

    const key = new BABYLON.DirectionalLight(
      'key', new BABYLON.Vector3(0.5, 1, 0.5), this.scene
    );
    key.intensity = 1.8;
    key.position = new BABYLON.Vector3(6, 12, 5);

    this.shadowGen = new BABYLON.ShadowGenerator(1024, key);
    this.shadowGen.useBlurExponentialShadowMap = true;
    this.shadowGen.blurKernel = 32;
    this.shadowGen.setDarkness(0.35);

    const fill = new BABYLON.DirectionalLight(
      'fill', new BABYLON.Vector3(-0.3, 0.3, 0.5), this.scene
    );
    fill.intensity = 0.3;
  }

  _addCaster(mesh) {
    this.shadowGen.addShadowCaster(mesh);
    mesh.receiveShadows = true;
    return mesh;
  }

  _makeQuad(name, corners, uvs, mat) {
    const mesh = new BABYLON.Mesh(name, this.scene);
    const indices = [0, 1, 2, 0, 2, 3];
    const normals = [];
    BABYLON.VertexData.ComputeNormals(corners, indices, normals);
    const vd = new BABYLON.VertexData();
    vd.positions = corners;
    vd.indices = indices;
    vd.normals = normals;
    vd.uvs = uvs || [0, 0, 1, 0, 1, 1, 0, 1];
    vd.applyToMesh(mesh);
    mesh.material = mat;
    return mesh;
  }

  _makeTexFromCanvas(canvas) {
    const dt = new BABYLON.DynamicTexture('dt_' + Math.random(), {
      width: canvas.width, height: canvas.height
    }, this.scene, false, undefined, undefined, true);
    const ctx = dt.getContext();
    ctx.drawImage(canvas, 0, 0);
    dt.update();
    return dt;
  }

  _createTable() {
    const table = BABYLON.MeshBuilder.CreateBox('table', {
      width: 30, height: 0.06, depth: 30
    }, this.scene);
    table.position.y = -0.03;
    const mat = new BABYLON.PBRMaterial('tMat', this.scene);
    mat.albedoColor = new BABYLON.Color3(0.77, 0.66, 0.51);
    mat.roughness = 0.55;
    mat.metallic = 0;
    table.material = mat;
    table.receiveShadows = true;
  }

  _createTent() {
    const w = this.cfg.width * this.s;
    const h = this.cfg.frontPanel * this.s;
    const b = this.cfg.halfBase * this.s;
    const ah = this.cfg.assembledHeight * this.s;
    const hw = w / 2;

    const extMat = new BABYLON.PBRMaterial('ext', this.scene);
    extMat.albedoColor = new BABYLON.Color3(0.96, 0.95, 0.93);
    extMat.roughness = 0.7;
    extMat.metallic = 0;

    const intMat = new BABYLON.PBRMaterial('int', this.scene);
    intMat.albedoColor = new BABYLON.Color3(0.89, 0.87, 0.84);
    intMat.roughness = 0.8;
    intMat.metallic = 0;

    // Front face — exterior (normal +Z): CCW from +Z
    this._addCaster(this._makeQuad('fExt', [
      -hw, 0, b,  -hw, ah, 0,  hw, ah, 0,  hw, 0, b
    ], null, extMat));

    // Front face — interior (normal -Z): CW from +Z
    this._makeQuad('fInt', [
      -hw, 0, b,  hw, 0, b,  hw, ah, 0,  -hw, ah, 0
    ], null, intMat);

    // Back face — exterior (normal -Z): CCW from -Z
    this._addCaster(this._makeQuad('bExt', [
      hw, 0, -b,  hw, ah, 0,  -hw, ah, 0,  -hw, 0, -b
    ], null, extMat));

    // Back face — interior (normal +Z): CW from -Z
    this._makeQuad('bInt', [
      hw, 0, -b,  -hw, 0, -b,  -hw, ah, 0,  hw, ah, 0
    ], null, intMat);

    // Bottom
    const bMat = new BABYLON.PBRMaterial('bMat', this.scene);
    bMat.albedoColor = new BABYLON.Color3(0.84, 0.82, 0.78);
    bMat.roughness = 0.9;
    bMat.metallic = 0;
    const bt = BABYLON.MeshBuilder.CreatePlane('bt', {
      width: w, height: this.cfg.baseTotal * this.s,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, this.scene);
    bt.position = new BABYLON.Vector3(0, 0.001, 0);
    bt.rotation.x = Math.PI / 2;
    bt.material = bMat;
    bt.receiveShadows = true;
  }

  _genCalCanvas(monthIndex, year) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 700;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 1024, 700);

    const mg = 25, hh = 140;
    const cw = (1024 - mg * 2) / 7;
    const ch = (700 - mg - hh) / 7;
    const grad = ctx.createLinearGradient(0, 0, 0, hh);
    grad.addColorStop(0, '#2c5f2d');
    grad.addColorStop(1, '#1a3d1a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mg, mg, 974, hh - mg, 8);
    else ctx.rect(mg, mg, 974, hh - mg);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.cfg.meses[monthIndex]} ${year}`, 512, mg + 60);

    const dw = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    ctx.fillStyle = '#888';
    ctx.font = 'bold 24px system-ui, sans-serif';
    for (let i = 0; i < 7; i++)
      ctx.fillText(dw[i], mg + i * cw + cw / 2, mg + hh - 22);

    const fd = new Date(year, monthIndex, 1).getDay();
    const dim = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    ctx.font = '28px system-ui, sans-serif';
    for (let d = 1; d <= dim; d++) {
      const dow = (fd + d - 1) % 7;
      const wi = Math.floor((fd + d - 1) / 7);
      const x = mg + dow * cw + cw / 2;
      const y = mg + hh + wi * ch + ch / 2;
      if (d === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear()) {
        ctx.fillStyle = '#2c5f2d';
        ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = (dow === 0 || dow === 6) ? '#b91c1c' : '#333';
      }
      ctx.fillText(String(d), x, y);
    }

    const s = this.s;
    const w = this.cfg.width * s;
    const sh = this.cfg.sheetHeight * s;
    const usedW = w * this.cfg.rings.widthPercentage;
    const pitch = 5.08 * s;
    const numH = Math.floor(usedW / pitch);
    const hsx = -usedW / 2 + pitch / 2;
    const pl = -w / 2 + 0.02;
    const pww = w - 0.04;
    const holeW = 4, holeH = 6;
    ctx.fillStyle = '#cec9c0';
    for (let i = 0; i < numH; i++) {
      const cx = ((hsx + i * pitch - pl) / pww) * 1024;
      const cy = (1 - (this.cfg.rings.marginTop * s) / sh) * 700;
      ctx.fillRect(cx - holeW / 2, cy - holeH / 2, holeW, holeH);
    }
    return c;
  }

  _createPages() {
    const w = this.cfg.width * this.s;
    const sh = this.cfg.sheetHeight * this.s;
    const ah = this.cfg.assembledHeight * this.s;
    const b = this.cfg.halfBase * this.s;
    const hw = w / 2;
    const d = 0.02;

    const zBase = b * (sh / ah);
    const zStep = 0.012;

    this._backMat = new BABYLON.PBRMaterial('pgBack', this.scene);
    this._backMat.albedoColor = new BABYLON.Color3(0.95, 0.93, 0.9);
    this._backMat.roughness = 0.7;
    this._backMat.metallic = 0;

    this._pages = [];

    for (let i = 0; i < 12; i++) {
      const zOff = zBase + (11 - i) * zStep;

      const pivot = new BABYLON.TransformNode('pv_' + i, this.scene);
      pivot.position = new BABYLON.Vector3(0, ah, 0);

      const mat = i === 0
        ? this._makeTexMat('pg_0', this._genCalCanvas(this.monthIndex, this.year))
        : this._backMat;

      const mesh = this._makeQuad('p_' + i, [
        -hw + d, -sh, zOff,
        -hw + d, 0, 0,
         hw - d, 0, 0,
         hw - d, -sh, zOff
      ], [0, 0, 0, 1, 1, 1, 1, 0], mat);

      mesh.parent = pivot;
      this._addCaster(mesh);
      this._pages.push(pivot);
    }
  }

  _makeTexMat(name, canvas) {
    const mat = new BABYLON.PBRMaterial(name, this.scene);
    mat.albedoTexture = this._makeTexFromCanvas(canvas);
    mat.roughness = 0.6;
    mat.metallic = 0;
    return mat;
  }

  _restackPages() {
    const w = this.cfg.width * this.s;
    const sh = this.cfg.sheetHeight * this.s;
    const b = this.cfg.halfBase * this.s;
    const ah = this.cfg.assembledHeight * this.s;
    const hw = w / 2;
    const d = 0.02;
    const zBase = b * (sh / ah);
    const zStep = 0.012;

    // Reuse a single front material
    if (!this._frontMat) {
      this._frontMat = new BABYLON.PBRMaterial('pgFront', this.scene);
      this._frontMat.roughness = 0.6;
      this._frontMat.metallic = 0;
    }
    this._frontMat.albedoTexture = this._makeTexFromCanvas(
      this._genCalCanvas(this.monthIndex, this.year)
    );

    for (let i = 0; i < 12; i++) {
      const zOff = zBase + (11 - i) * zStep;
      const pivot = this._pages[i];
      const mesh = pivot.getChildMeshes()[0];

      const vd = new BABYLON.VertexData();
      vd.positions = [
        -hw + d, -sh, zOff,
        -hw + d, 0, 0,
         hw - d, 0, 0,
         hw - d, -sh, zOff
      ];
      vd.indices = [0, 1, 2, 0, 2, 3];
      const normals = [];
      BABYLON.VertexData.ComputeNormals(vd.positions, vd.indices, normals);
      vd.normals = normals;
      vd.uvs = [0, 0, 0, 1, 1, 1, 1, 0];
      vd.applyToMesh(mesh);

      mesh.material = i === 0 ? this._frontMat : this._backMat;
    }
  }

  _createWireO() {
    const cfg = this.cfg.rings;
    const s = this.s;
    const w = this.cfg.width * s;
    const ah = this.cfg.assembledHeight * s;

    const wireR = (cfg.wireDiameter / 2) * s;
    const loopR = (cfg.diameter / 2) * s;
    const usedW = w * cfg.widthPercentage;
    const pitch = 5.08 * s;
    const num = Math.floor(usedW / pitch);
    const startX = -usedW / 2 + pitch / 2;
    // Ring center at the ridge — slightly in front of pages to avoid Z-fighting
    const cy = ah;
    const cz = 0.01;

    const pts = [];
    const segs = 16;
    for (let i = 0; i <= segs; i++) {
      const t = (i / segs) * Math.PI * 2;
      pts.push(new BABYLON.Vector3(0,
        Math.cos(t) * loopR,
        Math.sin(t) * loopR
      ));
    }

    const loop = BABYLON.MeshBuilder.CreateTube('wire', {
      path: pts, radius: wireR, tessellation: 6, cap: 3
    }, this.scene);

    const mat = new BABYLON.PBRMaterial('wireMat', this.scene);
    mat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.82);
    mat.metallic = 0.95;
    mat.roughness = 0.12;
    loop.material = mat;
    this._addCaster(loop);

    loop.position = new BABYLON.Vector3(startX, cy, cz);

    for (let i = 1; i < num; i++) {
      const inst = loop.createInstance('w' + i);
      inst.position = new BABYLON.Vector3(startX + i * pitch, cy, cz);
    }
  }

  flipPage(direction) {
    if (this.isFlipping || this._pages.length < 2) return;
    this.isFlipping = true;

    const curr = this._pages[0];         // front page — flips away
    const next = this._pages[1];         // next page — revealed during flip

    const newMi = (this.monthIndex + direction + 12) % 12;
    let newYr = this.year;
    if (direction > 0 && newMi === 0) newYr++;
    else if (direction < 0 && newMi === 11) newYr--;

    const currMesh = curr.getChildMeshes()[0];
    const nextMesh = next.getChildMeshes()[0];
    // Make both sides visible during flip
    if (currMesh) currMesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
    if (nextMesh) {
      nextMesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
      const tex = this._makeTexFromCanvas(this._genCalCanvas(newMi, newYr));
      nextMesh.material.albedoTexture = tex;
    }

    const start = performance.now();
    const dur = 600;

    const anim = () => {
      const t = Math.min((performance.now() - start) / dur, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Curr flips full 180° from front to back
      curr.rotation.x = -e * Math.PI;
      curr.position.y = curr._origY + Math.sin(e * Math.PI) * 0.05;

      // Next starts appearing from behind at halfway
      if (t >= 0.5) {
        const n = (e - 0.5) * 2;
        next.rotation.x = -Math.PI * (1 - n);
        next.position.y = next._origY + Math.sin(n * Math.PI) * 0.05;
      }

      if (t < 1) requestAnimationFrame(anim);
      else {
        curr.rotation.x = 0;
        curr.position.y = curr._origY;
        next.rotation.x = 0;
        next.position.y = next._origY;
        if (currMesh) currMesh.sideOrientation = BABYLON.Mesh.DEFAULTSIDE;
        if (nextMesh) nextMesh.sideOrientation = BABYLON.Mesh.DEFAULTSIDE;

        // Rotate stack: front goes to back
        this._pages.push(this._pages.shift());
        this._restackPages();
        for (const p of this._pages) p.setEnabled(true);

        this.monthIndex = newMi;
        this.year = newYr;
        this.isFlipping = false;
      }
    };

    curr._origY = curr.position.y;
    next._origY = next.position.y;
    requestAnimationFrame(anim);
  }

  _resize() {
    window.addEventListener('resize', () => this.engine.resize());
  }

  dispose() {
    this.engine.dispose();
  }
}
