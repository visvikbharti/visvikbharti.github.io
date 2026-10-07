/* ===== Point drawings: the research areas as moving clouds of points =====
   A different language from the character drawings on the home page (project-art.js). One pool of
   points takes a research area's shape and keeps moving in it: a turning RNA triple helix, a turning
   G-quadruplex, cells being sorted by a repair reporter, neurons in an assembloid with interneurons
   migrating across it, data checked before a test (histogram, then Q-Q plot), articles read for a
   recomputable statistic, confidence intervals around a true mean, and a query finding its nearest
   documents. When the shape changes, the points fly to their new places in under a second.

   Mounted on
   - the Research stage (.research-stage): the slides under the drawing (.stage-slide, data-scene naming
     the formation) are its controls. A marker's CSS fill (5 s) is the slideshow's clock: when it ends,
     the next area comes in. Hovering or focusing the stage, the Pause button, or scrolling the stage away
     pause it. Under reduced motion each area is a still and changes only on request.
   - each project page's hero (.hero-art__frame[data-points]): one formation, with a Pause button.
   Drawings run only while on screen and the tab is visible; under reduced motion they are stills. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TAU = Math.PI * 2;
  const N = 1100;                                    // points in the pool
  const MORPH = 900;                                 // ms for the points to reach a new formation
  const GREYS = ['#151515', '#262626', '#3d3d3d', '#5c5c5c', '#7f7f7f', '#a6a6a6', '#cfcfcf', '#f2ede3'];
  const GREEN = [0, 227, 140];
  const FONT = '12px "Geist Mono", "IBM Plex Mono", monospace';

  // Integer hash, as in project-art.js: deterministic, well spread on whole numbers
  const hash = (a, b = 0) => {
    let n = (Math.imul(Math.round(a * 16) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(b * 16) | 0, 0x165667b1)) >>> 0;
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

  /* ---------- a fixed sample for the statistics formation ---------- */
  // 360 normal values (Box-Muller on the hash) plus three outliers, sorted; each with its histogram bin,
  // its place in that bin's stack, and its theoretical normal quantile for the Q-Q plot
  const D = 360, BINS = 24, ZMIN = -3.2, ZMAX = 3.2;
  const zs = Array.from({ length: D }, (_, i) => Math.sqrt(-2 * Math.log(hash(i, 21) * 0.999 + 0.0005)) * Math.cos(TAU * hash(i, 22)));
  zs.sort((a, b) => a - b);
  for (let k = 0; k < 3; k++) zs[D - 1 - k] = 3.9 + k * 0.45;   // three outliers above the rest
  const binOf = z => clamp(Math.floor((z - ZMIN) / (ZMAX - ZMIN) * BINS), 0, BINS - 1);
  const inBin = new Int16Array(D), binCount = new Int16Array(BINS);
  zs.forEach((z, i) => { const b = binOf(z); inBin[i] = binCount[b]++; });
  const maxBin = Math.max(...binCount);
  const quantile = p => 4.91 * (Math.pow(p, 0.14) - Math.pow(1 - p, 0.14));   // Tukey's approximation of the normal quantile

  // Checkability audit: a wall of 16 x 6 articles, about 1 in 10 checkable, and never none
  const AUD_C = 14, AUD_R = 6;
  const PAGE = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [0, 3], [1, 3]];   // a title, then lines
  let AUD_MIN = 0;
  for (let n = 1; n < AUD_C * AUD_R; n++) if (hash(n, 7) < hash(AUD_MIN, 7)) AUD_MIN = n;

  /* ---------- formations: f(i, t, tl, W, H, o) places point i ---------- */
  // t: seconds since the stage started; tl: seconds since this area came in. A formation sets o.x, o.y,
  // o.lv (grey level 0-7, or the green's strength when o.g) and o.s (size in px). Points it does not need
  // become dust: very dim, drifting slowly, ready to join the next formation.
  const dust = (i, t, W, H, o) => {
    o.x = hash(i, 1) * W + Math.sin(t * 0.08 + i) * 8;
    o.y = hash(i, 2) * H + Math.cos(t * 0.06 + i * 1.3) * 8;
    o.lv = 0; o.g = false; o.s = 1;
  };

  const F = {
    // RNA triple helix (TRIPinRNA): two paired strands and a third (green) in the major groove, joined
    // by two loops into one molecule, turning about its axis
    triplex(i, t, tl, W, H, o) {
      const S = 170, x0 = W * 0.17, L = W * 0.66, cy = H * 0.5, R = Math.min(H * 0.17, W * 0.075);
      const spin = reduceMotion ? 0.6 : t * 0.9, turns = 3.2, phase = [0, 2.3, 4.1];
      const at = (k, s) => { const a = TAU * turns * s + spin + phase[k]; return [x0 + L * s, cy + R * Math.sin(a), Math.cos(a)]; };
      if (i < 3 * S) {
        const k = Math.floor(i / S), [x, y, z] = at(k, (i % S) / (S - 1));
        o.x = x; o.y = y; o.g = k === 2; o.lv = z > 0 ? 7 : 4; o.s = z > 0 ? 2.6 : 1.7; return;
      }
      let j = i - 3 * S;
      const RUNGS = 26, PER = 5;
      if (j < 2 * RUNGS * PER) {                    // base pairs (grey) and the third strand's Hoogsteen pairs (green)
        const hoog = j >= RUNGS * PER; j %= RUNGS * PER;
        const s = (Math.floor(j / PER) + 0.5) / RUNGS, q = (j % PER + 1) / (PER + 1);
        const a = at(hoog ? 1 : 0, s), b = at(hoog ? 2 : 1, s);
        o.x = a[0] + (b[0] - a[0]) * q; o.y = a[1] + (b[1] - a[1]) * q; o.g = hoog; o.lv = hoog ? 3 : 2; o.s = 1.3; return;
      }
      j -= 2 * RUNGS * PER;
      const LOOP = 44;
      if (j < 2 * LOOP) {                           // strand 1 -> 2 at the left end, 2 -> 3 at the right end
        const left = j < LOOP, u = (j % LOOP) / (LOOP - 1);
        const a = at(left ? 0 : 1, left ? 0 : 1), b = at(left ? 1 : 2, left ? 0 : 1);
        o.x = a[0] + (left ? -1 : 1) * R * 1.5 * Math.sin(Math.PI * u); o.y = a[1] + (b[1] - a[1]) * u;
        o.g = false; o.lv = 4; o.s = 1.7; return;
      }
      dust(i, t, W, H, o);
    },

    // G-quadruplex: three stacked G-tetrads turning, held by Hoogsteen pairs, with the backbone between
    // them and a K+ ion between each pair of tetrads
    g4(i, t, tl, W, H, o) {
      const cx = W * 0.5, cy = H * 0.5, side = Math.min(W * 0.16, H * 0.36), gapY = Math.min(H * 0.22, side * 0.95);
      const spin = reduceMotion ? 0.4 : t * 0.75, tilt = 0.36;
      const node = (k, j) => {
        const a = spin + j * Math.PI / 2 + k * 0.26;
        const x3 = Math.cos(a) * side * 0.72, z3 = Math.sin(a) * side * 0.72;
        return [cx + x3, cy + (k - 1) * gapY + z3 * tilt, z3];
      };
      const PG = 16, G = PG * 12;
      if (i < G) {                                  // the guanines: a small solid block at each corner
        const n = Math.floor(i / PG), m = i % PG, [x, y, z] = node(Math.floor(n / 4), n % 4);
        const u = side * 0.04;
        o.x = x + ((m % 4) - 1.5) * u; o.y = y + (Math.floor(m / 4) - 1.5) * u * 0.8;
        o.g = false; o.lv = z > 0 ? 7 : 4; o.s = z > 0 ? 2.4 : 1.7; return;
      }
      let j = i - G;
      const HB = 12, NH = 3 * 4 * HB;
      if (j < NH) {                                 // Hoogsteen pairs around each tetrad
        const k = Math.floor(j / (4 * HB)), e = Math.floor(j / HB) % 4, q = (j % HB + 1) / (HB + 1);
        const a = node(k, e), b = node(k, (e + 1) % 4);
        o.x = a[0] + (b[0] - a[0]) * q; o.y = a[1] + (b[1] - a[1]) * q; o.g = false; o.lv = 3; o.s = 1.3; return;
      }
      j -= NH;
      const BB = 18, NB = 4 * 2 * BB;
      if (j < NB) {                                 // the strand running from tetrad to tetrad
        const e = Math.floor(j / (2 * BB)), k = Math.floor(j / BB) % 2, q = (j % BB) / BB;
        const a = node(k, e), b = node(k + 1, e);
        o.x = a[0] + (b[0] - a[0]) * q + Math.sin(q * Math.PI) * side * 0.1; o.y = a[1] + (b[1] - a[1]) * q;
        o.g = false; o.lv = 2; o.s = 1.2; return;
      }
      j -= NB;
      const ION = 20;
      if (j < 2 * ION) {                            // two K+ ions, between tetrads 1-2 and 2-3
        const k = Math.floor(j / ION), m = j % ION, a = m / ION * TAU + (reduceMotion ? 0 : t * 2.2);
        const rr = side * (m % 2 ? 0.05 : 0.1);
        o.x = cx + Math.cos(a) * rr; o.y = cy + (k - 0.5) * gapY + Math.sin(a) * rr * 0.7;
        o.g = true; o.lv = 7; o.s = 2.1; return;
      }
      dust(i, t, W, H, o);
    },

    // The DNA-repair study's design: cells carrying the cut reporter flow into a sorter and leave in two
    // streams, those that repaired it accurately (green) and those that did not. The split is schematic.
    sort(i, t, tl, W, H, o) {
      const C = 560, sx = W * 0.47, x0 = W * 0.05, x1 = W * 0.93, cy = H * 0.52;
      if (i < C) {
        const p = (hash(i, 3) + (reduceMotion ? 0.62 : t * 0.06)) % 1;
        const repaired = hash(i, 4) < 0.5, jit = (hash(i, 5) - 0.5) * H * 0.09;
        if (p < 0.5) {
          const u = p / 0.5;
          o.x = x0 + (sx - x0) * u; o.y = cy + jit * (1 - 0.75 * u); o.g = false; o.lv = 5;
        } else {
          const u = (p - 0.5) / 0.5;
          o.x = sx + (x1 - sx) * u; o.y = cy + (repaired ? -1 : 1) * H * 0.22 * ease(Math.min(1, u * 1.7)) + jit * 0.5;
          o.g = repaired; o.lv = repaired ? 7 : 3;
        }
        o.s = 2.3; return;
      }
      const j = i - C, GATE = 44;
      if (j < GATE) { o.x = sx; o.y = H * 0.27 + H * 0.5 * j / (GATE - 1); o.g = false; o.lv = j % 2 ? 1 : 5; o.s = 1.5; return; }
      dust(i, t, W, H, o);
    },

    // Forebrain assembloid: dorsal and ventral spheroids fused, each holding resident neurons with branching
    // dendrites; interneurons (green) migrate from ventral to dorsal, the leading process reaching ahead
    // with a forked growth cone and the cell body catching up in jumps (saltatory migration)
    assembloid(i, t, tl, W, H, o) {
      const cy = H * 0.5, R = Math.min(H * 0.38, W * 0.18), ry = 0.8, off = R * 0.86;
      const dx = W * 0.5 - off, vx = W * 0.5 + off, sway = reduceMotion ? 0 : t;
      const RIM = 110;
      if (i < 2 * RIM) {                            // the spheroids' surfaces, slightly irregular and breathing
        const k = i < RIM ? 0 : 1, a = (i % RIM) / RIM * TAU;
        const w = 1 + 0.035 * Math.sin(a * 5 + k * 2) + 0.02 * Math.sin(sway * 0.7 + a * 3);
        o.x = (k ? vx : dx) + Math.cos(a) * R * w; o.y = cy + Math.sin(a) * R * ry * w;
        o.g = false; o.lv = 4; o.s = 1.6; return;
      }
      let j = i - 2 * RIM;
      const NEU = 6, SOMA = 6, DEN = 3, DP = 9, BR = 3, PER_N = SOMA + DEN * (DP + 2 * BR);
      if (j < 2 * NEU * PER_N) {                    // resident neurons: a cell body and three dendrites each
        const n = Math.floor(j / PER_N), m = j % PER_N, k = n < NEU ? 0 : 1;
        const a0 = hash(n, 31) * TAU, r0 = Math.sqrt(hash(n, 32)) * 0.6;
        const sx = (k ? vx : dx) + Math.cos(a0) * R * r0, sy = cy + Math.sin(a0) * R * ry * r0;
        if (m < SOMA) { const a = m / SOMA * TAU; o.x = sx + Math.cos(a) * 2.4; o.y = sy + Math.sin(a) * 2.4; o.g = false; o.lv = 6; o.s = 1.9; return; }
        const d = Math.floor((m - SOMA) / (DP + 2 * BR)), q = (m - SOMA) % (DP + 2 * BR);
        const ang = hash(n, 40 + d) * TAU + 0.12 * Math.sin(sway * 0.6 + n + d);
        const len = R * (0.2 + 0.12 * hash(n, 50 + d)), bend = (hash(n, 60 + d) - 0.5) * 0.9;
        const pt = s => [sx + Math.cos(ang + bend * s) * len * s, sy + Math.sin(ang + bend * s) * len * s * ry];
        if (q < DP) { [o.x, o.y] = pt((q + 1) / DP); o.g = false; o.lv = 3; o.s = 1.2; return; }
        const b = q - DP, side = b < BR ? 1 : -1, s2 = (b % BR + 1) / BR;   // two short branches from 60% along
        const [bx, by] = pt(0.6), ba = ang + bend * 0.6 + side * 0.7;
        o.x = bx + Math.cos(ba) * len * 0.35 * s2; o.y = by + Math.sin(ba) * len * 0.35 * s2 * ry;
        o.g = false; o.lv = 2; o.s = 1.1; return;
      }
      j -= 2 * NEU * PER_N;
      const MIG = 8, BODY = 7, LEAD = 12, CONE = 6, TRAIL = 5, PER_M = BODY + LEAD + CONE + TRAIL;
      if (j < MIG * PER_M) {                        // migrating interneurons
        const n = Math.floor(j / PER_M), m = j % PER_M;
        const y0 = cy + (hash(n, 71) - 0.5) * R * 0.9, y1 = cy + (hash(n, 72) - 0.5) * R * 0.9, bow = (hash(n, 73) - 0.5) * R * 0.9;
        const X0 = vx + R * 0.5, X1 = dx - R * 0.45;
        const path = u => [X0 + (X1 - X0) * u, y0 + (y1 - y0) * u + bow * 4 * u * (1 - u)];
        const cyc = reduceMotion ? 0.3 + 0.08 * n : ((hash(n, 74) + t * 0.075) % 1 + 1) % 1;   // a crossing every ~13 s
        // the leading process advances smoothly; the cell body waits, then jumps after it (7 jumps a crossing)
        const steps = 7, ph = cyc * steps, uSoma = (Math.floor(ph) + ease(clamp((ph % 1 - 0.55) / 0.45, 0, 1))) / steps;
        const uTip = Math.min(1, cyc + 0.09), fade = clamp(Math.min(cyc, 1 - cyc) / 0.08, 0, 1);
        let lv, s;
        if (m < BODY) { const [x, y] = path(uSoma), a = m / BODY * TAU; o.x = x + Math.cos(a) * 2.6; o.y = y + Math.sin(a) * 2.6; lv = 7; s = 2.2; }
        else if (m < BODY + LEAD) { [o.x, o.y] = path(uSoma + (uTip - uSoma) * (m - BODY + 1) / LEAD); lv = 5; s = 1.5; }
        else if (m < BODY + LEAD + CONE) {          // the growth cone: two short branches at the tip
          const b = m - BODY - LEAD, side = b < CONE / 2 ? 1 : -1, q = (b % (CONE / 2) + 1) / (CONE / 2);
          const [tx, ty] = path(uTip), [px2, py2] = path(Math.max(0, uTip - 0.02)), a = Math.atan2(ty - py2, tx - px2) + side * 0.6;
          o.x = tx + Math.cos(a) * R * 0.05 * q; o.y = ty + Math.sin(a) * R * 0.05 * q; lv = 6; s = 1.4;
        } else { [o.x, o.y] = path(Math.max(0, uSoma - 0.05 * (m - BODY - LEAD - CONE + 1) / TRAIL)); lv = 3; s = 1.3; }
        o.g = true; o.lv = Math.max(1, Math.round(lv * fade)); o.s = s; return;
      }
      dust(i, t, W, H, o);
    },

    // StickForStats: a sample falls into a histogram under its fitted normal curve (green), then the same
    // points re-form as a Q-Q plot against the normal line; the three outliers stand off the line (cream)
    checks(i, t, tl, W, H, o) {
      const x0 = W * 0.2, x1 = W * 0.8, base = H * 0.82, top = H * 0.2;
      // histogram, then Q-Q plot; on a project page (tl keeps running) the points then glide back and
      // forth every 6.5 s instead of falling again
      const loop = tl % 6.5, first = tl < 6.5;
      const ph = reduceMotion ? 0 : ease(clamp((loop - 2.2) / 0.8, 0, 1)) * (1 - ease(clamp((loop - 5.6) / 0.8, 0, 1)));
      if (i < D) {
        const z = zs[i], out = i >= D - 3, bw = (x1 - x0) / BINS, step = (base - top) * 0.9 / maxBin;
        const fall = reduceMotion || !first ? 1 : ease(clamp(tl * 1.6 - hash(i, 23) * 0.9, 0, 1));
        const hx = x0 + (binOf(z) + 0.2 + 0.6 * hash(i, 24)) * bw, hy = base - (inBin[i] + 0.5) * step;
        const hyFall = top - H * 0.15 + (hy - top + H * 0.15) * fall;
        const th = quantile((i + 0.5) / D), sc = (x1 - x0) / 9;   // Q-Q axes: -4.5 to 4.5 normal units
        const qx = x0 + (th + 4.5) * sc, qy = base - (z + 4.5) * sc * ((base - top) / (x1 - x0));
        o.x = hx + (qx - hx) * ph; o.y = hyFall + (qy - hyFall) * ph;
        o.g = false; o.lv = out ? 7 : 5; o.s = out ? 2.8 : 2; return;
      }
      const j = i - D, CURVE = 80;
      if (j < CURVE) {                              // the fitted curve, then the Q-Q reference line
        const u = j / (CURVE - 1), z = ZMIN + (ZMAX - ZMIN) * u, step = (base - top) * 0.9 / maxBin;
        const cx = x0 + (z - ZMIN) / (ZMAX - ZMIN) * (x1 - x0);
        const cyv = base - D * (6.4 / BINS) * Math.exp(-z * z / 2) / Math.sqrt(TAU) * step;
        const lx = x0 + u * (x1 - x0), ly = base - u * (x1 - x0) * ((base - top) / (x1 - x0));
        o.x = cx + (lx - cx) * ph; o.y = cyv + (ly - cyv) * ph; o.g = true; o.lv = 6; o.s = 1.6; return;
      }
      dust(i, t, W, H, o);
    },

    // Checkability audit: a beam reads a wall of articles; the few whose test statistic can be recomputed light up
    audit(i, t, tl, W, H, o) {
      const x0 = W * 0.13, y0 = H * 0.2, gx = W * 0.74 / AUD_C, gy = H * 0.6 / AUD_R, PER = PAGE.length;
      const sweep = reduceMotion ? 1.05 : clamp(tl / 4.2, 0, 1.05);
      const beam = x0 + sweep * AUD_C * gx;
      if (i < AUD_C * AUD_R * PER) {
        const n = Math.floor(i / PER), m = i % PER, c = n % AUD_C, r = Math.floor(n / AUD_C);
        const px = x0 + c * gx, py = y0 + r * gy;
        const [col, ln] = PAGE[m];
        o.x = px + col * gx * 0.18; o.y = py + ln * gy * 0.17;
        const read = px + gx * 0.4 < beam, ok = hash(n, 7) < 0.1 || n === AUD_MIN;
        o.g = read && ok; o.lv = read ? (ok ? 7 : 3) : 6; o.s = ln ? 1.7 : 2.3; return;
      }
      const j = i - AUD_C * AUD_R * PER, BEAM = 46;
      if (j < BEAM && sweep < 1.02) { o.x = beam; o.y = y0 - gy * 0.35 + (AUD_R * gy + gy * 0.2) * j / (BEAM - 1); o.g = true; o.lv = 4; o.s = 1.4; return; }
      dust(i, t, W, H, o);
    },

    // Confidence intervals: 95% intervals from repeated samples scroll past the true mean (green line).
    // Each sample's mean is drawn from a normal around the truth and the half-width is 1.96 sigma (give or
    // take the sample's own spread), so about one interval in twenty misses; the misses are drawn in cream.
    ci(i, t, tl, W, H, o) {
      const ROWS = 24, PER = 28, x0 = W * 0.16, x1 = W * 0.84, mid = (x0 + x1) / 2, top = H * 0.08, bot = H * 0.92;
      const sigma = (x1 - x0) * 0.13, scroll = reduceMotion ? 0 : t * 0.9;
      if (i < ROWS * PER) {
        const r = Math.floor(i / PER), m = i % PER, f = scroll % 1, id = r + Math.floor(scroll);
        const y = bot - (r + f) / ROWS * (bot - top);
        const c = sigma * Math.sqrt(-2 * Math.log(hash(id, 81) * 0.999 + 0.0005)) * Math.cos(TAU * hash(id, 82));
        const w = 1.96 * sigma * (0.85 + 0.3 * hash(id, 83)), miss = Math.abs(c) > w;
        const edge = clamp(Math.min(y - top, bot - y) / (H * 0.08), 0, 1);
        if (m === 0) { o.x = mid + c; o.s = 2.4; o.lv = miss ? 7 : 6; }
        else if (m < 3) { o.x = mid + c + (m === 1 ? -w : w); o.s = 2; o.lv = miss ? 7 : 5; }
        else { o.x = mid + c - w + 2 * w * (m - 2) / (PER - 2); o.s = 1.2; o.lv = miss ? 6 : 3; }
        o.y = y; o.g = false; o.lv = Math.max(1, Math.round(o.lv * edge)); return;
      }
      const j = i - ROWS * PER, LINE = 50;
      if (j < LINE) { o.x = mid; o.y = top + (bot - top) * j / (LINE - 1); o.g = true; o.lv = 6; o.s = 1.6; return; }
      dust(i, t, W, H, o);
    },

    // RNA Lab Navigator: the lab's indexed documents as points in an embedding space, in a few topical
    // clusters. A query (green) lands, lines reach out to its nearest documents and they light up; then
    // the next query comes.
    rag: function rag(i, t, tl, W, H, o) {
      const DOCS = 460, K = 6, LINE = 14, CYCLE = 3.4;
      const cyc = reduceMotion ? 1 : Math.floor(t / CYCLE), ph = reduceMotion ? 2.4 : t % CYCLE;
      const doc = d => {
        const c = d % 6, cxk = W * (0.24 + 0.52 * hash(c, 91)), cyk = H * (0.22 + 0.56 * hash(c, 92));
        const r = Math.sqrt(-2 * Math.log(hash(d, 93) * 0.999 + 0.0005)), a = TAU * hash(d, 94);
        return [cxk + Math.cos(a) * r * W * 0.05 + (reduceMotion ? 0 : Math.sin(t * 0.3 + d) * 2),
                cyk + Math.sin(a) * r * H * 0.07 + (reduceMotion ? 0 : Math.cos(t * 0.25 + d) * 2)];
      };
      const q = [W * (0.2 + 0.6 * hash(cyc, 95)), H * (0.2 + 0.6 * hash(cyc, 96))];
      if (!rag.nn || rag.key !== `${cyc}|${W}|${H}`) {       // the query's nearest documents, once per query
        const dist = Array.from({ length: DOCS }, (_, d) => { const [x, y] = doc(d); return [(x - q[0]) ** 2 + (y - q[1]) ** 2, d]; });
        dist.sort((a, b) => a[0] - b[0]);
        rag.nn = dist.slice(0, K).map(e => e[1]); rag.key = `${cyc}|${W}|${H}`;
      }
      const reach = clamp((ph - 0.5) / 0.8, 0, 1), lit = ph > 1.3;
      if (i < DOCS) {
        [o.x, o.y] = doc(i); const hit = lit && rag.nn.includes(i);
        o.g = hit; o.lv = hit ? 7 : 3; o.s = hit ? 2.6 : 1.6; return;
      }
      let j = i - DOCS;
      if (j < 8) {                                  // the query
        const a = j / 8 * TAU, appear = clamp(ph / 0.4, 0, 1);
        o.x = q[0] + Math.cos(a) * 3.2; o.y = q[1] + Math.sin(a) * 3.2; o.g = true; o.lv = Math.max(1, Math.round(7 * appear)); o.s = 2.2; return;
      }
      j -= 8;
      if (j < K * LINE) {                           // lines from the query to its nearest documents
        const n = Math.floor(j / LINE), u = (j % LINE + 1) / (LINE + 1), [tx, ty] = doc(rag.nn[n]);
        if (u > reach) { dust(i, t, W, H, o); return; }
        o.x = q[0] + (tx - q[0]) * u; o.y = q[1] + (ty - q[1]) * u; o.g = true; o.lv = 4; o.s = 1.3; return;
      }
      dust(i, t, W, H, o);
    },
  };

  // Small labels per formation: [text, x, y, green]; long ones only where there is room
  const LABELS = {
    triplex: (W, H) => [["5'", W * 0.12, H * 0.4, false], ...(W > 640 ? [['third strand in the major groove', W * 0.17, H * 0.88, true]] : [])],
    g4: (W, H) => { const x = W * 0.5 + Math.min(W * 0.16, H * 0.36) + 24; return [['G-tetrads', x, H * 0.3, false], [W > 640 ? 'K+ between tetrads' : 'K+', x, H * 0.62, true]]; },
    sort: (W, H) => [[W > 640 ? 'cells with the cut reporter' : 'cells', W * 0.05, H * 0.3, false], ['sort', W * 0.47 - 14, H * 0.22, false],
      ['repaired', W * (W > 640 ? 0.8 : 0.62), H * 0.18, true], ['not repaired', W * (W > 640 ? 0.8 : 0.62), H * 0.9, false]],
    assembloid: (W, H) => { const R = Math.min(H * 0.38, W * 0.18), y = H * 0.5 + R * 0.8 + 24; return [['dorsal', W * 0.5 - R * 0.86 - 22, y, false], ['ventral', W * 0.5 + R * 0.86 - 25, y, false], [W > 640 ? 'migrating interneurons' : 'interneurons', W * 0.5 - (W > 640 ? 80 : 44), H * 0.5 - R * 0.8 - 20, true]]; },
    checks: (W, H, tl) => [[!reduceMotion && tl > 2.6 ? 'Q-Q plot: normality check' : 'histogram and fitted normal', W * 0.2, H * 0.12, false]],
    audit: (W, H) => [[W > 640 ? 'articles read for a recomputable test statistic' : 'reading articles', W * 0.13, H * 0.12, false], ['checkable', W * 0.13, H * 0.93, true]],
  };

  /* ---------- rendering ---------- */
  // mount(el, {scenes, labels}) draws into a canvas filling el and returns {show(i), setPaused(p)}.
  // A single-scene mount (a project hero) runs one clock from the start; a stage resets tl at each area.
  const greenFill = a => `rgba(${GREEN[0]},${GREEN[1]},${GREEN[2]},${a})`;
  function mount(el, { scenes, labels }) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const cur = {}, prv = {}, single = scenes.length === 1;
    let W = 0, H = 0, index = 0, from = -1, t0 = performance.now(), since = t0, fromSince = t0;
    const size = () => {
      W = el.clientWidth; H = el.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = now => {
      if (!W || !H) return;
      const t = (now - t0) / 1000;
      const tl = single ? (reduceMotion ? 1 : t) : (now - since) / 1000;
      const p = from < 0 || reduceMotion ? 1 : clamp((now - since) / MORPH, 0, 1);
      const f = F[scenes[index]] || F.triplex, g = p < 1 && from >= 0 ? F[scenes[from]] : null;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const buckets = new Map();                    // points grouped by colour: each colour is set once a frame
      for (let i = 0; i < N; i++) {
        f(i, t, tl, W, H, cur);
        let x = cur.x, y = cur.y, lv = cur.lv, gr = cur.g, s = cur.s;
        if (g) {
          g(i, t, (now - fromSince) / 1000, W, H, prv);
          const q = ease(clamp((p - hash(i, 11) * 0.35) / 0.65, 0, 1));   // each point leaves at its own moment
          x = prv.x + (x - prv.x) * q; y = prv.y + (y - prv.y) * q;
          if (q < 0.5) { lv = prv.lv; gr = prv.g; s = prv.s; }
        }
        if (s <= 0) continue;
        const key = (gr ? 'g' : 'k') + lv;
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = []));
        b.push(x, y, s);
      }
      buckets.forEach((b, key) => {
        const lv = +key.slice(1);
        ctx.fillStyle = key[0] === 'g' ? greenFill((0.3 + 0.7 * lv / 7).toFixed(2)) : GREYS[lv];
        for (let k = 0; k < b.length; k += 3) { const s = b[k + 2]; ctx.fillRect(b[k] - s / 2, b[k + 1] - s / 2, s, s); }
      });
      if (!labels) return;
      ctx.font = FONT; ctx.textBaseline = 'middle';
      ctx.globalAlpha = ease(clamp((p - 0.5) / 0.5, 0, 1));
      (LABELS[scenes[index]] || (() => []))(W, H, tl).forEach(([text, x, y, gr]) => {
        ctx.fillStyle = gr ? greenFill(0.9) : '#8a8a8a'; ctx.fillText(text, Math.round(x), Math.round(y));
      });
      ctx.globalAlpha = 1;
    };
    // run only while on screen, the tab is visible and nobody paused it; under reduced motion draw on request
    let raf = 0, running = false, onScreen = false, held = false;
    const frame = now => { raf = requestAnimationFrame(frame); draw(now); };
    const start = () => { if (!running && !reduceMotion && !held && onScreen && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const redraw = () => draw(performance.now());
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; onScreen ? start() : stop(); }).observe(el);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    let rt;
    const resized = () => { clearTimeout(rt); rt = setTimeout(() => { size(); redraw(); }, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(resized).observe(el); else window.addEventListener('resize', resized);
    size(); redraw();
    const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
    ready.then(redraw, redraw);
    return {
      show(i) {
        const n = scenes.length, next = ((i % n) + n) % n;
        if (next !== index) { from = index; fromSince = since; index = next; since = performance.now(); }
        if (!running) redraw();
      },
      setPaused(pause) { held = pause; pause ? stop() : start(); },
    };
  }

  /* ---------- the Research stage: slides, markers, buttons, keys, pause ---------- */
  const root = document.querySelector('.research-stage');
  const art = root && root.querySelector('.research-stage__art');
  const slides = root ? [...root.querySelectorAll('.stage-slide')] : [];
  if (art && slides.length) {
    const stage = mount(art, { scenes: slides.map(s => s.dataset.scene), labels: true });
    const dots = [...root.querySelectorAll('.stage-dot')];
    const live = root.querySelector('.research-stage__slides');
    const pauseBtn = root.querySelector('[data-stage="pause"]');
    const state = { user: false, hover: false, focus: false, off: false };
    const sync = () => root.classList.toggle('is-paused', state.user || state.hover || state.focus || state.off);
    let index = 0;
    const show = (i, byUser) => {
      const n = slides.length; index = ((i % n) + n) % n;
      stage.show(index);
      slides.forEach((s, j) => s.classList.toggle('is-active', j === index));
      dots.forEach((d, j) => {
        d.classList.remove('is-active'); d.removeAttribute('aria-current');
        if (j === index) { void d.offsetWidth; d.classList.add('is-active'); d.setAttribute('aria-current', 'true'); }
      });
      if (live) live.setAttribute('aria-live', byUser ? 'polite' : 'off');   // announce only what the visitor chose
    };
    root.addEventListener('animationend', e => { if (e.animationName === 'stage-fill') show(index + 1, false); });
    root.querySelector('[data-stage="prev"]').addEventListener('click', () => show(index - 1, true));
    root.querySelector('[data-stage="next"]').addEventListener('click', () => show(index + 1, true));
    dots.forEach((d, j) => d.addEventListener('click', () => show(j, true)));
    root.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); show(index + (e.key === 'ArrowLeft' ? -1 : 1), true);
    });
    if (reduceMotion) { if (pauseBtn) pauseBtn.hidden = true; }
    else {
      if (pauseBtn) pauseBtn.addEventListener('click', () => {
        state.user = !state.user; sync(); pauseBtn.textContent = state.user ? 'Play' : 'Pause';
      });
      root.addEventListener('mouseenter', () => { state.hover = true; sync(); });
      root.addEventListener('mouseleave', () => { state.hover = false; sync(); });
      root.addEventListener('focusin', () => { state.focus = true; sync(); });
      root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { state.focus = false; sync(); } });
      new IntersectionObserver(([e]) => { state.off = !e.isIntersecting; sync(); }).observe(root);
    }
    show(0, false);
  }

  /* ---------- project-page heroes: one formation each, with a Pause button ---------- */
  document.querySelectorAll('.hero-art__frame[data-points]').forEach(frame => {
    if (!F[frame.dataset.points]) return;
    const fig = frame.closest('.hero-art');
    let b = null;
    if (fig && !reduceMotion) {                     // the button first, so the frame is measured in its final layout
      b = document.createElement('button');
      b.type = 'button'; b.className = 'hero-art__toggle'; b.textContent = 'Pause animation';
      fig.appendChild(b);
    }
    const art = mount(frame, { scenes: [frame.dataset.points], labels: false });
    if (b) b.addEventListener('click', () => {
      const pause = b.textContent === 'Pause animation';
      art.setPaused(pause); b.textContent = pause ? 'Play animation' : 'Pause animation';
    });
  });
})();
