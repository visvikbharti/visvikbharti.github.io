/* ===== Project drawings in characters =====
   Each .split__img[data-art] panel (and the About story's .journey__art) gets a small animated
   scene drawn on a character grid, in the same language as the hero: grey glyphs, one green
   accent. Scenes animate only while on screen (~20 fps) and are drawn once, still, under
   reduced motion. */
(() => {
  const panels = [...document.querySelectorAll('.split__img[data-art], .journey__art[data-art]')];
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
  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

  /* Ubiquitin, PDB 1UBQ: sequence and C-alpha trace (0.1 Å units), centred and turned to its principal
     axes by a proper rotation, so the fold is not mirrored */
  const UBQ_SEQ = 'MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG';
  const UBQ_CA = [
    119,-60,-37,89,-79,-25,65,-64,1,33,-77,16,0,-58,18,-24,-73,44,-61,-65,40,-88,-65,66,-103,-97,52,-72,-118,59,
    -60,-118,23,-23,-108,19,-12,-95,-15,25,-96,-26,38,-67,-47,71,-61,-64,83,-26,-58,114,-4,-56,120,19,-26,120,
    48,-51,84,42,-60,59,67,-47,29,57,-26,6,68,-55,24,42,-76,20,14,-50,-18,22,-49,-20,19,-87,-2,-15,-86,-28,-26,
    -59,-56,-14,-82,-42,-32,-111,-39,-65,-92,-70,-66,-69,-92,-39,-85,-95,-16,-55,-97,21,-65,-68,42,-52,-92,67,
    -36,-105,39,-13,-70,28,-1,-55,39,32,-19,24,36,-4,20,71,32,12,81,47,15,115,16,33,127,19,61,101,-7,66,72,14,
    67,40,10,99,18,8,97,-20,37,119,-30,63,103,-7,84,73,-18,87,40,2,123,50,10,110,81,28,94,57,53,124,33,55,103,4,
    42,127,-25,36,123,-58,17,97,-81,30,79,-54,51,41,-57,55,19,-26,50,-17,-27,62,-45,-17,38,-77,-2,53,-105,7,29,
    -123,40,32,-156,37,11,-174,69,-1,-209,65,12,-227,48,41];
  const NATIVE = Array.from({ length: UBQ_SEQ.length }, (_, i) => UBQ_CA.slice(i * 3, i * 3 + 3).map(v => v / 10));
  const TILT = 0.35;                                  // the view looks slightly down on the chain
  const UBQ_X = 23.1, UBQ_Y = 14.3;                   // how far the fold reaches across and up, turned any way (Å)
  // The k-th random shape the chain tries: a random walk of 3.8 Å steps, loosely held near the centre,
  // then centred and shrunk (never stretched) to reach no further than the fold does
  const coils = new Map();
  const coil = k => {
    if (coils.has(k)) return coils.get(k);
    const P = [];
    let x = 0, y = 0, z = 0, dx = 1, dy = 0, dz = 0;
    for (let i = 0; i < NATIVE.length; i++) {
      dx = dx * 0.5 + hash(k, i * 3 + 1) * 2 - 1 - x * 0.015;
      dy = dy * 0.5 + hash(k, i * 3 + 2) * 2 - 1 - y * 0.045;
      dz = dz * 0.5 + hash(k, i * 3 + 3) * 2 - 1 - z * 0.015;
      const n = Math.hypot(dx, dy, dz) || 1;
      x += dx / n * 3.8; y += dy / n * 3.8; z += dz / n * 3.8;
      P.push([x, y, z]);
    }
    const m = [0, 1, 2].map(a => P.reduce((s, p) => s + p[a], 0) / P.length);
    P.forEach(p => { for (let a = 0; a < 3; a++) p[a] -= m[a]; });
    const across = Math.max(...P.map(p => Math.hypot(p[0], p[2])));
    const up = Math.max(...P.map(p => Math.abs(p[1]) * Math.cos(TILT) + Math.hypot(p[0], p[2]) * Math.sin(TILT)));
    const f = Math.min(1, UBQ_X / across, UBQ_Y / up);
    P.forEach(p => { for (let a = 0; a < 3; a++) p[a] *= f; });
    if (coils.size > 48) coils.clear();
    coils.set(k, P);
    return P;
  };
  // Seconds into the 16 s story: circuit, release, random search, fold, hold, back to the circuit
  const FOLD = { circuit: 3, release: 4.2, search: 8.6, fold: 10.8, hold: 14.6, loop: 16 };

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

    // From circuits to cells (About): a clocked circuit trace goes slack, tries shapes at random while the
    // Levinthal count runs (3^76 shapes at 1e13 a second), then folds into ubiquitin with nothing directing it
    fold(g, t) {
      const { cols, rows } = g, cw = g.cw || 7.2, N = UBQ_SEQ.length;
      const { circuit: C1, release: R1, search: S1, fold: F1, hold: H1, loop: L } = FOLD;
      const T = reduceMotion ? 12 : t % L, run = Math.floor(t / L);
      const W = cols * cw, H = (rows - 4) * LINE;                          // the bottom rows hold the readout
      const s = Math.min(W * 0.45 / UBQ_X, H * 0.46 / UBQ_Y), ox = W * 0.5, oy = H * 0.52;   // px per Å, centre

      // the circuit: four rows of 19 nodes, wired as one serpentine trace (in Å, to blend with the chain)
      const circ = i => {
        const r = Math.floor(i / 19), j = r % 2 ? 18 - (i % 19) : i % 19;
        return [(-0.37 * W + j * 0.74 * W / 18) / s, (0.3 * H - r * 0.2 * H) / s];
      };
      // the chain: random shapes (0.4 s each, blended), then the fold, N-terminus first
      const shape = T => {
        const u = Math.max(0, T - C1) / 0.4, k = Math.floor(u), f = ease(u - k);
        const a = coil(run * 97 + k), b = coil(run * 97 + k + 1);
        return a.map((p, i) => p.map((v, x) => v + (b[i][x] - v) * f));
      };
      let chain = NATIVE;
      if (T < S1) chain = shape(T);
      else if (T < F1) {
        const from = shape(S1), u = (T - S1) / (F1 - S1);
        chain = from.map((p, i) => { const f = ease(u * 1.6 - i / N * 0.6); return p.map((v, x) => v + (NATIVE[i][x] - v) * f); });
      }
      const w = T < C1 ? 0 : T < R1 ? ease((T - C1) / (R1 - C1)) : T < H1 ? 1 : 1 - ease((T - H1) / (L - H1));
      const th = reduceMotion ? 0.6 : t * 0.3, ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(TILT), sp = Math.sin(TILT);
      const P = chain.map((p, i) => {
        const x1 = p[0] * ct + p[2] * st, z1 = -p[0] * st + p[2] * ct;
        const y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;
        const [cx, cy] = circ(i), X = cx + (x1 - cx) * w, Y = cy + (y2 - cy) * w;
        return { c: (ox + X * s) / cw, r: (oy - Y * s) / LINE, d: Math.max(-1, Math.min(1, z2 * w / 22)) };
      });

      // bonds, drawn with the character closest to their direction; the back is dimmer
      for (let i = 0; i < N - 1; i++) {
        const a = P[i], b = P[i + 1], dc = b.c - a.c, dr = b.r - a.r, n = Math.max(Math.abs(dc), Math.abs(dr), 1);
        const ang = Math.atan2(-dr * LINE, dc * cw) * 180 / Math.PI, aa = Math.abs(ang);
        const ch = aa < 22.5 || aa > 157.5 ? '-' : aa > 67.5 && aa < 112.5 ? '|' : (ang > 0) === (aa < 90) ? '/' : '\\';
        for (let k = 1; k < n; k++) g.put(a.c + dc * k / n, a.r + dr * k / n, ch, 2 + Math.round((a.d + b.d) / 2 + 1));
      }
      // residues: circuit nodes decode into the sequence as the trace goes slack, and back again
      P.forEach((p, i) => {
        const named = reduceMotion || (T < H1 ? T > C1 + hash(i, 5) * (R1 - C1) : T < H1 + hash(i, 6) * (L - H1));
        g.put(p.c, p.r, named ? UBQ_SEQ[i] : 'o', w ? 4 + Math.round((p.d + 1) * 1.5) : 6);
      });
      // the clock pulse runs once along the trace before the controller goes away
      if (!reduceMotion && T < C1) {
        [0, 0.35, 0.7].forEach((back, j) => {
          const q = T / C1 * (N - 1) - back;
          if (q < 0) return;
          const k = Math.min(N - 2, Math.floor(q)), f = q - k;
          g.put(P[k].c + (P[k + 1].c - P[k].c) * f, P[k].r + (P[k + 1].r - P[k].r) * f, j ? '*' : '@', 7, true);
        });
      }

      // readout
      const hr = rows - 4, hv = 14, sci = x => x.toExponential(1).replace('e+', 'e');
      const folded = T >= F1 && T < H1 + 0.6;
      g.text(2, hr, 'controller', 4);
      g.text(hv, hr, T < C1 || T >= H1 + 0.6 ? 'clock' : 'none', folded ? 7 : 6, folded);
      if (T < C1 || T >= H1 + 0.6) {
        g.text(2, hr + 1, 'trace', 4); g.text(hv, hr + 1, '76 nodes', 6);
      } else if (T < S1) {
        const wide = cols >= 52, tried = T - C1 < 0.1 ? '0' : sci((T - C1) * 1e13);
        g.text(2, hr + 1, 'shapes', 4); g.text(hv, hr + 1, `3^76 ≈ 1.8e36${wide ? `   tried ${tried}` : ''}`, 6);
        g.text(2, hr + 2, 'to try all', 4);
        g.text(hv, hr + 2, `≈ 5.8e15 yr${wide ? '   universe ≈ 1.4e10 yr' : ' (universe 1.4e10)'}`, 6);
      } else {
        g.text(2, hr + 1, T < F1 ? 'folding' : 'folded', 4);
        g.text(hv, hr + 1, 'ubiquitin, 76 residues (PDB 1UBQ)', 6);
      }
    },
  };
  SCENES.fold.fromStart = true;                                         // a story: begin at the circuit

  /* ---------- rendering ---------- */
  function setup(panel) {
    const scene = SCENES[panel.dataset.art];
    if (!scene) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    panel.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let grid, cw = 7.2, W = 0, H = 0, raf = 0, running = false, last = 0;
    // Scenes start at a random phase. A 'fromStart' scene tells a story, so it starts at 0 when first
    // seen and pauses, rather than skipping ahead, while off screen.
    let t0 = performance.now() - (scene.fromStart ? 0 : hash(panels.indexOf(panel)) * 20000), paused = t0;
    const clock = () => ((scene.fromStart && !running ? paused : performance.now()) - t0) / 1000;

    const size = () => {
      W = panel.clientWidth; H = panel.clientHeight;
      if (!W || !H) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      cw = ctx.measureText('M').width || 7.2;
      grid = new Grid(Math.ceil(W / cw), Math.ceil(H / LINE));
      grid.cw = cw;
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
    const start = () => {
      if (running || reduceMotion) return;
      if (scene.fromStart) t0 += performance.now() - paused;
      running = true; raf = requestAnimationFrame(frame);
    };
    const stop = () => { if (running) paused = performance.now(); running = false; cancelAnimationFrame(raf); };

    size();
    draw(reduceMotion ? 6 : clock());
    let onScreen = false;
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && !document.hidden ? start() : stop(); }).observe(panel);
    document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? stop() : start()));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { grid = null; draw(reduceMotion ? 6 : clock()); }, 200); });
  }

  const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(() => panels.forEach(setup), () => panels.forEach(setup));
})();
