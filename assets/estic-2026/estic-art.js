/* ===== ESTIC 2026 page: three animations in the style of the Research page's dotted drawings =====
   Dots on black in the site's greys, cream and green; mono labels; a Pause button; drawn only while on screen
   and the tab is visible; a still frame under prefers-reduced-motion. The palette and fonts are read from the
   site's CSS variables (css/vars.css); the dot language (small squares, an integer hash for scatter) is that of
   js/point-art.js, which this file neither loads nor changes.

   Each animation is a <figure class="estic-anim" data-anim="..."> in pages/estic-2026.html. Its caption says what
   it shows and where the numbers come from; the static figures and tables stay below it.
   - spreads: a live simulation of the page's Student-versus-Welch table. Each run draws 10 values with
     SD = ratio and 40 with SD 1 from one true mean, runs both t-tests (p-values from jStat's Student t
     distribution, loaded from cdnjs only when the figure is near the screen), and the two counters show the
     share of runs with p < 0.05 so far. It stops after 40,000 runs, as in the table.
   - pubbias: 74 dots, one per FDA-registered antidepressant trial (Turner et al., 2008), from what the FDA
     saw to what was published.
   - audit: 1,000 dots in the proportions of the section 4 table, sorted by what each article printed.
   Nothing here runs while a figure is off screen, paused, or finished. */
