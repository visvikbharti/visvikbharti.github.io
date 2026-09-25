/* ===== Hero: a tissue section drawn in characters =====
   Cells drift in a packed field. Now and then a DNA break appears in a nucleus (green);
   after a pause the cell either repairs it or dies and fragments, and a death nearby
   lowers its neighbours' odds of repair. Click a cell to break it. Illustrative only. */
(() => {
  const canvas = document.getElementById('hero-cells');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero') || canvas.parentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const hud = {
    cells: document.getElementById('hud-cells'),
    breaks: document.getElementById('hud-breaks'),
    repaired: document.getElementById('hud-repaired'),
    died: document.getElementById('hud-died'),
  };
  const cross = hero.querySelector('.hero__crosshair');
  const readout = cross && cross.querySelector('.hero__readout');

  const FONT_PX = 11;
  const LINE = 12;
  const FONT = `${FONT_PX}px "Geist Mono", "IBM Plex Mono", monospace`;
  const NUC = 'ATGC';
  const RAMP = ' .:-=+*#%@';
  const GREEN = '#00e38c';
  const GREYS = ['#141414', '#1d1d1d', '#292929', '#383838', '#4d4d4d', '#686868', '#8a8a8a', '#b3b3b3'];
  const MEMBRANE = 'o:.:';

  let W = 0, H = 0, cw = 6.6, cols = 0, rows = 0;
  let cells = [], debris = [];
  let owner, depth;               // per character: index of the cell drawn there, and its ellipse depth
  const tally = { breaks: 0, repaired: 0, died: 0 };
  let hover = -1, nextBreak = 0, running = false, lastFrame = 0, raf = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const hash = (x, y) => {        // stable per-character noise
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  /* ---------- scene ---------- */
  function makeCell(x, y, grow) {
    const r = rand(0.85, 1.15) * cellRadius();
    return {
      x, y, rx: r * rand(0.9, 1.15), ry: r * rand(0.8, 1.0), rot: rand(0, Math.PI),
      vx: rand(-4, 4), vy: rand(-3, 3),
      nx: rand(-0.15, 0.15), ny: rand(-0.12, 0.12), nr: rand(0.38, 0.48),
      state: 'healthy', t: 0, until: 0, scale: grow ? 0.05 : 1, site: null,
    };
  }
  const cellRadius = () => Math.max(40, Math.min(92, Math.min(W, 1700) / 17));

  function populate() {
    cells = [];
    const r = cellRadius();
    const minD = r * 1.9;
    for (let tries = 0; tries < 4000 && cells.length < 400; tries++) {
      const x = rand(-r, W + r), y = rand(-r, H + r);
      if (cells.every(c => (c.x - x) ** 2 + (c.y - y) ** 2 > minD * minD)) cells.push(makeCell(x, y, false));
    }
    debris = [];
  }

  // How visible the tissue is at (x, y). The field lives in the upper and right parts of the hero and
  // falls away behind the headline (bottom left), under the nav and behind the HUD lines.
  const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  function mask(x, y) {
    const dx = (x - W * 0.12) / (W * 0.55), dy = (y - H * 0.8) / (H * 0.5);
    const text = smooth(0.55, 1.05, Math.sqrt(dx * dx + dy * dy));
    const top = smooth(60, 130, y);
    const bottom = 1 - smooth(H - 170, H - 80, y);
    const left = smooth(-0.05, 0.35, x / W) * 0.6 + 0.4;
    return text * top * bottom * left;
  }

  function breakCell(c) {
    if (!c || c.state !== 'healthy' || c.scale < 0.9) return;
    const a = rand(0, Math.PI * 2), d = rand(0, 0.5) * c.nr;
    c.site = { a, d };
    c.state = 'broken'; c.t = 0; c.until = rand(1.6, 3.0);
    tally.breaks++;
  }

  function decide(c) {
    // a recent death within ~2.4 radii makes this cell less likely to repair
    let pRepair = 0.74;
    for (const o of cells) {
      if (o === c || !(o.state === 'dying' || o.state === 'dead')) continue;
      if ((o.x - c.x) ** 2 + (o.y - c.y) ** 2 < (cellRadius() * 2.4) ** 2) pRepair -= 0.22;
    }
    if (Math.random() < Math.max(0.2, pRepair)) {
      c.state = 'repairing'; c.t = 0; c.until = 1.1;
    } else {
      c.state = 'dying'; c.t = 0; c.until = 1.0;
    }
  }

  function fragment(c) {
    // turn the cell's characters into drifting debris
    const n = Math.round((c.rx * c.ry) / 90);
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), d = Math.sqrt(Math.random());
      const x = c.x + Math.cos(a) * c.rx * d * 0.8, y = c.y + Math.sin(a) * c.ry * d * 0.8;
      debris.push({ x, y, vx: Math.cos(a) * rand(4, 18) + c.vx, vy: Math.sin(a) * rand(4, 18) + c.vy,
        life: rand(1.6, 3.2), age: 0, ch: RAMP[4 + (i % 5)] });
    }
    c.state = 'dead'; c.t = 0; c.until = rand(2.5, 5);
    tally.died++;
  }

  function step(dt) {
    const r = cellRadius();
    for (const c of cells) {
      // drift, with soft repulsion so the tissue stays packed but not overlapping
      c.vx += rand(-6, 6) * dt; c.vy += rand(-6, 6) * dt;
      for (const o of cells) {
        if (o === c || o.state === 'dead') continue;
        const dx = c.x - o.x, dy = c.y - o.y, d2 = dx * dx + dy * dy, min = r * 1.85;
        if (d2 < min * min && d2 > 1) {
          const d = Math.sqrt(d2), push = (min - d) * 0.9;
          c.vx += (dx / d) * push * dt; c.vy += (dy / d) * push * dt;
        }
      }
      c.vx *= 0.96; c.vy *= 0.96;
      const sp = Math.hypot(c.vx, c.vy);
      if (sp > 10) { c.vx *= 10 / sp; c.vy *= 10 / sp; }
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.x < -r * 1.5) c.x = W + r; else if (c.x > W + r * 1.5) c.x = -r;
      if (c.y < -r * 1.5) c.y = H + r; else if (c.y > H + r * 1.5) c.y = -r;
      if (c.scale < 1) c.scale = Math.min(1, c.scale + dt * 0.35);

      c.t += dt;
      if (c.state === 'broken' && c.t > c.until) decide(c);
      else if (c.state === 'repairing' && c.t > c.until) { c.state = 'healthy'; c.site = null; tally.repaired++; }
      else if (c.state === 'dying' && c.t > c.until) fragment(c);
      else if (c.state === 'dead' && c.t > c.until) Object.assign(c, makeCell(c.x, c.y, true));
    }
    for (const p of debris) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; }
    debris = debris.filter(p => p.age < p.life);

    nextBreak -= dt;
    if (nextBreak <= 0) {
      const healthy = cells.filter(c => c.state === 'healthy' && c.scale >= 0.9 && mask(c.x, c.y) > 0.35
        && c.x > 0 && c.x < W && c.y > 0 && c.y < H);
      breakCell(healthy[Math.floor(Math.random() * healthy.length)]);
      nextBreak = rand(0.9, 2.2);
    }
  }

  /* ---------- drawing ---------- */
  function draw(time) {
    owner.fill(-1); depth.fill(9);
    // rasterise every cell into the character grid; the nearest centre wins where two overlap
    cells.forEach((c, i) => {
      if (c.state === 'dead') return;
      const sc = c.scale * (c.state === 'dying' ? 1 - 0.3 * Math.min(1, c.t / c.until) : 1);
      const rx = c.rx * sc, ry = c.ry * sc, cos = Math.cos(c.rot), sin = Math.sin(c.rot);
      const R = Math.max(rx, ry) * 1.05;
      const c0 = Math.max(0, Math.floor((c.x - R) / cw)), c1 = Math.min(cols - 1, Math.ceil((c.x + R) / cw));
      const r0 = Math.max(0, Math.floor((c.y - R) / LINE)), r1 = Math.min(rows - 1, Math.ceil((c.y + R) / LINE));
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const px = col * cw + cw / 2 - c.x, py = row * LINE + LINE / 2 - c.y;
          const u = (px * cos + py * sin) / rx, v = (-px * sin + py * cos) / ry;
          let q = Math.sqrt(u * u + v * v);
          if (c.state === 'dying') q *= 1 + 0.12 * Math.sin(Math.atan2(v, u) * 7 + time * 6); // blebbing
          if (q > 1.02) continue;
          const k = row * cols + col;
          if (q < depth[k]) { depth[k] = q; owner[k] = i; }
        }
      }
    });

    const buckets = GREYS.map(() => []);
    const greens = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const k = row * cols + col, x = col * cw, y = row * LINE;
        const m = mask(x, y);
        if (m < 0.03) continue;
        const i = owner[k];
        if (i < 0) {                                   // extracellular space: a rare faint dot
          if (hash(col, row) > 0.992) buckets[1].push(x, y, '.');
          continue;
        }
        const c = cells[i], q = depth[k];
        const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
        const px = x + cw / 2 - c.x, py = y + LINE / 2 - c.y;
        const u = (px * cos + py * sin) / c.rx - c.nx, v = (-px * sin + py * cos) / c.ry - c.ny;
        const nq = Math.sqrt(u * u + v * v) / (c.nr * (c.state === 'dying' ? 1 - 0.45 * Math.min(1, c.t / c.until) : 1));
        let level, chr;
        if (q > 0.9) {                                 // membrane: a thin, light ring
          level = c.state === 'healthy' || c.state === 'repairing' ? 4 : 5;
          chr = MEMBRANE[Math.floor(hash(col, row) * MEMBRANE.length)];
        } else if (nq < 1) {                           // nucleus: chromatin as bases
          level = c.state === 'dying' ? 7 : nq > 0.82 ? 5 : 6;
          chr = c.state === 'dying' ? '@' : NUC[Math.floor(hash(col + Math.floor(time * 0.4), row) * 4)];
        } else {                                       // cytoplasm: very sparse
          const h = hash(col, row);
          if (h < 0.82) continue;
          level = 2; chr = '.';
        }
        if (i === hover && finePointer) level = Math.min(GREYS.length - 1, level + 2);
        level = Math.max(0, Math.min(GREYS.length - 1, Math.round(level * (0.35 + 0.65 * m))));
        buckets[level].push(x, y, chr);
      }
    }

    // break sites and repair
    for (const c of cells) {
      if (!c.site || (c.state !== 'broken' && c.state !== 'repairing' && c.state !== 'dying')) continue;
      const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
      const lu = c.nx + Math.cos(c.site.a) * c.site.d, lv = c.ny + Math.sin(c.site.a) * c.site.d;
      const sx = c.x + (lu * c.rx) * cos - (lv * c.ry) * sin, sy = c.y + (lu * c.rx) * sin + (lv * c.ry) * cos;
      const col = Math.round(sx / cw), row = Math.round(sy / LINE);
      const fade = c.state === 'repairing' ? 1 - c.t / c.until : c.state === 'dying' ? 1 - c.t / c.until : 1;
      const blink = c.state === 'broken' ? 0.6 + 0.4 * Math.sin(time * 7) : 1;
      greens.push({ x: col * cw, y: row * LINE, a: fade * blink, marks: c.state === 'repairing' ? '=' : '/' });
    }

    ctx.clearRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    buckets.forEach((b, level) => {
      if (!b.length) return;
      ctx.fillStyle = GREYS[level];
      for (let j = 0; j < b.length; j += 3) ctx.fillText(b[j + 2], b[j], b[j + 1]);
    });
    ctx.fillStyle = GREYS[3];
    for (const p of debris) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life) * mask(p.x, p.y);
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = GREEN;
    for (const g of greens) {
      ctx.globalAlpha = Math.max(0, g.a);
      ctx.fillText(g.marks, g.x - cw, g.y);
      ctx.fillText(g.marks, g.x + cw, g.y);
    }
    ctx.globalAlpha = 1;

    if (hud.cells) {
      hud.cells.textContent = cells.filter(c => c.state !== 'dead').length;
      hud.breaks.textContent = tally.breaks;
      hud.repaired.textContent = tally.repaired;
      hud.died.textContent = tally.died;
    }
  }

  /* ---------- lifecycle ---------- */
  function resize() {
    const rect = hero.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT;
    cw = ctx.measureText('M').width || 6.6;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / LINE);
    owner = new Int16Array(cols * rows);
    depth = new Float32Array(cols * rows);
    populate();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < 33) return;                  // ~30 fps is plenty
    const dt = Math.min(0.1, (now - lastFrame) / 1000 || 0.033);
    lastFrame = now;
    step(dt);
    draw(now / 1000);
  }
  function start() { if (!running && !reduceMotion) { running = true; lastFrame = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function stillFrame() {
    // reduced motion: one composed frame with a break, a repair and a death in progress
    const visible = cells.filter(c => c.x > W * 0.45 && c.x < W * 0.95 && c.y > H * 0.2 && c.y < H * 0.8);
    if (visible[0]) { breakCell(visible[0]); visible[0].t = 0.5; }
    if (visible[3]) { breakCell(visible[3]); visible[3].state = 'repairing'; visible[3].t = 0.2; visible[3].until = 1.1; }
    if (visible[6]) { visible[6].state = 'dying'; visible[6].t = 0.6; visible[6].until = 1.0; }
    draw(0);
  }

  function pointerCell(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let best = -1, bd = Infinity;
    cells.forEach((c, i) => {
      if (c.state === 'dead') return;
      const d = ((c.x - x) / c.rx) ** 2 + ((c.y - y) / c.ry) ** 2;
      if (d < 1 && d < bd) { bd = d; best = i; }
    });
    return { x, y, i: best };
  }

  function init() {
    resize();
    if (reduceMotion) { stillFrame(); } else {
      const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
      io.observe(hero);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (reduceMotion) stillFrame(); }, 200);
    });

    if (finePointer) {
      hero.addEventListener('pointermove', e => {
        const p = pointerCell(e);
        hover = p.i;
        if (cross) {
          cross.style.setProperty('--x', p.x + 'px');
          cross.style.setProperty('--y', p.y + 'px');
          cross.classList.add('is-on');
          const c = cells[p.i];
          readout.textContent = `x ${Math.round(p.x)}  y ${Math.round(p.y)}` +
            (c ? `  ·  cell ${String(p.i).padStart(3, '0')}  ${c.state}` : '');
        }
      });
      hero.addEventListener('pointerleave', () => { hover = -1; cross && cross.classList.remove('is-on'); });
    }
    hero.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      const p = pointerCell(e);
      if (p.i >= 0) { breakCell(cells[p.i]); if (reduceMotion) draw(0); }
    });
  }

  // wait for the monospace font so the character grid is measured correctly
  const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(init, init);
})();
