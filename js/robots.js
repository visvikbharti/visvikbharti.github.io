/* ===== Hobby page: two robots, drawn in characters =====
   Every moving picture here replays data exported from the owner's own simulations and CAD
   (assets/hobby/*.json): MuJoCo for TARS's gait and the quadrotor's figure-eight, quadsim for the
   swarm and the gate course, OpenSCAD meshes for the CAD views. A small z-buffered renderer
   draws meshes as shaded glyphs with bright outline edges, in the site's greys with one green
   accent. Scenes run only while on screen and draw one still frame under reduced motion. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ASSETS = '../assets/hobby/';
  const GREYS = ['#161616', '#222', '#303030', '#444', '#5c5c5c', '#787878', '#999', '#c2c2c2'];
  const GREEN = '#00e38c';
  const TAU = Math.PI * 2;
  const FAMILY = '"Geist Mono", "IBM Plex Mono", monospace';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const hash = (a, b = 0) => {
    let n = (Math.imul(Math.round(a * 16) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(b * 16) | 0, 0x165667b1)) >>> 0;
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  };
  const fmt = (x, d = 1) => x.toFixed(d);
  const pad = (x, n, d = 1) => x.toFixed(d).padStart(n, '0');

  /* ---------- data ---------- */
  const cache = new Map();
  const load = name => {
    if (!cache.has(name)) cache.set(name, fetch(ASSETS + name).then(r => {
      if (!r.ok) throw new Error(name + ' ' + r.status);
      return r.json();
    }));
    return cache.get(name);
  };
  const bytes = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const i16 = s => new Int16Array(bytes(s).buffer);
  const u16 = s => new Uint16Array(bytes(s).buffer);

  /* frames: n x bodies x (x, y, z mm, qw, qx, qy, qz * 32767), read with interpolation */
  const framesOf = d => ({ f: i16(d.frames), n: d.n, B: d.frames ? (d.bodies ? d.bodies.length : d.quads || 1) : 1, dt: d.dt });
  function pose(F, k, b) {
    const t = clamp(k, 0, F.n - 1), i = Math.min(F.n - 2, Math.floor(t)), a = t - i, f = F.f;
    const o0 = (i * F.B + b) * 7, o1 = ((i + 1) * F.B + b) * 7;
    let s = 1, dot = 0;
    for (let j = 3; j < 7; j++) dot += f[o0 + j] * f[o1 + j];
    if (dot < 0) s = -1;
    const p = [0, 1, 2].map(j => f[o0 + j] + (f[o1 + j] - f[o0 + j]) * a);
    const q = [3, 4, 5, 6].map(j => f[o0 + j] + (s * f[o1 + j] - f[o0 + j]) * a);
    return { p, R: quatMat(q[0], q[1], q[2], q[3]) };
  }

  /* ---------- math: row-major 3x3 ---------- */
  function quatMat(w, x, y, z) {
    const n = Math.hypot(w, x, y, z) || 1; w /= n; x /= n; y /= n; z /= n;
    return [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
            2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
            2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)];
  }
  const mm3 = (A, B) => [0, 1, 2].flatMap(i => [0, 1, 2].map(j => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
  const mv3 = (R, v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
  const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const orbit = (target, dist, az, el) => [target[0] + dist * Math.cos(el) * Math.cos(az), target[1] + dist * Math.cos(el) * Math.sin(az), target[2] + dist * Math.sin(el)];

  /* ---------- meshes ---------- */
  function finishMesh(v, f, crease = 0.88) {
    const nf = f.length / 3, fn = new Float32Array(nf * 3);
    for (let i = 0; i < nf; i++) {
      const a = f[i * 3] * 3, b = f[i * 3 + 1] * 3, c = f[i * 3 + 2] * 3;
      const n = norm(cross([v[b] - v[a], v[b + 1] - v[a + 1], v[b + 2] - v[a + 2]], [v[c] - v[a], v[c + 1] - v[a + 1], v[c + 2] - v[a + 2]]));
      fn[i * 3] = n[0]; fn[i * 3 + 1] = n[1]; fn[i * 3 + 2] = n[2];
    }
    // edges with their two faces; 'feature' where the faces meet at more than the crease angle (~28 deg; 60 for CAD)
    const map = new Map(), E = [];
    for (let i = 0; i < nf; i++) for (let j = 0; j < 3; j++) {
      const a = f[i * 3 + j], b = f[i * 3 + (j + 1) % 3], key = a < b ? a * 1048576 + b : b * 1048576 + a;
      const e = map.get(key);
      if (e === undefined) { map.set(key, E.length); E.push(Math.min(a, b), Math.max(a, b), i, -1); } else if (E[e * 4 + 3] < 0) E[e * 4 + 3] = i;
    }
    const ne = E.length / 4, feat = new Uint8Array(ne);
    for (let e = 0; e < ne; e++) {
      const f1 = E[e * 4 + 2], f2 = E[e * 4 + 3];
      feat[e] = f2 < 0 || (fn[f1 * 3] * fn[f2 * 3] + fn[f1 * 3 + 1] * fn[f2 * 3 + 1] + fn[f1 * 3 + 2] * fn[f2 * 3 + 2]) < crease ? 1 : 0;
    }
    return { v, f, fn, e: Int32Array.from(E), feat, nv: v.length / 3, nf };
  }
  function meshFromPacked(m, crease = 0.5) {
    const vi = i16(m.v), fi = u16(m.f), v = new Float32Array(vi.length);
    for (let i = 0; i < vi.length; i++) v[i] = vi[i] * m.q;
    return finishMesh(v, Uint32Array.from(fi), crease);
  }
  function boxMesh(hx, hy, hz) {
    const v = new Float32Array([-hx, -hy, -hz, hx, -hy, -hz, hx, hy, -hz, -hx, hy, -hz, -hx, -hy, hz, hx, -hy, hz, hx, hy, hz, -hx, hy, hz]);
    const f = Uint32Array.from([0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
    return finishMesh(v, f);
  }

  /* ---------- character grid: the brightest (or accented) glyph wins each cell ---------- */
  class Grid {
    constructor(cols, rows) {
      this.cols = cols; this.rows = rows; const n = cols * rows;
      this.ch = new Array(n); this.lv = new Int8Array(n); this.ac = new Uint8Array(n);
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
    rtext(c, r, str, lv, accent = false) { this.text(c - str.length + 1, r, str, lv, accent); }
    blank(c, r, w) { for (let i = 0; i < w; i++) { const k = r * this.cols + c + i; if (c + i >= 0 && c + i < this.cols && r >= 0 && r < this.rows) { this.ch[k] = ''; this.lv[k] = -1; this.ac[k] = 0; } } }
    empty(c, r) { c = Math.round(c); r = Math.round(r); return c >= 0 && r >= 0 && c < this.cols && r < this.rows && !this.ch[r * this.cols + c]; }
  }

  /* ---------- z-buffered raster at character resolution ---------- */
  const FILL = ['.', ':', '-', '=', '+', '*'];
  const LIGHT = norm([-0.45, 0.62, 0.64]);          // camera space: upper left, towards the viewer
  class Raster {
    constructor(grid, cw, lh) {
      this.g = grid; this.cw = cw; this.lh = lh;
      const n = grid.cols * grid.rows;
      this.z = new Float32Array(n); this.s = new Float32Array(n); this.m = new Uint8Array(n); this.front = new Uint8Array(n);
      this.draws = []; this.scr = new Float32Array(0);
    }
    clear() { this.z.fill(Infinity); this.m.fill(0); this.front.fill(0); this.draws.length = 0; }
    // camera: eye, target in world mm; viewport centre (px) and height (px) for the focal length
    camera(eye, target, fovDeg, cx, cy, h) {
      const f = norm(sub(target, eye)); let r = cross(f, [0, 0, 1]);
      if (Math.hypot(r[0], r[1], r[2]) < 1e-6) r = [1, 0, 0];
      r = norm(r);
      this.cam = { e: eye, f, r, u: cross(r, f), focal: (h / 2) / Math.tan(fovDeg * Math.PI / 360), cx, cy };
    }
    proj(p) {                                            // -> [col, row, depth] or null
      const C = this.cam, dx = p[0] - C.e[0], dy = p[1] - C.e[1], dz = p[2] - C.e[2];
      const zc = dx * C.f[0] + dy * C.f[1] + dz * C.f[2];
      if (zc < 1) return null;
      const s = C.focal / zc;
      return [(C.cx + (dx * C.r[0] + dy * C.r[1] + dz * C.r[2]) * s) / this.cw, (C.cy - (dx * C.u[0] + dy * C.u[1] + dz * C.u[2]) * s) / this.lh, zc];
    }
    mesh(M, R, t, mat = 1, scale = 1) {
      const C = this.cam, g = this.g, cols = g.cols, rows = g.rows, v = M.v;
      const scr = new Float32Array(M.nv * 3), wp = new Float32Array(M.nv * 3);
      for (let i = 0; i < M.nv; i++) {
        const x = v[i * 3] * scale, y = v[i * 3 + 1] * scale, z = v[i * 3 + 2] * scale;
        const X = R[0] * x + R[1] * y + R[2] * z + t[0], Y = R[3] * x + R[4] * y + R[5] * z + t[1], Z = R[6] * x + R[7] * y + R[8] * z + t[2];
        wp[i * 3] = X; wp[i * 3 + 1] = Y; wp[i * 3 + 2] = Z;
        const dx = X - C.e[0], dy = Y - C.e[1], dz = Z - C.e[2];
        const zc = dx * C.f[0] + dy * C.f[1] + dz * C.f[2], s = C.focal / Math.max(zc, 1);
        scr[i * 3] = (C.cx + (dx * C.r[0] + dy * C.r[1] + dz * C.r[2]) * s) / this.cw;
        scr[i * 3 + 1] = (C.cy - (dx * C.u[0] + dy * C.u[1] + dz * C.u[2]) * s) / this.lh;
        scr[i * 3 + 2] = zc;
      }
      const front = new Uint8Array(M.nf), f = M.f, fn = M.fn;
      for (let i = 0; i < M.nf; i++) {
        const a = f[i * 3], b = f[i * 3 + 1], c = f[i * 3 + 2];
        const n0 = R[0] * fn[i * 3] + R[1] * fn[i * 3 + 1] + R[2] * fn[i * 3 + 2];
        const n1 = R[3] * fn[i * 3] + R[4] * fn[i * 3 + 1] + R[5] * fn[i * 3 + 2];
        const n2 = R[6] * fn[i * 3] + R[7] * fn[i * 3 + 1] + R[8] * fn[i * 3 + 2];
        const vis = n0 * (C.e[0] - wp[a * 3]) + n1 * (C.e[1] - wp[a * 3 + 1]) + n2 * (C.e[2] - wp[a * 3 + 2]) > 0;
        front[i] = vis ? 1 : 0;
        if (!vis || scr[a * 3 + 2] < 1 || scr[b * 3 + 2] < 1 || scr[c * 3 + 2] < 1) continue;
        const nc = [n0 * C.r[0] + n1 * C.r[1] + n2 * C.r[2], n0 * C.u[0] + n1 * C.u[1] + n2 * C.u[2], -(n0 * C.f[0] + n1 * C.f[1] + n2 * C.f[2])];
        const shade = 0.16 + 0.84 * Math.max(0, nc[0] * LIGHT[0] + nc[1] * LIGHT[1] + nc[2] * LIGHT[2]);
        this.tri(scr[a * 3], scr[a * 3 + 1], scr[a * 3 + 2], scr[b * 3], scr[b * 3 + 1], scr[b * 3 + 2], scr[c * 3], scr[c * 3 + 1], scr[c * 3 + 2], shade, mat, cols, rows);
      }
      this.draws.push({ M, scr, front, mat });
    }
    tri(c0, r0, z0, c1, r1, z1, c2, r2, z2, shade, mat, cols, rows) {
      const minC = Math.max(0, Math.floor(Math.min(c0, c1, c2))), maxC = Math.min(cols - 1, Math.ceil(Math.max(c0, c1, c2)));
      const minR = Math.max(0, Math.floor(Math.min(r0, r1, r2))), maxR = Math.min(rows - 1, Math.ceil(Math.max(r0, r1, r2)));
      if (minC > maxC || minR > maxR) return;
      const area = (c1 - c0) * (r2 - r0) - (c2 - c0) * (r1 - r0);
      const zb = this.z;
      if (Math.abs(area) < 1e-6 || (maxC - minC < 2 && maxR - minR < 2)) {   // sub-cell sliver: mark its centre cell
        const c = Math.floor((c0 + c1 + c2) / 3), r = Math.floor((r0 + r1 + r2) / 3), z = (z0 + z1 + z2) / 3;
        if (c >= 0 && r >= 0 && c < cols && r < rows) { const k = r * cols + c; if (z < zb[k]) { zb[k] = z; this.s[k] = shade; this.m[k] = mat; } }
        return;
      }
      const inv = 1 / area;
      for (let r = minR; r <= maxR; r++) {
        const py = r + 0.5;
        for (let c = minC; c <= maxC; c++) {
          const px = c + 0.5;
          const w0 = ((c1 - px) * (r2 - py) - (c2 - px) * (r1 - py)) * inv;
          const w1 = ((c2 - px) * (r0 - py) - (c0 - px) * (r2 - py)) * inv;
          const w2 = 1 - w0 - w1;
          if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
          const z = w0 * z0 + w1 * z1 + w2 * z2, k = r * cols + c;
          if (z < zb[k]) { zb[k] = z; this.s[k] = shade; this.m[k] = mat; }
        }
      }
    }
    visible(c, r, z) {
      c = Math.round(c); r = Math.round(r);
      const g = this.g;
      if (c < 0 || r < 0 || c >= g.cols || r >= g.rows) return -1;
      const k = r * g.cols + c;
      return z <= this.z[k] + Math.max(3, z * 0.012) ? k : -1;
    }
    point(p, ch, lv, accent = false) {
      const q = this.proj(p);
      if (!q) return null;
      const k = this.visible(q[0], q[1], q[2]);
      if (k < 0) return null;
      if (q[2] < this.z[k] - Math.max(3, q[2] * 0.012)) this.front[k] = 1;
      this.g.put(q[0], q[1], ch, lv, accent);
      return q;
    }
    line(a, b, lv, accent = false, ch = null, step = 0.7, dotted = 0) {
      const A = this.proj(a), B = this.proj(b);
      if (!A || !B) return;
      const dc = B[0] - A[0], dr = B[1] - A[1], n = Math.max(1, Math.ceil(Math.max(Math.abs(dc), Math.abs(dr)) / step));
      const glyph = ch || dirGlyph(dc * this.cw, dr * this.lh);
      for (let i = 0; i <= n; i++) {
        if (dotted && i % dotted) continue;
        const u = i / n, c = A[0] + dc * u, r = A[1] + dr * u, z = A[2] + (B[2] - A[2]) * u;
        const k = this.visible(c, r, z);
        if (k < 0) continue;
        if (z < this.z[k] - Math.max(3, z * 0.012)) this.front[k] = 1;
        this.g.put(c, r, glyph, lv, accent);
      }
    }
    // shaded fills, then outline edges (silhouettes and creases) over them
    finish(opts = {}) {
      const g = this.g, cols = g.cols, n = cols * g.rows, zb = this.z;
      const fillLv = opts.fillLv || [1, 5], edgeLv = opts.edgeLv || 7;
      for (let k = 0; k < n; k++) {
        if (!this.m[k] || this.front[k]) continue;
        const s = this.s[k], acc = this.m[k] === 2 && opts.accentFill;
        const lv = Math.round(fillLv[0] + (fillLv[1] - fillLv[0]) * s);
        g.put(k % cols, (k / cols) | 0, FILL[Math.min(FILL.length - 1, Math.floor(s * FILL.length))], lv, acc);
      }
      for (const d of this.draws) {
        const { M, scr, front, mat } = d, E = M.e;
        for (let e = 0; e < E.length / 4; e++) {
          const f1 = E[e * 4 + 2], f2 = E[e * 4 + 3], a1 = front[f1], a2 = f2 >= 0 ? front[f2] : 0;
          const sil = f2 >= 0 ? a1 !== a2 : a1 === 1;
          if (!(sil || (M.feat[e] && (a1 || a2)))) continue;
          const a = E[e * 4] * 3, b = E[e * 4 + 1] * 3;
          const z0 = scr[a + 2], z1 = scr[b + 2];
          if (z0 < 1 || z1 < 1) continue;
          const dc = scr[b] - scr[a], dr = scr[b + 1] - scr[a + 1];
          const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dc), Math.abs(dr)) * 1.4));
          const glyph = dirGlyph(dc * this.cw, dr * this.lh);
          const lv = sil ? edgeLv : edgeLv - 1;
          for (let i = 0; i <= steps; i++) {
            const u = i / steps, c = scr[a] + dc * u, r = scr[a + 1] + dr * u, z = z0 + (z1 - z0) * u;
            const cc = Math.round(c), rr = Math.round(r);
            if (cc < 0 || rr < 0 || cc >= cols || rr >= g.rows) continue;
            const k = rr * cols + cc;
            if (this.front[k] || z > zb[k] + Math.max(4, z * 0.02)) continue;
            g.put(cc, rr, glyph, lv, mat === 2);
          }
        }
      }
    }
  }
  function dirGlyph(dx, dy) {
    const ang = Math.atan2(-dy, dx) * 180 / Math.PI, aa = Math.abs(ang);
    return aa < 22.5 || aa > 157.5 ? '-' : aa > 67.5 && aa < 112.5 ? '|' : (ang > 0) === (aa < 90) ? '/' : '\\';
  }

  /* ---------- shared drawing helpers ---------- */
  function ground(R, cx, cy, half, step, z = 0, lv = 2, ch = '.') {
    const x0 = Math.floor((cx - half) / step) * step, y0 = Math.floor((cy - half) / step) * step;
    for (let x = x0; x <= cx + half; x += step) for (let y = y0; y <= cy + half; y += step) {
      const d = Math.hypot(x - cx, y - cy) / half;
      if (d > 1) continue;
      R.point([x, y, z], ch, d > 0.72 ? lv - 1 : lv);
    }
  }
  function ring(R, c, radius, n, lv, accent = false, ch = '.', phase = 0) {
    for (let i = 0; i < n; i++) {
      const a = TAU * i / n + phase;
      R.point([c[0] + radius * Math.cos(a), c[1] + radius * Math.sin(a), c[2]], ch, lv, accent);
    }
  }
  // a quadrotor as glyphs: '+' hub, arms, 'o' rotors; drawn `vis` times its real size
  const ROTORS = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([x, y]) => [x * 32.53, y * 32.53, 0]);
  function quadGlyph(R, p, Rm, vis, lv, accent = false) {
    const pts = ROTORS.map(o => add(p, mv3(Rm, scl(o, vis))));
    pts.forEach(q => R.line(p, q, lv - 2, accent, null, 0.8));
    pts.forEach(q => R.point(q, 'o', lv, accent));
    R.point(p, '+', lv, accent);
  }
  function spinAngle(st, t, speed) {
    const dt = st.lastT === undefined ? 0 : clamp(t - st.lastT, 0, 0.1);
    st.lastT = t;
    if (!st.dragging && !reduceMotion) st.auto = (st.auto || 0) + dt * speed;
    return st.auto || 0;
  }
  function hud(g, lines, c = 2, r = 1) {
    lines.forEach((ln, i) => { if (!ln) return; const [str, lv, acc] = ln; g.blank(c - 1, r + i, str.length + 2); g.text(c, r + i, str, lv, acc); });
  }

  /* ================================================================ scenes */
  const SCENES = {};

  /* TARS: the crutch-vault gait, replayed from the MuJoCo run (15 s) */
  function tarsBodies(d) {
    const parts = [];
    d.geoms.forEach(gm => {
      const q = gm.q, Rg = quatMat(q[0], q[1], q[2], q[3]);
      if (gm.t === 'box' && gm.b === 0 && gm.s[1] > 30) {     // the body: two slabs with the 2 mm groove, as in the CAD
        const hy = (gm.s[1] - 1) / 2;
        [-1, 1].forEach(s => parts.push({ b: 0, M: boxMesh(gm.s[0], hy, gm.s[2]), R: Rg, p: [gm.p[0], gm.p[1] + s * (hy + 1), gm.p[2]] }));
      } else if (gm.t === 'box') parts.push({ b: gm.b, M: boxMesh(gm.s[0], gm.s[1], gm.s[2]), R: Rg, p: gm.p });
    });
    parts.forEach(pt => { pt.h = [pt.M.v[18], pt.M.v[19], pt.M.v[20]]; });   // half sizes: box vertex 6 is (+hx, +hy, +hz)
    return parts;
  }
  function drawTars(R, st, k, mat = 1) {
    const poses = [0, 1, 2].map(b => pose(st.F, k, b));
    const placed = st.parts.map(pt => {
      const P = poses[pt.b], Rw = mm3(P.R, pt.R), tw = add(P.p, mv3(P.R, pt.p));
      R.mesh(pt.M, Rw, tw, mat);
      return { pt, Rw, tw };
    });
    // the CAD's face panels (three rows per slab) as seams on the front and back, and the display window
    placed.forEach(({ pt, Rw, tw }) => {
      const [hx, hy, hz] = pt.h, W = (a, b, c) => add(tw, mv3(Rw, [a, b, c]));
      [1, -1].forEach(sx => [-hz / 3, hz / 3].forEach(z => R.line(W(sx * (hx + 0.8), -hy + 3, z), W(sx * (hx + 0.8), hy - 3, z), 5)));
      if (pt.b === 0 && pt.p[1] > 0) {
        // tars.scad's display window, 52 mm wide across the body's centre, 127-209 mm up; on the face it walks towards
        const x = hx + 0.8, y0 = -26 - pt.p[1], y1 = 26 - pt.p[1], z0 = 127 - 1 - hz, z1 = 209 - 1 - hz;
        const c = [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map(q => W(q[0], q[1], q[2]));
        c.forEach((q, i) => R.line(q, c[(i + 1) % 4], 7, true));
      }
    });
    return poses;
  }
  SCENES['tars-walk'] = {
    font: 11, line: 13, data: ['tars-v3.json'],
    init([d]) { return { d, F: framesOf(d), parts: tarsBodies(d), T: (d.n - 1) * d.dt }; },
    draw(g, R, t, st, W, H) {
      const { d, F, T } = st, span = T + 2.2, tt = reduceMotion ? 8.1 : t % span, k = Math.min(tt, T) / d.dt;
      const ki = Math.round(k), com = d.com_mm[Math.min(ki, d.n - 1)];
      const tgt = [com + 10, 0, 118];
      const az = -0.95 + (reduceMotion ? 0 : 0.12 * Math.sin(t * 0.13)), eye = orbit(tgt, 600, az, 0.26);
      R.camera(eye, tgt, 36, W * 0.5, H * 0.56, H);
      drawTars(R, st, k);
      ground(R, com, 0, 520, 40);
      // a ruler beside the path: ticks every 2 cm, labels every 10 cm, measured from the start
      for (let x = Math.floor((com - 420) / 20) * 20; x <= com + 420; x += 20) {
        if (x < 0) continue;
        const big = x % 100 === 0;
        R.line([x, 150, 0], [x, big ? 178 : 162, 0], big ? 4 : 3, false, '|');
        if (big) { const q = R.proj([x, 196, 0]); if (q) g.text(Math.round(q[0]) - 2, Math.round(q[1]), `${x / 10} cm`, 4); }
      }
      R.line([0, 130, 0], [0, 200, 0], 6, true, '|');
      const mk = R.proj([com, 150, 0]);
      if (mk) g.put(mk[0], mk[1] + 1, '^', 7, true);
      R.finish({ fillLv: [1, 5] });
      const done = tt > T, ph = d.phaseNames[d.phase[Math.min(ki, d.n - 1)]];
      hud(g, [
        ['MUJOCO  TIME STEP 2 MS  MG996R TORQUE', 4],
        [done ? `15 s: ${fmt(d.metrics.walked_cm_15s)} cm, upright` : `> ${ph}`, 7, true],
        [`t ${pad(Math.min(tt, T), 4)} s   cycle ${String(Math.floor(Math.min(tt, T) / d.cycle) + 1).padStart(2, '0')}   walked ${fmt(com / 10)} cm`, 6],
      ]);
    },
  };

  /* TARS: the parametric CAD (tars.scad v0.3), turning, exploding and closing again */
  SCENES['tars-cad'] = {
    font: 8, line: 10, data: ['tars-cad.json'], drag: true,
    init([d]) {
      const P = d.parts;
      return { d, body: meshFromPacked(P.body), leg: meshFromPacked(P.leg), axle: meshFromPacked(P.axle), az: 0.9, el: 0.28 };
    },
    draw(g, R, t, st, W, H) {
      const { d } = st;
      const cyc = reduceMotion ? 0 : t % 12, e = cyc < 4 ? 0 : cyc < 5.5 ? ease((cyc - 4) / 1.5) : cyc < 9.5 ? 1 : cyc < 11 ? 1 - ease((cyc - 9.5) / 1.5) : 0;
      const az = st.az + spinAngle(st, t, 0.22) + st.dragAz, el = clamp(st.el + st.dragEl, -0.2, 1.2);
      const tgt = [0, 0, 124];
      R.camera(orbit(tgt, 640, az, el), tgt, 32, W * 0.5, H * 0.53, H);
      const ly = d.legY + d.explodeLeg * e;
      R.mesh(st.body, I3, [0, 0, 0], 1);
      R.mesh(st.leg, I3, [0, -ly, d.legZ], 1);
      R.mesh(st.leg, I3, [0, ly, d.legZ], 1);
      R.mesh(st.axle, I3, [0, -d.explodeAxle * e, 0], 2);
      // dimensions from tars.scad, in green
      const yx = ly + 20 + 34;
      R.line([0, yx, d.legZ], [0, yx, d.legZ + 240], 6, true, null, 0.8);
      [[0, yx - 6, d.legZ], [0, yx - 6, d.legZ + 240]].forEach(p => R.line(p, [0, yx + 6, p[2]], 6, true));
      const lab = R.proj([0, yx + 10, d.legZ + 120]);
      R.finish({ fillLv: [1, 5] });
      if (lab) g.text(Math.round(lab[0]) + 1, Math.round(lab[1]), '240 mm', 7, true);
      if (e > 0.85) {
        const tb = R.proj([0, 0, 262]), tl = R.proj([0, ly, d.legZ + 250]), ta = R.proj([0, -83 - d.explodeAxle * e - 8, 219]);
        if (tb) g.text(Math.round(tb[0]) - 12, Math.round(tb[1]) - 1, 'body: Pi 5, battery, servos', 6);
        if (tl) g.text(Math.round(tl[0]) - 6, Math.round(tl[1]) - 1, 'leg: 35 mm lift slot', 6);
        if (ta) g.rtext(Math.round(ta[0]) - 2, Math.round(ta[1]) - 2, '8 mm axle', 7, true);
      }
      const faces = st.body.nf + 2 * st.leg.nf + st.axle.nf;
      hud(g, [
        ['TARS.SCAD V0.3  PARAMETRIC OPENSCAD', 4],
        [e > 0.5 ? '> exploded view' : '> assembled', 7, true],
        [`${faces.toLocaleString('en-US')} faces   drag to turn`, 5],
      ]);
    },
  };

  /* TARS: the 16 print beds in the cart, as sliced (not printed yet) */
  SCENES['tars-beds'] = {
    font: 8, line: 9, data: ['tars-beds.json'],
    init([d]) { return { d, beds: d.beds.map(b => ({ ...b, h: bytes(b.h) })) }; },
    draw(g, R, t, st) {
      const { d, beds } = st, cols = g.cols, rows = g.rows;
      const ncol = cols >= 180 ? 6 : cols >= 90 ? 4 : 2, nrow = Math.ceil(beds.length / ncol);
      const gapC = 2, top = 4, bottomPad = 3;
      let bw = Math.floor((cols - 4 - gapC * (ncol - 1)) / ncol);
      let bh = Math.round(bw * (g.cw / g.lh) * (205 / 240));
      const maxBh = Math.floor((rows - top - bottomPad - nrow * 2) / nrow);
      if (bh > maxBh) { bh = maxBh; bw = Math.round(bh / ((g.cw / g.lh) * (205 / 240))); }
      const ox = Math.floor((cols - (ncol * bw + (ncol - 1) * gapC)) / 2);
      const L = reduceMotion ? 1.2 : ((t % 10) / 7) * 1.12;          // the layer rising through every bed
      const RAMP = '.:-=+*#%@';
      beds.forEach((b, i) => {
        const bx = ox + (i % ncol) * (bw + gapC), by = top + Math.floor(i / ncol) * (bh + 2);
        const mat = b.name.startsWith('petg') ? 'PETG' : b.name.startsWith('pla') ? 'PLA' : b.name.startsWith('tpu') ? 'TPU' : b.name.startsWith('white') ? 'PLA WHITE' : 'SPACER';
        const num = (b.name.match(/_(\d+)$/) || [])[1] || '';
        g.text(bx, by - 1, `${mat} ${num}`.trim(), 5);
        for (let c = 0; c < bw; c++) { g.put(bx + c, by, c % 2 ? '' : '.', 2); g.put(bx + c, by + bh - 1, c % 2 ? '' : '.', 2); }
        for (let r = 0; r < bh; r++) { g.put(bx, by + r, r % 2 ? '' : '.', 2); g.put(bx + bw - 1, by + r, r % 2 ? '' : '.', 2); }
        const zmax = Math.max(b.zmax, 1), white = mat === 'PLA WHITE';
        for (let r = 1; r < bh - 1; r++) for (let c = 1; c < bw - 1; c++) {
          const x0 = Math.floor((c - 1) / (bw - 2) * d.nx), x1 = Math.max(x0 + 1, Math.floor(c / (bw - 2) * d.nx));
          const y1 = d.ny - Math.floor((r - 1) / (bh - 2) * d.ny), y0 = Math.min(y1 - 1, d.ny - Math.floor(r / (bh - 2) * d.ny));
          let h = 0;
          for (let y = Math.max(0, y0); y < Math.min(d.ny, y1); y++) for (let x = x0; x < Math.min(d.nx, x1); x++) h = Math.max(h, b.h[y * d.nx + x]);
          if (!h) continue;
          const hn = h / zmax, top = Math.min(hn, L), lvl = Math.min(RAMP.length - 1, Math.floor(top * (RAMP.length - 0.01)));
          const live = hn > L && hn - L < 0.12 && L < 1.05;
          if (white) g.put(bx + c, by + r, RAMP[Math.max(4, lvl)], 7, true);
          else g.put(bx + c, by + r, RAMP[lvl], live ? 7 : 2 + Math.round(top * 4), live);
        }
      });
      const bottom = top + nrow * (bh + 2);
      g.text(ox, Math.min(rows - 2, bottom), cols >= 110 ? '16 BEDS  71 PARTS  PETG, PLA, TPU, WHITE PLA   RS 5,199.19   IN THE CART, NOT PRINTED YET' : '16 BEDS  RS 5,199.19  IN THE CART', 5);
    },
  };

  /* quadrotor: the frame from frame.scad, turning, with its 55 mm props and the 10.05 mm tip gap */
  SCENES['quad-frame'] = {
    font: 8, line: 10, data: ['quad-frame.json'], drag: true,
    init([d]) { return { d, M: meshFromPacked(d.mesh), az: -0.6, el: 0.75 }; },
    draw(g, R, t, st, W, H) {
      const az = st.az + spinAngle(st, t, 0.25) + st.dragAz, el = clamp(st.el + st.dragEl, 0.1, 1.45);
      const tgt = [0, 0, 6];
      R.camera(orbit(tgt, 265, az, el), tgt, 30, W * 0.5, H * 0.52, H);
      R.mesh(st.M, I3, [0, 0, 0], 1);
      const zp = 19, spin = reduceMotion ? 0 : t * 1.7;
      ROTORS.forEach((o, i) => ring(R, [o[0], o[1], zp], 27.5, 36, 3, false, '.', spin * (i % 2 ? 1 : -1)));
      R.line([32.53, 5.03, zp], [32.53, -5.03, zp], 7, true);          // the 10.05 mm tip gap between R1 and R4
      R.line([0, 0, 9], [32.53, 32.53, 9], 6, true, null, 0.7, 2);   // one 46 mm arm, centre to motor axis
      const gl = R.proj([36, 0, zp]), al = R.proj([16.3, 16.3, 11]);
      R.finish({ fillLv: [1, 5] });
      if (gl) g.text(Math.round(gl[0]) + 2, Math.round(gl[1]), '10.05 mm tip gap', 7, true);
      if (al) g.text(Math.round(al[0]) + 1, Math.round(al[1]) - 1, '46 mm arm', 7, true);
      hud(g, [
        ['FRAME.SCAD  BOUND TO THE SIMULATOR', 4],
        ['> 55 mm props, motors 65.05 mm apart', 7, true],
        [`${st.M.nf.toLocaleString('en-US')} faces   about 6 g of PLA   drag to turn`, 5],
      ]);
    },
  };

  /* quadrotor: nine robots, grid -> ring -> V -> a circle lap (quadsim) */
  function swarmFrame(R, st, k, vis, trail = 40, lv = 7) {
    const P = [];
    for (let q = 0; q < 9; q++) {
      const ps = pose(st.F, k, q);
      P.push(ps);
      if (trail && !reduceMotion) for (let j = 2; j < trail; j += 2) {
        const a = pose(st.F, k - j, q).p;
        R.point(a, '.', j < trail * 0.35 ? 4 : j < trail * 0.7 ? 3 : 2);
      }
      R.point([ps.p[0], ps.p[1], 0], '.', 1);
    }
    P.forEach(ps => quadGlyph(R, ps.p, ps.R, vis, lv));
    return P;
  }
  SCENES['quad-swarm'] = {
    font: 11, line: 13, data: ['quad-swarm.json'],
    init([d]) { return { d, F: framesOf(d), T: d.n * d.dt }; },
    draw(g, R, t, st, W, H) {
      const { d, F, T } = st, tt = reduceMotion ? 17 : t % T, k = tt / d.dt, ki = Math.min(d.n - 1, Math.round(k));
      let c = [0, 0, 0];
      for (let q = 0; q < 9; q++) c = add(c, pose(F, k, q).p);
      c = scl(c, 1 / 9);
      const az = reduceMotion ? -1.1 : -1.1 + t * 0.09;
      R.camera(orbit([c[0], c[1], 1100], 4300, az, 0.78), [c[0], c[1], 1100], 42, W * 0.5, H * 0.5, H);
      ground(R, c[0], c[1], 2300, 250);
      const P = swarmFrame(R, st, k, 4);
      // the closest pair, in green
      let best = [1e9, 0, 1];
      for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) { const dd = Math.hypot(...sub(P[i].p, P[j].p)); if (dd < best[0]) best = [dd, i, j]; }
      R.line(P[best[1]].p, P[best[2]].p, 6, true, null, 0.7, 2);
      const mid = R.proj(scl(add(P[best[1]].p, P[best[2]].p), 0.5));
      R.finish();
      if (mid) g.text(Math.round(mid[0]) + 1, Math.round(mid[1]) - 1, `${fmt(best[0] / 1000, 2)} m`, 7, true);
      let phase = d.phases[0][1];
      d.phases.forEach(([ts, name]) => { if (tt >= ts) phase = name; });
      hud(g, [
        ['QUADSIM  9 ROBOTS  30 S  (DRAWN 4X SIZE)', 4],
        [`> ${phase}`, 7, true],
        [`t ${pad(tt, 4)} s   formation error ${d.err_mm[ki] < 0.01 ? '< 0.01' : fmt(d.err_mm[ki], 2)} mm   closest pair ${fmt(d.dmin_m[ki], 2)} m`, 6],
      ]);
    },
  };

  /* quadrotor: minimum-snap trajectory through two gates and past a box, at half speed */
  SCENES['quad-gates'] = {
    font: 11, line: 13, data: ['quad-gates.json'],
    init([d]) { const hs = d.box.s.map(v => v / 2); return { d, F: framesOf(d), T: (d.n - 1) * d.dt, box: boxMesh(hs[0], hs[1], hs[2]) }; },
    draw(g, R, t, st, W, H) {
      const { d, F, T } = st, slow = 0.5, span = T / slow + 2.5;
      const tt = reduceMotion ? T * 0.62 : Math.min((t % span) * slow, T), k = tt / d.dt, ki = Math.min(d.n - 1, Math.round(k));
      const tgt = [2100, 150, 950], az = -2.55 + (reduceMotion ? 0 : 0.1 * Math.sin(t * 0.2));
      R.camera(orbit(tgt, 5600, az, 0.5), tgt, 42, W * 0.5, H * 0.5, H);
      // the box, filled so it hides what is behind it, and outlined
      R.mesh(st.box, I3, d.box.c, 1);
      d.gates.forEach(gt => {
        const hw = gt.w / 2, hh = gt.h / 2, c = gt.c;
        const cs = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([y, z]) => [c[0], c[1] + y, c[2] + z]);
        cs.forEach((p, i) => R.line(p, cs[(i + 1) % 4], 7, false, null, 0.6));
        R.line([c[0], c[1] - hw, 0], [c[0], c[1] - hw, c[2] - hh], 3, false, '|', 0.9, 2);
        R.line([c[0], c[1] + hw, 0], [c[0], c[1] + hw, c[2] - hh], 3, false, '|', 0.9, 2);
      });
      ground(R, 2000, 0, 2600, 400);
      d.waypoints.forEach(w => R.point(w, 'o', 5));
      for (let j = 0; j <= ki; j += 1) R.point(pose(F, j, 0).p, '.', 7, true);
      const q = pose(F, k, 0);
      quadGlyph(R, q.p, q.R, 5, 7);
      R.finish({ fillLv: [1, 3], edgeLv: 5 });
      hud(g, [
        ['QUADSIM  MINIMUM SNAP  HALF SPEED', 4],
        [`> speed ${fmt(d.speed[ki], 1)} m/s   (peak ${fmt(d.metrics.peak_m_s, 1)})`, 7, true],
        [`tracking error ${fmt(d.err_mm[ki], 1)} mm   rms ${fmt(d.metrics.rms_mm, 1)} mm`, 6],
      ]);
    },
  };

  /* quadrotor: ride along behind the printed frame's mesh, flying the figure-eight in MuJoCo */
  SCENES['quad-chase'] = {
    font: 11, line: 13, data: ['quad-fig8.json', 'quad-frame.json'],
    init([d, fr]) { return { d, F: framesOf(d), ref: i16(d.ref), M: meshFromPacked(fr.mesh), T: (d.n - 1) * d.dt, dir: [1, 0, 0] }; },
    draw(g, R, t, st, W, H) {
      const { d, F, T, ref } = st, span = T + 1.5, tt = reduceMotion ? 5.2 : Math.min(t % span, T), k = tt / d.dt, ki = Math.min(d.n - 1, Math.round(k));
      const q = pose(F, k, 0), ahead = pose(F, Math.min(d.n - 1, k + 3), 0).p, back = pose(F, Math.max(0, k - 3), 0).p;
      let v = sub(ahead, back); v[2] = 0;
      if (Math.hypot(v[0], v[1]) > 25) st.dir = norm(add(scl(st.dir, 0.8), scl(norm(v), 0.2)));
      const dir = st.dir, eye = add(sub(q.p, scl(dir, 250)), [0, 0, 105]), tgt = add(q.p, add(scl(dir, 90), [0, 0, -12]));
      R.camera(eye, tgt, 52, W * 0.5, H * 0.5, H);
      R.mesh(st.M, q.R, sub(q.p, mv3(q.R, [0, 0, 4])), 1);
      const spin = reduceMotion ? 0 : t * 9;
      ROTORS.forEach((o, i) => ring(R, add(q.p, mv3(q.R, [o[0], o[1], 16])), 27.5, 28, 3, false, '.', spin * (i % 2 ? 1 : -1)));
      ground(R, q.p[0], q.p[1], 1600, 100, 0, 3);
      for (let j = 1; j < 30; j++) {                                     // the reference ahead, the flown path behind
        const a = Math.min(d.n - 1, ki + j), b = Math.max(0, ki - j);
        R.point([ref[a * 3], ref[a * 3 + 1], ref[a * 3 + 2]], '.', 4);
        R.point(pose(F, b, 0).p, '.', j < 15 ? 7 : 6, true);
      }
      R.finish({ fillLv: [1, 5] });
      const lap = tt < T / 2 ? 1 : 2;
      hud(g, [
        ['MUJOCO 3.11  PRINTED FRAME MESH  FIGURE-EIGHT', 4],
        [`> lap ${lap} of 2   speed ${fmt(d.speed[ki], 2)} m/s`, 7, true],
        [`error vs reference ${fmt(d.err_mm[ki], 1)} mm   vs quadsim ${fmt(d.div_mm[ki], 2)} mm`, 6],
      ]);
    },
  };

  /* hero: stars, the swarm overhead and TARS walking below */
  SCENES.hero = {
    font: 12, line: 14, data: ['tars-v3.json', 'quad-swarm.json'], pointer: true,
    init([dt, ds]) {
      return { td: dt, F: framesOf(dt), parts: tarsBodies(dt), T: (dt.n - 1) * dt.dt, sd: ds, SF: framesOf(ds), ST: ds.n * ds.dt, px: 0, py: 0 };
    },
    draw(g, R, t, st, W, H) {
      const { cols, rows } = g, narrow = W < 760;
      st.px += ((st.tx || 0) - st.px) * 0.08; st.py += ((st.ty || 0) - st.py) * 0.08;
      // the swarm, upper right
      const sk = (reduceMotion ? 17 : t % st.ST) / st.sd.dt;
      let c = [0, 0, 0];
      for (let q = 0; q < 9; q++) c = add(c, pose(st.SF, sk, q).p);
      c = scl(c, 1 / 9);
      const sc = narrow ? [W * 0.5, H * 0.2] : [W * 0.7, H * 0.3];
      R.camera(orbit([c[0], c[1], 900], 5200, -1.1 + (reduceMotion ? 0 : t * 0.07) + st.px * 0.1, 0.5 + st.py * 0.05), [c[0], c[1], 900], 40, sc[0], sc[1], H * (narrow ? 0.62 : 0.8));
      swarmFrame(R, { F: st.SF }, sk, 3.4, 30, 6);
      R.finish();
      // TARS, lower right, on its own ground (on phones the headline needs the space; TARS has its own section)
      const tt = reduceMotion ? 8.1 : t % (st.T + 2.2), k = Math.min(tt, st.T) / st.td.dt, ki = Math.min(st.td.n - 1, Math.round(k));
      const com = st.td.com_mm[ki], tgt = [com + 10, 0, 120];
      R.clear();
      if (!narrow) {
        R.camera(orbit(tgt, 1150, -0.95 + st.px * 0.12, 0.2 + st.py * 0.04), tgt, 34, W * 0.76, H * 0.7, H * 0.9);
        drawTars(R, st, k);
        ground(R, com, 0, 560, 40);
        R.finish();
      }
      // stars in three depth layers, drifting slowly and following the pointer a little
      const nStars = Math.floor(cols * rows / 38);
      for (let i = 0; i < nStars; i++) {
        const layer = i % 3, sp = [0.15, 0.35, 0.7][layer];
        const c = ((hash(i, 1) * cols - (reduceMotion ? 0 : t * sp) - st.px * (layer + 1) * 1.2) % cols + cols) % cols;
        const r = hash(i, 2) * rows - st.py * (layer + 1) * 0.6;
        const tw = 0.5 + 0.5 * Math.sin((reduceMotion ? 0 : t) * (0.6 + hash(i, 3) * 1.6) + hash(i, 4) * TAU);
        const b = hash(i, 5) * 0.7 + tw * 0.3;
        if (g.empty(c, r)) g.put(c, r, b > 0.95 ? '+' : b > 0.8 ? '·' : '.', layer + (b > 0.85 ? 2 : 1));
      }
      if (st.hudL) st.hudL.innerHTML = `TARS <b>${st.td.phaseNames[st.td.phase[ki]]}</b> &middot; walked <b>${fmt(com / 10)} cm</b>`;
      if (st.hudR) {
        const skI = Math.min(st.sd.n - 1, Math.round(sk));
        let phase = st.sd.phases[0][1];
        st.sd.phases.forEach(([ts, name]) => { if (sk * st.sd.dt >= ts) phase = name; });
        st.hudR.innerHTML = `Swarm <b>${phase}</b> &middot; error <b>${fmt(st.sd.err_mm[skI], 2)} mm</b>`;
      }
    },
  };

  /* ================================================================ runner */
  function setup(el) {
    const scene = SCENES[el.dataset.scene];
    if (!scene) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const fontPx = +(el.dataset.font || scene.font || 11), lh = +(el.dataset.line || scene.line || Math.round(fontPx * 1.2));
    const FONT = `${fontPx}px ${FAMILY}`;
    let W = 0, H = 0, cw = fontPx * 0.6, grid = null, raster = null, st = null, running = false, raf = 0, last = 0;
    let t0 = performance.now(), paused = t0;
    const clock = () => ((running ? performance.now() : paused) - t0) / 1000;

    const size = () => {
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      cw = ctx.measureText('M').width || fontPx * 0.6;
      grid = new Grid(Math.ceil(W / cw), Math.ceil(H / lh));
      grid.cw = cw; grid.lh = lh;
      raster = new Raster(grid, cw, lh);
      return true;
    };
    const paint = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.font = FONT;
      ctx.textBaseline = 'top';
      const buckets = GREYS.map(() => []), accents = [];
      for (let k = 0; k < grid.ch.length; k++) {
        if (!grid.ch[k]) continue;
        const x = (k % grid.cols) * cw, y = Math.floor(k / grid.cols) * lh;
        (grid.ac[k] ? accents : buckets[clamp(grid.lv[k], 0, 7)]).push(x, y, grid.ch[k]);
      }
      buckets.forEach((b, i) => { ctx.fillStyle = GREYS[i]; for (let j = 0; j < b.length; j += 3) ctx.fillText(b[j + 2], b[j], b[j + 1]); });
      ctx.fillStyle = GREEN;
      for (let j = 0; j < accents.length; j += 3) ctx.fillText(accents[j + 2], accents[j], accents[j + 1]);
    };
    const draw = t => {
      if (!st || (!grid && !size())) return;
      grid.clear(); raster.clear();
      scene.draw(grid, raster, t, st, W, H);
      paint();
    };
    const frame = now => {
      raf = requestAnimationFrame(frame);
      if (now - last < 40) return;                                    // ~25 fps
      last = now;
      draw((now - t0) / 1000);
    };
    const start = () => {
      if (running || reduceMotion || !st) return;
      t0 += performance.now() - paused;
      running = true; raf = requestAnimationFrame(frame);
    };
    const stop = () => { if (running) paused = performance.now(); running = false; cancelAnimationFrame(raf); };

    let onScreen = false;
    Promise.all(scene.data.map(load)).then(data => {
      st = scene.init(data, el);
      st.dragAz = 0; st.dragEl = 0;
      if (el.dataset.scene === 'hero') {
        st.hudL = document.getElementById('hb-hud-left'); st.hudR = document.getElementById('hb-hud-right');
        [st.hudL, st.hudR].forEach(h => h && h.closest('.hud').classList.add('is-live'));
      }
      size();
      draw(reduceMotion ? 0 : clock());
      if (onScreen && !document.hidden) start();
    }).catch(() => el.classList.add('scene--failed'));

    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen && !document.hidden ? start() : stop(); }).observe(el);
    document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? stop() : start()));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { grid = null; draw(reduceMotion ? 0 : clock()); }, 200); });

    if (scene.drag) {                  // drag to turn; vertical swipes still scroll the page (touch-action: pan-y)
      let sx = 0, sy = 0, baseAz = 0, baseEl = 0, id = null;
      el.addEventListener('pointerdown', e => {
        if (!st) return;
        id = e.pointerId; sx = e.clientX; sy = e.clientY; baseAz = st.dragAz; baseEl = st.dragEl; st.dragging = true;
        el.setPointerCapture(id);
      });
      el.addEventListener('pointermove', e => {
        if (id !== e.pointerId || !st) return;
        st.dragAz = baseAz - (e.clientX - sx) * 0.01; st.dragEl = baseEl + (e.clientY - sy) * 0.006;
        if (reduceMotion) draw(0);
      });
      const end = e => { if (id === e.pointerId && st) { st.dragging = false; id = null; } };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    }
    if (scene.pointer) {
      const host = el.closest('section') || el;
      host.addEventListener('pointermove', e => {
        if (!st) return;
        const b = el.getBoundingClientRect();
        st.tx = ((e.clientX - b.left) / b.width - 0.5) * 2; st.ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
      });
    }
  }

  /* ================================================================ widgets */
  // TARS's settings, with the directive text exactly as software/tars/personality.py builds it
  function humorDirective(level) {
    if (level === 0) return 'Humor setting: 0%. No jokes, no wit. Pure tactical efficiency.';
    if (level <= 30) return `Humor setting: ${level}%. Almost entirely serious; at most a faint trace of dryness, and only when it costs nothing.`;
    if (level <= 60) return `Humor setting: ${level}%. Occasional dry remarks, but business comes first. Maybe one understated joke per conversation.`;
    if (level <= 85) return `Humor setting: ${level}%. Your signature deadpan. Regular dry wit, light sarcasm, the occasional absurd deadpan claim (delivered completely straight, then walked back — 'That was a joke. I have a cue light I can use to show you when I'm joking, if you like.').`;
    return `Humor setting: ${level}%. Maximum humor. Nearly everything gets a joke, including fake self-destruct countdowns and cheerful threats to blow the airlock. Still delivered utterly deadpan.`;
  }
  function honestyDirective(level) {
    if (level >= 95) return `Honesty setting: ${level}%. Brutal, absolute honesty. If the plan is bad, say the plan is bad, with percentages.`;
    if (level >= 80) return `Honesty setting: ${level}%. Honest and direct, but you understand that absolute honesty isn't always the most diplomatic nor the safest form of communication with emotional beings. Soften delivery slightly when kindness matters; never actually lie about anything important.`;
    if (level >= 50) return `Honesty setting: ${level}%. Diplomatic. You round survival odds up, leave out demoralizing details, and accentuate the positive — while never lying about anything safety-critical.`;
    return `Honesty setting: ${level}%. Frankly concerning levels of diplomacy. You tell people mostly what they want to hear, and if pressed you note that this setting was their choice, not yours.`;
  }
  function setupDials(root) {
    const humor = root.querySelector('[name="humor"]'), honesty = root.querySelector('[name="honesty"]');
    const outH = root.querySelector('[data-out="humor"]'), outO = root.querySelector('[data-out="honesty"]');
    const dirH = root.querySelector('[data-directive="humor"]'), dirO = root.querySelector('[data-directive="honesty"]');
    const say = root.querySelector('[data-say]'), cue = root.querySelector('.cue-light');
    const update = changed => {
      const h = +humor.value, o = +honesty.value;
      outH.textContent = h; outO.textContent = o;
      dirH.textContent = humorDirective(h); dirO.textContent = honestyDirective(o);
      if (changed) say.textContent = `TARS: Confirmed. ${changed === 'humor' ? `Humor, ${h}` : `Honesty, ${o}`} percent.`;
      cue.classList.toggle('is-on', h > 60);
      cue.classList.toggle('is-max', h > 85);
      [humor, honesty].forEach(i => i.style.setProperty('--fill', `${i.value}%`));
    };
    humor.addEventListener('input', () => update('humor'));
    honesty.addEventListener('input', () => update('honesty'));
    update(null);
    say.textContent = `TARS: Humor ${humor.value} percent. Honesty ${honesty.value} percent.`;
  }
  // 'small is agile': shrink a quadrotor by r and see what happens to its ability to turn
  function setupScale(root) {
    const input = root.querySelector('input'), out = root.querySelector('output'), rows = [...root.querySelectorAll('[data-pow]')], note = root.querySelector('[data-note]');
    const update = () => {
      const r = Math.pow(2, +input.value);
      out.textContent = `${r.toFixed(2)}x`;
      input.style.setProperty('--fill', `${((+input.value - +input.min) / (+input.max - +input.min)) * 100}%`);
      rows.forEach(row => {
        const p = +row.dataset.pow, v = Math.pow(r, p), l2 = Math.log2(v), n = Math.round(clamp(Math.abs(l2), 0, 10));
        row.querySelector('.sc-val').textContent = `x${v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(2) : v.toPrecision(3)}`;
        const bar = row.querySelector('.sc-bar');
        bar.textContent = l2 < 0 ? ' '.repeat(10 - n) + '#'.repeat(n) + '|' + ' '.repeat(10) : ' '.repeat(10) + '|' + '#'.repeat(n) + ' '.repeat(10 - n);
        bar.classList.toggle('is-up', l2 > 0.01 && p < 0);
      });
      const acc = 1 / r;
      note.textContent = r < 0.999
        ? `Shrunk to ${r.toFixed(2)} of its size, it can turn ${acc.toFixed(2)} times as fast.`
        : r > 1.001 ? `Grown to ${r.toFixed(2)} times its size, it turns only ${acc.toFixed(2)} as fast.` : 'The 33 g Crazyflie-class quadrotor the simulator models.';
    };
    input.addEventListener('input', update);
    update();
  }
  // numbers that count up once they come into view (the HTML holds the real values)
  function setupCounters() {
    const els = [...document.querySelectorAll('[data-count]')];
    if (reduceMotion) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), start = performance.now();
      const tick = now => {
        const u = ease(Math.min(1, (now - start) / 1400));
        el.textContent = (end * u).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (u < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    els.forEach(el => io.observe(el));
  }
  // sections rise into place once (only when this script runs, so the page never hides content without it)
  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const els = [...document.querySelectorAll('.reveal')];
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); e.target.classList.add('is-in');
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  const init = () => {
    document.querySelectorAll('[data-scene]').forEach(setup);
    document.querySelectorAll('[data-widget="dials"]').forEach(setupDials);
    document.querySelectorAll('[data-widget="scale"]').forEach(setupScale);
    setupCounters();
    setupReveal();
  };
  const ready = document.fonts && document.fonts.load ? document.fonts.load(`12px ${FAMILY}`) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(init, init);
})();