(() => {
  'use strict';

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = { reduced: reducedQuery.matches, onChange: [] };
  reducedQuery.addEventListener('change', e => { motion.reduced = e.matches; motion.onChange.forEach(f => f()); });

  /* ---------- the site's colours and type, read from vars.css ---------- */
  const rootStyle = getComputedStyle(document.documentElement);
  const token = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;
  const C = {
    bg: token('--bg', '#000'), cream: token('--cream', '#f2ede3'), muted: token('--fg-muted', '#a3a3a3'),
    dim: token('--fg-dim', '#767676'), line: token('--line', '#262626'), strong: token('--line-strong', '#3d3d3d'),
    accent: token('--accent', '#00e38c'),
  };
  const MONO = token('--font-mono', '"Geist Mono", monospace');
  const font = px => `${px}px ${MONO}`;

  // Integer hash, as in js/point-art.js: deterministic, well spread on whole numbers
  const hash = (a, b = 0) => {
    let n = (Math.imul(Math.round(a * 16) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(b * 16) | 0, 0x165667b1)) >>> 0;
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const lerp = (a, b, q) => a + (b - a) * q;
  const fmt = n => n.toLocaleString('en-US');
  const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;

  /* ---------- the t-tests (tested on their own against 30-digit reference values) ---------- */
  /* stats:begin */
  // Mean and sample variance of the first n values of x (two passes), written into out
  const meanVar = (x, n, out) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += x[i];
    const m = s / n;
    let q = 0;
    for (let i = 0; i < n; i++) { const d = x[i] - m; q += d * d; }
    out.m = m; out.v = q / (n - 1);
  };
  // Two-sample t-tests from the groups' means and variances. cdf(x, df) is the Student t distribution function;
  // each test writes its statistic, degrees of freedom and two-sided p-value into out.
  const makeTests = cdf => {
    const twoSided = (t, df) => Math.min(1, 2 * cdf(-Math.abs(t), df));
    return {
      student(s1, n1, s2, n2, out) {            // equal variances assumed: pooled variance, n1 + n2 - 2 degrees of freedom
        const df = n1 + n2 - 2, pooled = ((n1 - 1) * s1.v + (n2 - 1) * s2.v) / df;
        out.t = (s1.m - s2.m) / Math.sqrt(pooled * (1 / n1 + 1 / n2)); out.df = df; out.p = twoSided(out.t, df);
      },
      welch(s1, n1, s2, n2, out) {              // unequal variances: Welch-Satterthwaite degrees of freedom
        const q1 = s1.v / n1, q2 = s2.v / n2, se2 = q1 + q2;
        out.t = (s1.m - s2.m) / Math.sqrt(se2);
        out.df = (se2 * se2) / ((q1 * q1) / (n1 - 1) + (q2 * q2) / (n2 - 1));
        out.p = twoSided(out.t, out.df);
      },
    };
  };
  /* stats:end */

  // Seeded random numbers (sfc32), so a run is the same on every visit; standard normals by Box-Muller
  const makeRand = seed => {
    let a = 0x9e3779b9, b = 0x243f6a88, c = 0xb7e15162, d = seed | 0;
    const next = () => {
      a |= 0; b |= 0; c |= 0; d |= 0;
      const t = (((a + b) | 0) + d) | 0;
      d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
    for (let i = 0; i < 16; i++) next();
    return next;
  };
  const makeNormal = rand => {
    let spare = NaN;
    return () => {
      if (spare === spare) { const v = spare; spare = NaN; return v; }
      const r = Math.sqrt(-2 * Math.log(1 - rand())), th = 2 * Math.PI * rand();
      spare = r * Math.sin(th);
      return r * Math.cos(th);
    };
  };

  /* ---------- page furniture: controls, a status line for screen readers, a canvas ---------- */
  const make = (tag, className, text) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const button = (label, onClick) => {
    const b = make('button', 'estic-anim__btn', label);
    b.type = 'button'; b.addEventListener('click', onClick);
    return b;
  };
  const chrome = fig => {
    const frame = fig.querySelector('.estic-anim__frame');
    const bar = make('div', 'estic-anim__controls');
    frame.after(bar);
    const status = make('p', 'sr-only');             // said by screen readers when a state is reached; the canvas is aria-hidden
    status.setAttribute('role', 'status');
    fig.appendChild(status);
    return { frame, bar, status };
  };
  const group = (label, visibleLabel) => {
    const g = make('div', 'estic-anim__group');
    g.setAttribute('role', 'group'); g.setAttribute('aria-label', label);
    if (visibleLabel) g.appendChild(make('span', 'estic-anim__grouplabel', visibleLabel));
    return g;
  };
  // numbers in a table's body rows, from the given cell positions: the page's tables are the source of truth
  const cellNumbers = (table, cols, rows) => {
    if (!table) return null;
    const out = [...table.querySelectorAll('tbody tr')].map(tr => cols.map(c => parseFloat(tr.children[c] && tr.children[c].textContent)));
    return out.length === rows && out.every(r => r.every(Number.isFinite)) ? out : null;
  };

  // A canvas filling the frame, sized in CSS pixels and drawn at up to 2x. layout = { below, wide, narrow }: a frame
  // narrower than `below` px gets the stacked layout (cv.narrow) and the frame the `narrow` height in rem, otherwise
  // the side-by-side layout and the `wide` height. onSize(cv) lays out and draws again: resizing a canvas clears it.
  const mountCanvas = (frame, layout, onSize) => {
    const canvas = make('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    frame.appendChild(canvas);
    const cv = { ctx: canvas.getContext('2d'), W: 0, H: 0, narrow: false, compact: false };
    const size = () => {
      cv.W = frame.clientWidth; cv.narrow = cv.W < layout.below; cv.compact = cv.W < 340;      // compact: a 320 px screen, or a 360 px one with its margins
      frame.style.height = `${cv.narrow ? layout.narrow : layout.wide}rem`;
      cv.H = frame.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cv.W * dpr); canvas.height = Math.round(cv.H * dpr);
      cv.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onSize(cv);
    };
    let timer = 0;
    const resized = () => { clearTimeout(timer); timer = setTimeout(size, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(resized).observe(frame); else window.addEventListener('resize', resized);
    // a window moved to a screen with another pixel density keeps its size but needs a new backing store
    const watchDpr = () => window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      .addEventListener('change', () => { size(); watchDpr(); }, { once: true });
    watchDpr();
    size();
    return cv;
  };
  const text = (ctx, str, x, y, color, size = 12, align = 'left', alpha = 1) => {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = font(size); ctx.textAlign = align;
    ctx.fillText(str, Math.round(x), Math.round(y));
    ctx.globalAlpha = 1;
  };
  // dots are small squares centred on (x, y), as on the Research page; even sizes at whole pixels stay crisp
  const square = (ctx, x, y, size, color, alpha = 1) => {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(x - size / 2, y - size / 2, size, size); ctx.globalAlpha = 1;
  };
  const outline = (ctx, x, y, size, color, alpha = 1) => {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x - size / 2) + 0.5, Math.round(y - size / 2) + 0.5, size - 1, size - 1);
    ctx.globalAlpha = 1;
  };

  // Runs a frame callback only while the figure is on screen, the tab is visible and wants() says so
  const makeLoop = (el, wants, onFrame) => {
    let raf = 0, last = 0, onScreen = false;
    const loop = {
      sync() {
        const go = onScreen && !document.hidden && wants();
        if (go && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
        else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
    const tick = now => {
      raf = requestAnimationFrame(tick);
      const dt = clamp((now - last) / 1000, 0, 0.1);
      last = now;
      onFrame(dt, now);
    };
    new IntersectionObserver(([e]) => { onScreen = e.intersectionRatio >= 0.2; loop.sync(); }, { threshold: [0, 0.2] }).observe(el);
    document.addEventListener('visibilitychange', () => loop.sync());
    return loop;
  };

  /* ===================================================================================================
     1. Unequal spreads: a live simulation
     =================================================================================================== */
  function mountSpreads(fig, jStat) {
    const { frame, bar, status } = chrome(fig);
    const NA = 10, NB = 40, RUNS = 40000, STILL = 10000, BUDGET = 6;       // BUDGET: ms of simulation per frame
    const RATIOS = [1, 2, 3, 4], NAMES = ['Same', '2x', '3x', '4x'];
    const LAYOUT = { below: 780, wide: 21, narrow: 27 };         // the side-by-side layout needs about 780 px
    const ref = cellNumbers(document.getElementById('table-false-positives'), [1, 2], RATIOS.length);   // the table's %: Student, Welch
    const tests = makeTests((x, df) => jStat.studentt.cdf(x, df));
    const a = new Float64Array(NA), b = new Float64Array(NB);
    const sa = { m: 0, v: 0 }, sb = { m: 0, v: 0 }, rs = { t: 0, df: 0, p: 1 }, rw = { t: 0, df: 0, p: 1 };
    const sim = { idx: 3, ratio: 4, normal: null, runs: 0, flagS: 0, flagW: 0, done: false, ms: 0, intro: 'first' };
    const view = { a: new Float64Array(NA), b: new Float64Array(NB), ma: 0, mb: 0, pS: 1, pW: 1, has: false,
      runs: 0, flagS: 0, flagW: 0, sampleAt: 0, countsAt: 0, sampleRun: -1 };
    let paused = false, dirty = true, settling = 0, cv = null;

    const reset = (idx, intro) => {
      sim.idx = idx; sim.ratio = RATIOS[idx]; sim.normal = makeNormal(makeRand(2026 + idx));
      sim.runs = sim.flagS = sim.flagW = 0; sim.done = false; sim.ms = 0; sim.intro = intro;
      view.has = false; view.runs = view.flagS = view.flagW = 0; view.sampleAt = view.countsAt = 0; view.sampleRun = -1;
      status.textContent = '';                       // the last result is not said again while a new run is under way
      dirty = true;
    };
    const simulate = () => {
      const sd = sim.ratio, normal = sim.normal;
      for (let i = 0; i < NA; i++) a[i] = sd * normal();
      for (let i = 0; i < NB; i++) b[i] = normal();
      meanVar(a, NA, sa); meanVar(b, NB, sb);
      tests.student(sa, NA, sb, NB, rs); tests.welch(sa, NA, sb, NB, rw);
      sim.runs++;
      if (rs.p < 0.05) sim.flagS++;
      if (rw.p < 0.05) sim.flagW++;
    };
    // what is on the canvas changes at most a few times a second once the runs speed up
    const snapCounts = now => { view.runs = sim.runs; view.flagS = sim.flagS; view.flagW = sim.flagW; view.countsAt = now; dirty = true; };
    const snapSample = now => {
      if (view.sampleRun === sim.runs) return;
      view.a.set(a); view.b.set(b); view.ma = sa.m; view.mb = sb.m; view.pS = rs.p; view.pW = rw.p;
      view.has = true; view.sampleAt = now; view.sampleRun = sim.runs; dirty = true;
    };
    // the first runs come one at a time so each can be seen; then the runs are limited only by the frame's time budget
    const allowed = ms => (sim.intro === 'first'
      ? (ms < 1800 ? 1 + Math.floor(ms / 300) : ms < 2920 ? 7 + Math.floor((ms - 1800) / 80) : RUNS)
      : (ms < 720 ? 1 + Math.floor(ms / 120) : RUNS));
    const total = () => (motion.reduced ? STILL : RUNS);
    const saying = () => `With the small group's SD ${sim.ratio === 1 ? 'equal to' : `${sim.ratio} times`} the large group's, after ${fmt(view.runs)} runs `
      + `Student's t-test gave a false positive in ${pct(view.flagS / view.runs)} of them and Welch's t-test in ${pct(view.flagW / view.runs)}.`
      + (ref ? ` The table below, from 40,000 runs in Python, gives ${ref[sim.idx][0].toFixed(1)}% and ${ref[sim.idx][1].toFixed(1)}%.` : '');

    /* --- drawing --- */
    const draw = () => {
      dirty = false;
      const { ctx, W, H } = cv;
      if (!W || !H) return;
      const narrow = cv.narrow;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const G = narrow
        ? { x0: 16, x1: W - 16, title: 20, labA: 48, rowA: 70, labB: 100, rowB: 122, axis: 144, note: 162, verdict: [190, 208], vx: 16, vx2: 76, vlab: 76,
            wafTop: 246, pitch: 9, size: 6, wafCx: [W * 0.27, W * 0.73], big: 22, wafLabel: 230 }
        : { x0: 22, x1: Math.round(W * 0.5) - 20, title: 26, labA: 66, rowA: 94, labB: 152, rowB: 180, axis: 218, note: 238, verdict: [278, 302], vx: 22, vx2: 112, vlab: 96,
            wafTop: 84, pitch: 12, size: 8, wafCx: [W * 0.54 + (W * 0.46 - 22) * 0.25, W * 0.54 + (W * 0.46 - 22) * 0.75], big: 30, wafLabel: 62 };
      const wafW = 9 * G.pitch + G.size, bigY = G.wafTop + wafW + (narrow ? 34 : 46);

      text(ctx, 'THIS RUN', G.x0, G.title, C.muted, 11);
      text(ctx, `RUN ${fmt(view.runs)} OF ${fmt(total())}`, narrow ? W - 16 : W - 22, G.title, C.muted, 11, 'right');

      // the two samples of the run on show, on one axis from -12 to 12, with a faint line at the true mean (0)
      const cx = (G.x0 + G.x1) / 2, scale = (G.x1 - G.x0) / 2 / 12;
      const xOf = v => cx + clamp(v, -12, 12) * scale;
      ctx.strokeStyle = C.strong; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(Math.round(cx) + 0.5, G.labA - 8); ctx.lineTo(Math.round(cx) + 0.5, G.axis); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.line; ctx.fillRect(G.x0, G.axis, G.x1 - G.x0, 1);
      text(ctx, narrow ? 'true mean 0 in both groups' : 'true mean: 0 in both groups, so no real difference', cx, G.note, C.muted, 11, 'center');
      const labelSize = cv.compact ? 11 : 12;
      text(ctx, `${NA} values, SD = ${sim.ratio}`, G.x0, G.labA, C.muted, labelSize);
      text(ctx, `${NB} values, SD = 1`, G.x0, G.labB, C.muted, labelSize);
      if (view.has) {
        const jit = narrow ? 8 : 10;
        for (let i = 0; i < NA; i++) square(ctx, xOf(view.a[i]), Math.round(G.rowA + (hash(i, 3) - 0.5) * 2 * jit), 4, C.cream);
        for (let i = 0; i < NB; i++) square(ctx, xOf(view.b[i]), Math.round(G.rowB + (hash(i, 5) - 0.5) * 2 * jit), 4, C.muted);
        ctx.fillStyle = C.cream; ctx.fillRect(Math.round(xOf(view.ma)) - 1, G.rowA - 17, 2, 34);      // the groups' means
        ctx.fillStyle = C.muted; ctx.fillRect(Math.round(xOf(view.mb)) - 1, G.rowB - 17, 2, 34);
        [['STUDENT', view.pS], ['WELCH', view.pW]].forEach(([name, p], k) => {
          const y = G.verdict[k], hit = p < 0.05;
          text(ctx, name, G.vx, y, C.muted, 12);
          text(ctx, p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(3)}`, G.vx2, y, hit ? C.accent : C.muted, 12);
          text(ctx, hit ? (narrow ? 'false positive' : 'significant: a false positive') : 'not significant', G.vx2 + G.vlab, y, hit ? C.accent : C.dim, 11);
        });
      }

      // the tallies: 100 squares per test, green for the share of runs that were false positives so far
      [["STUDENT'S T-TEST", view.flagS, 0], ["WELCH'S T-TEST", view.flagW, 1]].forEach(([label, flags, k]) => {
        const left = Math.round(G.wafCx[k] - wafW / 2), share = view.runs ? flags / view.runs : 0, n = Math.round(share * 100);
        text(ctx, label, G.wafCx[k], G.wafLabel, C.muted, 11, 'center');
        for (let j = 0; j < 100; j++) {
          const c = j % 10, r = (j / 10) | 0;       // filled from the bottom left, row by row
          ctx.fillStyle = j < n ? C.accent : C.dim;
          ctx.fillRect(left + c * G.pitch, G.wafTop + (9 - r) * G.pitch, G.size, G.size);
        }
        text(ctx, view.runs ? pct(share) : '-', G.wafCx[k], bigY, share > 0.1 ? C.accent : C.cream, G.big, 'center');
        text(ctx, cv.compact ? 'false positives' : 'false positives so far', G.wafCx[k], bigY + (narrow ? 20 : 24), C.muted, 11, 'center');
        if (ref) text(ctx, `table below: ${ref[sim.idx][k].toFixed(1)}%`, G.wafCx[k], bigY + (narrow ? 38 : 44), C.dim, 11, 'center');
      });
    };

    /* --- the run --- */
    const loop = makeLoop(frame, () => !motion.reduced && !paused && !sim.done, (dt, now) => {
      sim.ms += dt * 1000;
      const limit = Math.min(RUNS, allowed(sim.ms)), t0 = performance.now();
      while (sim.runs < limit) {
        simulate();
        if ((sim.runs & 7) === 0 && performance.now() - t0 > BUDGET) break;
      }
      const intro = limit < RUNS;
      if (intro ? sim.runs !== view.runs : now - view.countsAt > 50) snapCounts(now);
      if (intro || now - view.sampleAt > 130) snapSample(now);
      if (sim.runs >= RUNS) {
        sim.done = true; snapCounts(now); snapSample(now);
        status.textContent = saying(); syncPause(); loop.sync();
      }
      if (dirty) draw();
    });
    // under reduced motion nothing moves: the result after STILL runs is worked out in slices and shown once
    const settle = () => {
      const mine = ++settling;
      const slice = () => {
        if (mine !== settling) return;
        const t0 = performance.now();
        while (sim.runs < STILL && performance.now() - t0 < 20) simulate();
        if (sim.runs < STILL) { setTimeout(slice, 0); return; }
        sim.done = true; snapCounts(performance.now()); snapSample(performance.now());
        status.textContent = saying(); draw();
      };
      slice();
    };

    /* --- controls --- */
    const syncPause = () => { pauseBtn.textContent = sim.done ? 'Run again' : paused ? 'Play' : 'Pause'; };
    const pauseBtn = button('Pause', () => {
      if (sim.done) { paused = false; reset(sim.idx, 'quick'); } else paused = !paused;
      syncPause(); loop.sync();
    });
    const ratioGroup = group("Standard deviation of the small group, as a multiple of the large group's", "Small group's SD:");
    const ratioBtns = NAMES.map((name, i) => { const bt = button(name, () => choose(i)); ratioGroup.appendChild(bt); return bt; });
    const syncRatio = () => ratioBtns.forEach((bt, k) => bt.setAttribute('aria-pressed', String(k === sim.idx)));
    const choose = i => {
      paused = false; settling++;
      reset(i, 'quick'); syncRatio(); syncPause();
      if (motion.reduced) settle(); else loop.sync();
    };
    bar.append(pauseBtn, ratioGroup);
    motion.onChange.push(() => {
      pauseBtn.hidden = motion.reduced; paused = false; settling++;
      reset(sim.idx, motion.reduced ? 'quick' : 'first'); syncRatio(); syncPause();
      if (motion.reduced) settle();
      loop.sync();
    });

    reset(3, 'first'); syncRatio(); syncPause();
    pauseBtn.hidden = motion.reduced;
    cv = mountCanvas(frame, LAYOUT, c => { cv = c; draw(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    if (motion.reduced) settle();
    loop.sync();
  }

  /* ===================================================================================================
     Stories that move between two states (publication bias, the audit): one number s, from 0 to 1.
     Playing, it holds the first state, moves to the second, holds, and moves back; the state buttons go
     straight to a state and stop the playing until Play (as the Research stage's controls do).
     =================================================================================================== */
  function mountStory(fig, spec) {
    const { frame, bar, status } = chrome(fig);
    const [hold0, fwd, hold1, back] = spec.cycle, CYCLE = hold0 + fwd + hold1 + back;
    const st = { s: motion.reduced ? 1 : 0, auto: !motion.reduced, target: null, clock: 0, back: false };
    let dirty = true, lastK = -1, lastAuto = null, cv = null;
    const sAt = c => {
      st.back = c >= hold0 + fwd + hold1;
      return c < hold0 ? 0 : c < hold0 + fwd ? (c - hold0) / fwd : c < hold0 + fwd + hold1 ? 1 : 1 - (c - hold0 - fwd - hold1) / back;
    };
    const clockFor = s => (s <= 0.001 ? 0 : s >= 0.999 ? hold0 + fwd : st.back ? hold0 + fwd + hold1 + (1 - s) * back : hold0 + s * fwd);
    const draw = () => { dirty = false; if (cv && cv.W && cv.H) spec.draw(cv.ctx, cv.W, cv.H, st.s); };
    const announce = k => { status.textContent = spec.status[k]; };
    const sync = () => {
      const k = st.s >= 0.5 ? 1 : 0;
      if (k !== lastK) { stateBtns.forEach((bt, j) => bt.setAttribute('aria-pressed', String(j === k))); lastK = k; }
      if (st.auto !== lastAuto) {
        pauseBtn.textContent = st.auto ? 'Pause' : 'Play';
        status.setAttribute('aria-live', st.auto ? 'off' : 'polite');      // a story that repeats is not announced over and over
        lastAuto = st.auto;
      }
    };
    const loop = makeLoop(frame, () => !motion.reduced && (st.auto || st.target !== null), dt => {
      const before = st.s;
      if (st.target !== null) {
        const step = dt / spec.manual;
        st.s = st.s < st.target ? Math.min(st.target, st.s + step) : Math.max(st.target, st.s - step);
        if (st.s === st.target) { announce(st.target); st.target = null; loop.sync(); }
      } else if (st.auto) {
        st.clock = (st.clock + dt) % CYCLE; st.s = sAt(st.clock);
      }
      if (st.s !== before) { dirty = true; sync(); }
      if (dirty) draw();
    });
    const goTo = k => {
      st.auto = false; st.target = null;
      if (motion.reduced || st.s === k) { st.s = k; dirty = true; announce(k); draw(); } else st.target = k;
      sync(); loop.sync();
    };

    const stateBtns = spec.names.map((name, k) => button(name, () => goTo(k)));
    const stateGroup = group(spec.groupLabel);
    stateGroup.append(...stateBtns);
    const pauseBtn = button('Pause', () => {
      if (st.auto) st.auto = false;                      // stays where it is (a move started by a state button finishes)
      else { st.auto = true; st.target = null; st.clock = clockFor(st.s); }
      sync(); loop.sync();
    });
    bar.append(pauseBtn, stateGroup);
    pauseBtn.hidden = motion.reduced;
    motion.onChange.push(() => {
      pauseBtn.hidden = motion.reduced; st.target = null;
      if (motion.reduced) { st.auto = false; st.s = Math.round(st.s); } else { st.auto = true; st.clock = clockFor(st.s); }
      dirty = true; sync(); loop.sync(); draw();
    });

    cv = mountCanvas(frame, spec.frame, c => { cv = c; spec.layout(c); draw(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    sync(); announce(st.s >= 0.5 ? 1 : 0);
    loop.sync();
  }

  /* ===================================================================================================
     2. Publication bias: 74 trials, from what the FDA saw to what was published (Turner et al., 2008)
     =================================================================================================== */
  function mountPubbias(fig) {
    // 0 positive by the FDA, published | 1 positive, not published | 2 negative or questionable, not published
    // 3 negative or questionable, published as positive | 4 negative or questionable, published as negative
    const COUNTS = [37, 1, 22, 11, 3], N = 74;
    const cat = new Uint8Array(N);
    { let i = 0; COUNTS.forEach((n, k) => { for (let j = 0; j < n; j++) cat[i++] = k; }); }
    const of = (...ks) => [...Array(N).keys()].filter(i => ks.includes(cat[i]));
    const shuffled = (list, seed) => list.sort((p, q) => hash(p, seed) - hash(q, seed));
    const fdaPos = shuffled(of(0, 1), 3), fdaNeg = shuffled(of(2, 3, 4), 4);                  // what the FDA saw: 38 and 36
    const pubPos = [...shuffled(of(0), 5), ...shuffled(of(3), 6)];                           // looked positive: 37 and the 11 that were not
    const pubNeg = of(4), pubNone = shuffled(of(1, 2), 7);                                     // 3 published as negative; 23 not published
    const x0 = new Float32Array(N), y0 = new Float32Array(N), x1 = new Float32Array(N), y1 = new Float32Array(N);
    let G = null;

    const layout = ({ W, narrow, compact }) => {
      const cols = narrow ? 6 : 8, pitch = narrow ? 14 : 18, size = narrow ? 8 : 10, top = narrow ? 64 : 84;
      const place = (list, nc, cx, xs, ys) => list.forEach((i, k) => {
        xs[i] = Math.round(cx + ((k % nc) - (Math.min(nc, list.length) - 1) / 2) * pitch); ys[i] = top + Math.floor(k / nc) * pitch;
      });
      const cL = W * (narrow ? 0.26 : 0.27), cR = W * (narrow ? 0.74 : 0.73);
      place(fdaPos, cols, cL, x0, y0); place(fdaNeg, cols, cR, x0, y0);
      const cP = W * (narrow ? 0.24 : 0.2), cN = W * (narrow ? 0.52 : 0.47), cU = W * (narrow ? 0.82 : 0.78);
      place(pubPos, cols, cP, x1, y1); place(pubNeg, 3, cN, x1, y1); place(pubNone, cols, cU, x1, y1);
      G = { narrow, compact, size, ring: size + (narrow ? 4 : 6), cL, cR, cP, cN, cU, big: narrow ? 26 : 32,
        yLab: top + Math.ceil(pubPos.length / cols) * pitch + (narrow ? 14 : 22) };
    };

    const draw = (ctx, W, H, s) => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const n = G.narrow, size = G.size;
      const hollow = ease(clamp(s / 0.35, 0, 1));                      // unpublished trials go empty, in place
      const a0 = 1 - ease(clamp((s - 0.1) / 0.25, 0, 1)), a1 = ease(clamp((s - 0.75) / 0.25, 0, 1));
      for (let i = 0; i < N; i++) {
        const f = ease(clamp((s - 0.25 - 0.25 * hash(i, 9)) / 0.5, 0, 1));    // each dot leaves at its own moment
        const x = lerp(x0[i], x1[i], f), y = lerp(y0[i], y1[i], f);
        switch (cat[i]) {
          case 0: square(ctx, x, y, size, C.accent); break;
          case 1: square(ctx, x, y, size, C.accent, 1 - hollow); outline(ctx, x, y, size, C.accent, hollow); break;
          case 2: square(ctx, x, y, size, C.cream, 1 - hollow); outline(ctx, x, y, size, C.dim, hollow); break;
          case 3:                                                   // published as positive: turns green, and is ringed
            square(ctx, x, y, size, C.cream, 1 - f); square(ctx, x, y, size, C.accent, f);
            outline(ctx, x, y, G.ring, C.accent, ease(clamp((f - 0.6) / 0.4, 0, 1))); break;
          default: square(ctx, x, y, size, C.cream);
        }
      }
      const u = n ? 11 : 12, yBig = G.yLab + G.big + 12, ySub = G.yLab + G.big + 32;
      text(ctx, 'WHAT THE FDA SAW', n ? 16 : 22, n ? 22 : 28, C.muted, 11, 'left', a0);
      text(ctx, 'WHAT WAS PUBLISHED', n ? 16 : 22, n ? 22 : 28, C.muted, 11, 'left', a1);
      // the FDA's view: 38 of 74 positive
      text(ctx, '38 POSITIVE', G.cL, G.yLab, C.accent, u, 'center', a0);
      text(ctx, '51%', G.cL, yBig, C.accent, G.big, 'center', a0);
      text(ctx, G.compact ? 'of 74 trials' : 'of the 74 trials', G.cL, ySub, C.muted, 11, 'center', a0);
      if (n) { text(ctx, '36 NEGATIVE OR', G.cR, G.yLab, C.cream, u, 'center', a0); text(ctx, 'QUESTIONABLE', G.cR, G.yLab + 15, C.cream, u, 'center', a0); }
      else text(ctx, '36 NEGATIVE OR QUESTIONABLE', G.cR, G.yLab, C.cream, u, 'center', a0);
      // what was published: 48 of 51 look positive; 23 are missing
      const two = (a, b, cx, color, alpha) => { text(ctx, a, cx, G.yLab, color, u, 'center', alpha); text(ctx, b, cx, G.yLab + 15, color, u, 'center', alpha); };
      if (G.compact) { two('48 LOOK', 'POSITIVE', G.cP, C.accent, a1); two('3', 'NEGATIVE', G.cN, C.cream, a1); two('23 NOT', 'PUBLISHED', G.cU, C.muted, a1); }
      else {
        text(ctx, '48 LOOK POSITIVE', G.cP, G.yLab, C.accent, u, 'center', a1);
        text(ctx, '3 NEGATIVE', G.cN, G.yLab, C.cream, u, 'center', a1);
        text(ctx, '23 NOT PUBLISHED', G.cU, G.yLab, C.muted, u, 'center', a1);
      }
      const lift = G.compact ? 16 : 0;                                 // below a two-line label
      text(ctx, '94%', G.cP, yBig + lift, C.accent, G.big, 'center', a1);
      text(ctx, G.compact ? 'of 51 published' : 'of the 51 published', G.cP, ySub + lift, C.muted, 11, 'center', a1);
    };

    mountStory(fig, {
      cycle: [2.4, 4.6, 4.2, 2.6], manual: 2.6, frame: { below: 600, wide: 20, narrow: 18 }, layout, draw, groupLabel: 'Show the trials as the FDA saw them or as published',
      names: ['What the FDA saw', 'What was published'],
      status: [
        'What the FDA saw: of 74 trials, 38 were positive, 51 percent, and 36 negative or questionable.',
        'What was published: of the 74 trials, 23 were not published. Of the 51 that were, 48 look positive, 94 percent. Eleven of those 48 were negative or questionable by the FDA but published as positive, and 3 were published as negative.',
      ],
    });
  }

  /* ===================================================================================================
     3. The audit: 1,000 dots, one for 23 of the 23,000 articles, sorted by what each article printed
     =================================================================================================== */
  function mountAudit(fig) {
    const shares = cellNumbers(document.getElementById('table-audit-shares'), [1], 5);         // the table's five rows, in %
    const COUNTS = shares ? shares.map(r => Math.round(r[0] * 10)) : [397, 277, 180, 101, 45];
    const PCT = shares ? shares.map(r => `${r[0].toFixed(2)}%`) : ['39.70%', '27.72%', '18.03%', '10.07%', '4.49%'];
    const LONG = [['p-value and test named,', 'no statistic value'], ['No inferential statistics'], ['Only estimates and', 'confidence intervals'],
      ['Incomplete or unpaired', 'reporting'], ['Statistic, df and p:', 'checkable']];
    const SHORT = ['p-value, no statistic value', 'No inferential statistics', 'Estimates and CIs only', 'Incomplete or unpaired', 'Statistic, df and p'];
    const N = COUNTS.reduce((p, q) => p + q, 0), LAST = COUNTS.length - 1;
    const grp = new Uint8Array(N), at = new Uint16Array(N);       // each dot's group, and its place within it
    { let i = 0; COUNTS.forEach((n, g) => { for (let j = 0; j < n; j++) { grp[i] = g; at[i++] = j; } }); }
    const sx = new Float32Array(N), sy = new Float32Array(N), bx = new Float32Array(N), by = new Float32Array(N);
    let G = null;

    const layout = ({ W, H, narrow }) => {
      const R = narrow ? 8 : 5, longest = Math.ceil(Math.max(...COUNTS) / R);
      // as large as the width allows (the longest bar must fit) and the height allows (five bars, a label above each when stacked)
      const byWidth = narrow ? Math.floor((W - 32) / longest) : Math.floor((W - 232 - 80) / longest);
      const off = narrow ? 2 : 3, between = narrow ? 4 * (10 + 16) : 4 * 10, bottom = narrow ? 12 : 20;      // bar height = R * pitch - off
      const byHeight = Math.floor(((H - 60 - bottom - between) / COUNTS.length + off) / R);
      const pitch = clamp(Math.min(byWidth, byHeight), 4, narrow ? 8 : 9);
      let size = pitch - (narrow ? 2 : 3);
      size -= size % 2;                                            // even, so squares at whole pixels stay crisp
      const barH = (R - 1) * pitch + size, x0 = narrow ? 16 : 232;
      const gap = narrow ? 10 : clamp((H - 60 - 20 - COUNTS.length * barH) / (COUNTS.length - 1), 10, 34);
      const rows = COUNTS.map((_, g) => (narrow ? 60 + g * (barH + gap + 16) : 60 + g * (barH + gap)));      // top of each bar
      for (let i = 0; i < N; i++) {
        bx[i] = x0 + size / 2 + Math.floor(at[i] / R) * pitch; by[i] = rows[grp[i]] + size / 2 + (at[i] % R) * pitch;
        sx[i] = Math.round(18 + hash(i, 31) * (W - 36)); sy[i] = Math.round((narrow ? 40 : 46) + hash(i, 32) * (H - (narrow ? 58 : 66)));
      }
      G = { narrow, size, x0, pitch, barH, rows, cols: COUNTS.map(n => Math.ceil(n / R)) };
    };

    const draw = (ctx, W, H, s) => {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const n = G.narrow, f = clamp(s / 0.78, 0, 1), lit = ease(clamp((s - 0.8) / 0.2, 0, 1));
      const labelA = ease(clamp((s - 0.55) / 0.25, 0, 1)), unsorted = 1 - ease(clamp(s / 0.2, 0, 1));
      const where = i => { const q = ease(clamp((f - 0.3 * hash(i, 5)) / 0.7, 0, 1)); return [lerp(sx[i], bx[i], q), lerp(sy[i], by[i], q)]; };
      for (let i = 0; i < N; i++) { const [x, y] = where(i); square(ctx, x, y, G.size, C.muted); }
      if (lit > 0) for (let i = 0; i < N; i++) {                   // the checkable group lights up green over its grey
        if (grp[i] !== LAST) continue;
        const [x, y] = where(i); square(ctx, x, y, G.size, C.accent, lit);
      }
      text(ctx, n ? '1,000 DOTS = 23,000 ARTICLES' : '1,000 DOTS: EACH STANDS FOR 23 OF THE 23,000 ARTICLES', n ? 16 : 22, n ? 22 : 28, C.muted, 11, 'left', unsorted);
      text(ctx, 'SORTED BY WHAT EACH ARTICLE PRINTED', n ? 16 : 22, n ? 22 : 28, C.muted, 11, 'left', labelA);
      COUNTS.forEach((_, g) => {
        const top = G.rows[g], mid = top + G.barH / 2, endX = G.x0 + G.cols[g] * G.pitch + 12, last = g === LAST;
        if (n) {
          text(ctx, SHORT[g], 16, top - 8, last ? C.cream : C.muted, 12, 'left', labelA);
          text(ctx, PCT[g], W - 16, top - 8, C.muted, 12, 'right', last ? labelA * (1 - lit) : labelA);
          if (last) text(ctx, `${PCT[g]}  about 1 in 22`, W - 16, top - 8, C.accent, 12, 'right', lit);
        } else {
          LONG[g].forEach((line, k) => text(ctx, line, 214, mid + 4 + (k - (LONG[g].length - 1) / 2) * 15, last ? C.cream : C.muted, 12, 'right', labelA));
          text(ctx, PCT[g], endX, mid + 4, C.muted, 12, 'left', last ? labelA * (1 - lit) : labelA);
          if (last) text(ctx, `${PCT[g]}  ·  about 1 in 22`, endX, mid + 4, C.accent, 12, 'left', lit);
        }
      });
    };

    mountStory(fig, {
      cycle: [2.2, 5.2, 4.6, 2.8], manual: 3, frame: { below: 720, wide: 21, narrow: 26 }, layout, draw, groupLabel: 'Show the articles unsorted, or sorted by what each one printed',
      names: ['Unsorted', 'Sorted'],
      status: [
        'All 23,000 audited articles, drawn as 1,000 dots of 23 articles each.',
        'Sorted by what each article printed: 397 dots printed a p-value and the test but no statistic value, 277 no inferential statistics, 180 only estimates and confidence intervals, 101 incomplete or unpaired reporting, and 45 dots, about 1 in 22, a statistic, degrees of freedom and p-value that can be checked.',
      ],
    });
  }

  /* ---------- start ---------- */
  const figures = [...document.querySelectorAll('.estic-anim')];
  if (!figures.length) return;
  if (!('IntersectionObserver' in window)) { figures.forEach(f => { f.hidden = true; }); return; }

  // jStat (the Student t distribution) is fetched only when the simulation is within a screen or so of view
  const loadJStat = fig => new Promise((resolve, reject) => {
    if (window.jStat) { resolve(window.jStat); return; }
    const s = document.createElement('script');
    s.src = fig.dataset.jstat; s.integrity = fig.dataset.jstatIntegrity; s.crossOrigin = 'anonymous';
    s.onload = () => (window.jStat ? resolve(window.jStat) : reject(new Error('jStat did not define jStat')));
    s.onerror = () => reject(new Error('jStat did not load'));
    document.head.appendChild(s);
  });
  const start = () => figures.forEach(fig => {
    if (fig.dataset.anim === 'pubbias') mountPubbias(fig);
    else if (fig.dataset.anim === 'audit') mountAudit(fig);
    else if (fig.dataset.anim === 'spreads') {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        loadJStat(fig).then(j => mountSpreads(fig, j)).catch(() => { fig.hidden = true; });   // without it the table and figure stand alone
      }, { rootMargin: '700px 0px' });
      io.observe(fig);
    }
  });
  const fonts = document.fonts && document.fonts.load ? document.fonts.load(font(12)).catch(() => {}) : Promise.resolve();
  Promise.race([fonts, new Promise(r => setTimeout(r, 1500))]).then(start);
})();
