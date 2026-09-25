/* ===== Project drawings in characters =====
   Each .split__img[data-art] panel gets a small animated scene drawn on a character grid,
   in the same language as the hero: grey glyphs, one green accent. Scenes animate only while
   on screen (~20 fps) and are drawn once, still, under reduced motion. */
(() => {
  const panels = [...document.querySelectorAll('.split__img[data-art]')];
  if (!panels.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FONT_PX = 12;
  const LINE = 14;
  const FONT = `${FONT_PX}px "Geist Mono", "IBM Plex Mono", monospace`;
  const GREYS = ['#161616', '#222', '#303030', '#444', '#5c5c5c', '#787878', '#999', '#c2c2c2'];
  const GREEN = '#00e38c';
  const TAU = Math.PI * 2;

  // Integer hash (a sine hash was badly distributed on whole numbers: 1 in 64 papers 'checkable', not ~6)
  const hash = (a, b = 0) => {
    let n = (Math.imul(Math.round(a * 16) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(b * 16) | 0, 0x165667b1)) >>> 0;
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  };
  const pick = (str, a, b) => str[Math.floor(hash(a, b) * str.length) % str.length];

  /* A character grid: the brightest (or accented) glyph wins each cell */
  class Grid {
    constructor(cols, rows) {
      this.cols = cols; this.rows = rows;
      this.ch = new Array(cols * rows); this.lv = new Int8Array(cols * rows); this.ac = new Uint8Array(cols * rows);
    }
    clear() { this.ch.fill(''); this.lv.fill(-1); this.ac.fill(0); }
    put(c, r, ch, lv, accent = false) {
      c = Math.round(c); r = Math.round(r);
      if (c < 0 || r < 0 || c >= this.cols || r >= this.rows || !ch || ch === ' ') return;
      const k = r * this.cols + c;
      if (this.ac[k] && !accent) return;
      if (accent || lv >= this.lv[k]) { this.ch[k] = ch; this.lv[k] = lv; this.ac[k] = accent ? 1 : 0; }
    }
    text(c, r, str, lv, accent = false) { [...str].forEach((s, i) => this.put(c + i, r, s, lv, accent)); }
    line(c0, r0, c1, r1, ch, lv, accent = false, step = 1) {
      const n = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0) * 2, 1);
      for (let i = 0; i <= n; i += step) this.put(c0 + (c1 - c0) * i / n, r0 + (r1 - r0) * i / n, ch, lv, accent);
    }
  }

  /* ---------- scenes: (grid, t) ---------- */
  const SCENES = {
    // StickForStats: a histogram, the fitted curve in green, and assumption checks ticking off
    stats(g, t) {
      const { cols, rows } = g;
      const base = Math.round(rows * 0.78), c0 = Math.round(cols * 0.1), c1 = Math.round(cols * 0.9);
      const H = rows * 0.46, bins = 21, bw = (c1 - c0) / bins;
      for (let i = 0; i < bins; i++) {
        const z = -3 + 6 * (i + 0.5) / bins;
        const h = Math.max(1, Math.round(Math.exp(-z * z / 2) * H * (0.86 + 0.14 * Math.sin(t * 1.1 + i * 1.9)) + hash(i) * 2));
        for (let c = Math.round(c0 + i * bw); c < Math.round(c0 + (i + 1) * bw) - 1; c++) {
          for (let r = base - h; r < base; r++) g.put(c, r, r === base - h ? '=' : '#', r === base - h ? 5 : 3);
        }
      }
      for (let c = c0; c <= c1; c++) {
        const z = -3.2 + 6.4 * (c - c0) / (c1 - c0);
        g.put(c, base - Math.exp(-z * z / 2) * H - 1, '*', 7, true);
        g.put(c, base, '_', 4);
      }
      const checks = ['normality', 'variance homogeneity', 'independence', 'outliers'];
      const shown = reduceMotion ? checks.length : Math.floor(t * 0.8) % (checks.length + 2);
      checks.forEach((name, i) => {
        const r = Math.round(rows * 0.1) + i * 2, done = i < shown;
        g.text(c0, r, '[ ]', 4); if (done) g.put(c0 + 1, r, 'x', 7, true);
        g.text(c0 + 4, r, name, done ? 6 : 4);
      });
    },

    // Checkability audit: a wall of papers read by a scan line; a few are checkable (green)
    audit(g, t) {
      const { cols, rows } = g;
      const dw = 8, dh = 5, gx = 3, gy = 2;
      const nx = Math.floor((cols - 4) / (dw + gx)), ny = Math.floor((rows - 4) / (dh + gy));
      const ox = Math.round((cols - nx * (dw + gx) + gx) / 2), oy = Math.round((rows - ny * (dh + gy) + gy) / 2);
      const scan = reduceMotion ? rows : (t * 5) % (rows + 10);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = ox + i * (dw + gx), y = oy + j * (dh + gy), id = j * nx + i;
        const checkable = hash(id, 7) < 0.1;
        const read = scan > y + dh, reading = scan >= y && scan <= y + dh;
        for (let l = 0; l < dh - 1; l++) {
          const len = Math.round(dw * (0.45 + 0.55 * hash(id, l)));
          const hit = checkable && read && l === 2;
          for (let c = 0; c < len; c++) g.put(x + c, y + l, l === 0 ? '=' : '-', hit ? 7 : reading ? 6 : read ? 4 : 3, hit);
        }
      }
      if (!reduceMotion) for (let c = 0; c < cols; c++) g.put(c, Math.round(scan), c % 2 ? '-' : '.', 4);
    },

    // DNA repair: blunt (SpCas9) and staggered (FnCas9) double-strand breaks, ends drifting and rejoining
    'dna-break'(g, t) {
      const { cols, rows } = g;
      const comp = { A: 'T', T: 'A', G: 'C', C: 'G' };
      const gap = reduceMotion ? 1.5 : 1.2 + 1.2 * (0.5 + 0.5 * Math.sin(t * 0.7));
      [['SpCas9 · blunt', 0.3, 0], ['FnCas9 · staggered', 0.7, 4]].forEach(([label, fy, over], k) => {
        const cy = rows * fy, A = rows * 0.085, L = cols * 0.34, mid = Math.round(cols / 2);
        g.text(Math.round(cols * 0.08), Math.round(cy - A - 3), label, 5);
        for (let c = Math.round(cols * 0.06); c < cols * 0.94; c++) {
          const right = c >= mid;
          const cc = c + (right ? gap : -gap);                          // the two halves pull apart
          const ph = TAU * c / L + t * 0.8;
          const s = Math.sin(ph), y1 = cy + A * s, y2 = cy - A * s;
          const base = pick('ATGC', c, k);
          // top strand is cut at mid; the bottom strand at mid (blunt) or mid + overhang (staggered)
          const topGap = c === mid - 1 || c === mid, botGap = c === mid + over - 1 || c === mid + over;
          if (!topGap) g.put(cc, y1, base, s > 0 ? 7 : 4);
          if (!botGap) g.put(cc, y2, comp[base], s > 0 ? 4 : 7);
          if (c % 2 === 0 && !topGap && !botGap) {
            const lo = Math.min(y1, y2) + 1, hi = Math.max(y1, y2) - 1;
            for (let r = Math.round(lo); r <= Math.round(hi); r++) g.put(cc, r, ':', 2);
          }
          if (topGap && c === mid) g.put(cc, y1, '/', 7, true);
          if (botGap && c === mid + over) g.put(cc, y2, '/', 7, true);
        }
      });
    },

    // TRIPinRNA: one strand folding back into an intramolecular triple helix; the third strand in green
    triplex(g, t) {
      const { cols, rows } = g;
      const cy = rows * 0.5, A = rows * 0.14, L = cols * 0.42, c0 = Math.round(cols * 0.16), c1 = Math.round(cols * 0.84);
      const ys = [0, 1, 2].map(i => c => cy + A * Math.sin(TAU * c / L + t * 0.7 + i * TAU / 3));
      for (let c = c0; c <= c1; c++) {
        ys.forEach((y, i) => {
          const depth = Math.cos(TAU * c / L + t * 0.7 + i * TAU / 3);
          g.put(c, y(c), pick('AUGC', c, i), depth > 0 ? 7 : 4, i === 2);
        });
        if (c % 3 === 0) {
          const v = ys.map(y => y(c)).sort((a, b) => a - b);
          for (let r = Math.round(v[0]) + 1; r < v[2]; r++) g.put(c, r, '.', 2);
        }
      }
      // loops joining the segments: strand 1 -> 2 at the left end, 2 -> 3 at the right end
      const loop = (cx, ya, yb, dir) => {
        for (let a = 0; a <= 1.001; a += 0.04) {
          const ang = Math.PI * a - Math.PI / 2;
          g.put(cx + dir * Math.cos(ang) * 8, (ya + yb) / 2 + Math.sin(ang) * Math.abs(yb - ya) / 2, 'o', 4);
        }
      };
      loop(c0, ys[0](c0), ys[1](c0), -1);
      loop(c1, ys[1](c1), ys[2](c1), 1);
      g.text(Math.round(cols * 0.1), Math.round(rows * 0.12), "5'", 4);
    },

    // G-quadruplex: three stacked G-tetrads turning around a K+ ion
    g4(g, t) {
      const { cols, rows } = g;
      const cx = cols * 0.5, rx = cols * 0.16, ry = rows * 0.07;
      const levels = [0.3, 0.5, 0.7];
      const pts = levels.map((fy, k) => [0, 1, 2, 3].map(j => {
        const th = t * 0.45 + j * Math.PI / 2 + k * 0.28;
        return { x: cx + rx * Math.cos(th), y: rows * fy + ry * Math.sin(th), front: Math.sin(th) > 0 };
      }));
      // strand continuity between tetrads
      for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) g.line(pts[k][j].x, pts[k][j].y, pts[k + 1][j].x, pts[k + 1][j].y, '|', 2);
      pts.forEach((tet, k) => {
        for (let j = 0; j < 4; j++) {
          const a = tet[j], b = tet[(j + 1) % 4];
          for (let s = 0.12; s < 0.9; s += 0.08) g.put(a.x + (b.x - a.x) * s, a.y + (b.y - a.y) * s, '·', 5);
        }
        tet.forEach(p => g.put(p.x, p.y, 'G', p.front ? 7 : 5));
        g.text(cx - 1, rows * levels[k], 'K+', 7, true);
      });
    },

    // Forebrain assembloid: dorsal and ventral spheroids fused; interneurons (green) migrate ventral -> dorsal
    assembloid(g, t) {
      const { cols, rows } = g;
      const cy = rows * 0.5, R = Math.min(cols * 0.2, rows * 0.36);
      const L = { x: cols * 0.36, y: cy }, Rt = { x: cols * 0.64, y: cy };
      [L, Rt].forEach((s, k) => {
        for (let r = Math.round(s.y - R / 2) - 1; r <= s.y + R / 2 + 1; r++) {
          for (let c = Math.round(s.x - R) - 1; c <= s.x + R + 1; c++) {
            const d = Math.hypot((c - s.x) / R, (r - s.y) / (R / 2));
            if (d > 1.02) continue;
            if (d > 0.9) g.put(c, r, 'o', 4);
            else if (hash(c, r + k * 99) > 0.72) g.put(c, r, pick('.:·', c, r), 2);
          }
        }
      });
      g.text(Math.round(L.x - 3), Math.round(cy + R / 2 + 3), 'dorsal', 5);
      g.text(Math.round(Rt.x - 3), Math.round(cy + R / 2 + 3), 'ventral', 5);
      for (let i = 0; i < 16; i++) {
        const p = ((reduceMotion ? 0.5 : t * 0.045) + hash(i, 3)) % 1;
        const x = Rt.x + R * 0.4 - (Rt.x - L.x + R * 0.1) * p;
        const y = cy + (hash(i, 5) - 0.5) * R * 0.8 + Math.sin(p * Math.PI * 2 + i) * 1.2;
        g.put(x, y, '@', 7, true);
        g.put(x - 1, y, '-', 5);                                          // leading process
      }
    },

    // Confidence intervals: 95% intervals scrolling past the true mean; misses stand out
    ci(g, t) {
      const { cols, rows } = g;
      const cm = Math.round(cols * 0.5), half = cols * 0.13, sd = half / 1.96;
      const n = Math.floor((rows - 6) / 2), shift = reduceMotion ? 0 : Math.floor(t * 1.2);
      for (let r = 2; r < rows - 2; r++) g.put(cm, r, '|', 6, true);
      for (let i = 0; i < n; i++) {
        const id = i - shift;                                            // intervals slide down as new ones arrive
        const u1 = Math.max(1e-6, hash(id, 1)), u2 = hash(id, 2);
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2);
        const x = cm + z * sd, miss = Math.abs(x - cm) > half, r = 3 + i * 2;
        const lv = miss ? 7 : 4;
        g.put(x - half, r, '[', lv); g.put(x + half, r, ']', lv);
        for (let c = Math.round(x - half) + 1; c < x + half; c++) g.put(c, r, '-', miss ? 6 : 3);
        g.put(x, r, 'o', miss ? 7 : 6);
      }
      g.text(Math.round(cols * 0.06), rows - 2, '95% CI', 5);
      g.text(cm + 2, 1, 'true mean', 5);
    },

    // RNA Lab Navigator: a query pulls the top documents from a document graph
    rag(g, t) {
      const { cols, rows } = g;
      const q = { x: cols * 0.5, y: rows * 0.5 };
      const docs = Array.from({ length: 22 }, (_, i) => {
        const a = hash(i, 11) * TAU, d = 0.32 + 0.6 * hash(i, 13);
        return { x: q.x + Math.cos(a) * d * cols * 0.42, y: q.y + Math.sin(a) * d * rows * 0.42 };
      });
      for (let i = 0; i < docs.length; i++) {
        const j = Math.floor(hash(i, 17) * docs.length);
        if (j !== i) g.line(docs[i].x, docs[i].y, docs[j].x, docs[j].y, '.', 1, false, 2);
      }
      const round = reduceMotion ? 0 : Math.floor(t / 2.6);
      const top = new Set(Array.from({ length: 4 }, (_, i) => Math.floor(hash(round, i + 1) * docs.length)));
      docs.forEach((d, i) => {
        const hit = top.has(i);
        if (hit) g.line(q.x, q.y, d.x, d.y, '•', 5, true, 1);
        g.text(d.x - 1, d.y, '[=]', hit ? 7 : 4, hit);
      });
      g.text(q.x - 1, q.y, '(?)', 7, true);
    },
  };

  /* ---------- rendering ---------- */
  function setup(panel) {
    const scene = SCENES[panel.dataset.art];
    if (!scene) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    panel.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let grid, cw = 7.2, W = 0, H = 0, raf = 0, running = false, last = 0;
    const t0 = performance.now() - hash(panels.indexOf(panel)) * 20000;

    const size = () => {
      W = panel.clientWidth; H = panel.clientHeight;
      if (!W || !H) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      cw = ctx.measureText('M').width || 7.2;
      grid = new Grid(Math.ceil(W / cw), Math.ceil(H / LINE));
      return true;
    };
    const draw = t => {
      if (!grid && !size()) return;
      grid.clear();
      scene(grid, t);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.font = FONT;
      ctx.textBaseline = 'top';
      const buckets = GREYS.map(() => []), accents = [];
      for (let k = 0; k < grid.ch.length; k++) {
        if (!grid.ch[k]) continue;
        const x = (k % grid.cols) * cw, y = Math.floor(k / grid.cols) * LINE;
        (grid.ac[k] ? accents : buckets[Math.max(0, grid.lv[k])]).push(x, y, grid.ch[k]);
      }
      buckets.forEach((b, i) => { ctx.fillStyle = GREYS[i]; for (let j = 0; j < b.length; j += 3) ctx.fillText(b[j + 2], b[j], b[j + 1]); });
      ctx.fillStyle = GREEN;
      for (let j = 0; j < accents.length; j += 3) ctx.fillText(accents[j + 2], accents[j], accents[j + 1]);
    };
    const frame = now => {
      raf = requestAnimationFrame(frame);
      if (now - last < 50) return;                                     // ~20 fps
      last = now;
      draw((now - t0) / 1000);
    };
    const start = () => { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    size();
    draw(reduceMotion ? 6 : (performance.now() - t0) / 1000);
    let onScreen = false;
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && !document.hidden ? start() : stop(); }).observe(panel);
    document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? stop() : start()));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { grid = null; draw((performance.now() - t0) / 1000); }, 200); });
  }

  const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(() => panels.forEach(setup), () => panels.forEach(setup));
})();
