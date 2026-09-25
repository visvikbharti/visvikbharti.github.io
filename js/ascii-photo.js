/* ===== Photos drawn as characters =====
   Each figure.ascii-photo holds a real <img>. A canvas on top redraws it as monospace
   characters (brighter pixels, denser glyphs); hovering fades the canvas to show the photo.
   Without JS, or if the image fails, the plain greyscale photo shows. */
(() => {
  const RAMP = ' .,:;-=+*#%@';
  const FONT_PX = 8;
  const LINE = 9;
  const FONT = `${FONT_PX}px "Geist Mono", "IBM Plex Mono", monospace`;

  function render(fig, img) {
    let canvas = fig.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      fig.appendChild(canvas);
    }
    const W = fig.clientWidth, H = fig.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT;
    const cw = ctx.measureText('M').width || 5.4;
    const cols = Math.ceil(W / cw), rows = Math.ceil(H / LINE);

    // sample the photo at one pixel per character, cropped like object-fit: cover
    const sample = document.createElement('canvas');
    sample.width = cols; sample.height = rows;
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    const ir = img.naturalWidth / img.naturalHeight, br = (cols * cw) / (rows * LINE);
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (ir > br) { sw = sh * br; sx = (img.naturalWidth - sw) / 2; } else { sh = sw / br; sy = (img.naturalHeight - sh) / 2; }
    sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    let px;
    try { px = sctx.getImageData(0, 0, cols, rows).data; } catch (e) { return; }

    // luminance, then edges (Sobel): outlines carry a picture far better than flat tone does
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    }
    // stretch each photo's tones between its 2nd and 98th percentile
    const sorted = Float32Array.from(lum).sort();
    const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
    for (let i = 0; i < lum.length; i++) lum[i] = Math.max(0, Math.min(1, (lum[i] - lo) / (hi - lo || 1)));
    const at = (c, r) => lum[Math.max(0, Math.min(rows - 1, r)) * cols + Math.max(0, Math.min(cols - 1, c))];
    let maxEdge = 1e-6;
    const edge = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = at(c + 1, r - 1) + 2 * at(c + 1, r) + at(c + 1, r + 1) - at(c - 1, r - 1) - 2 * at(c - 1, r) - at(c - 1, r + 1);
        const gy = at(c - 1, r + 1) + 2 * at(c, r + 1) + at(c + 1, r + 1) - at(c - 1, r - 1) - 2 * at(c, r - 1) - at(c + 1, r - 1);
        const e = Math.hypot(gx, gy);
        edge[r * cols + c] = e;
        if (e > maxEdge) maxEdge = e;
      }
    }

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    const shades = ['#2b2b2b', '#424242', '#5c5c5c', '#7a7a7a', '#9b9b9b', '#c0c0c0'];
    const buckets = shades.map(() => []);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const v = Math.min(1, 0.8 * Math.pow(lum[i], 1.3) + 0.45 * Math.pow(edge[i] / maxEdge, 0.8));
        const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
        if (ch === ' ') continue;
        buckets[Math.min(shades.length - 1, Math.floor(v * shades.length))].push(c * cw, r * LINE, ch);
      }
    }
    buckets.forEach((b, i) => {
      ctx.fillStyle = shades[i];
      for (let j = 0; j < b.length; j += 3) ctx.fillText(b[j + 2], b[j], b[j + 1]);
    });
  }

  function setup() {
    const figs = [...document.querySelectorAll('figure.ascii-photo')];
    const draw = fig => {
      const img = fig.querySelector('img');
      if (!img) return;
      if (img.complete && img.naturalWidth) render(fig, img);
      else img.addEventListener('load', () => render(fig, img), { once: true });
    };
    // draw when a figure comes near the viewport (the images are lazy-loaded)
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const img = e.target.querySelector('img');
      if (img) img.loading = 'eager';
      draw(e.target);
    }), { rootMargin: '400px' });
    figs.forEach(f => io.observe(f));
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => figs.forEach(draw), 250); });
  }

  const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(setup, setup);
})();
