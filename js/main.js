/* ===== Initialise GSAP ===== */
document.documentElement.classList.replace('no-js', 'js');

document.addEventListener('DOMContentLoaded', () => {
    /* Footer year (the HTML holds a fallback for no-JS visitors) -------- */
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Headline decodes from random bases (the real text is in the DOM for screen readers) */
    // Time-based, so a throttled tab can never leave it half-decoded; skipped if the page
    // opens in a background tab (e.g. a search result opened with Cmd/Ctrl-click).
    if (!reduceMotion && !document.hidden) document.querySelectorAll('.scramble').forEach((el, i) => {
      const text = el.dataset.text || el.textContent;
      const duration = 1000 + i * 350;
      const start = performance.now();
      const tick = () => {
        const done = Math.floor(text.length * Math.min(1, (performance.now() - start) / duration));
        el.textContent = text.slice(0, done) +
          text.slice(done).replace(/\S/g, () => 'ATGC'[Math.floor(Math.random() * 4)]);
        if (done < text.length) setTimeout(tick, 45);
      };
      tick();
    });

    /* HUD clock: New Delhi and UTC */
    const ist = document.getElementById('hud-ist'), utc = document.getElementById('hud-utc');
    if (ist && utc) {
      const fmt = zone => new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const fIst = fmt('Asia/Kolkata'), fUtc = fmt('UTC');
      const tickClock = () => { const now = new Date(); ist.textContent = fIst.format(now); utc.textContent = fUtc.format(now); };
      tickClock();
      setInterval(tickClock, 1000);
    }

    /* Project images that do not exist yet: let the copy take the full width */
    const imageChecks = [...document.querySelectorAll('.split__img:not([data-art])')].map(el => new Promise(resolve => {
      const m = /url\(["']?([^"')]+)["']?\)/.exec(el.style.backgroundImage || '');
      if (!m) { el.closest('.split').classList.add('split--noimg'); return resolve(); }
      const probe = new Image();
      probe.onload = () => resolve();
      probe.onerror = () => { el.closest('.split').classList.add('split--noimg'); resolve(); };
      probe.src = m[1];
    }));

    // Everything below needs GSAP; without it the page stays static and readable.
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* Smooth scrolling for anchor links --------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        const targetElement = targetId.length > 1 && document.querySelector(targetId);
        if (!targetElement) return;
        e.preventDefault();

        // A pinned panel is position:fixed, so measure its pin-spacer (its place in the flow)
        const inFlow = targetElement.parentElement.classList.contains('pin-spacer')
          ? targetElement.parentElement : targetElement;
        const yOffset = inFlow.getBoundingClientRect().top + window.pageYOffset;

        // Use GSAP's ScrollToPlugin for smooth scrolling that works with ScrollTrigger
        gsap.to(window, {
          duration: reduceMotion ? 0 : 1,
          scrollTo: {
            y: yOffset,
            autoKill: false
          },
          ease: "power2.inOut",
          onComplete: () => {
            // Move keyboard focus to the section and keep the URL shareable
            if (!targetElement.hasAttribute('tabindex')) targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
            history.pushState(null, '', targetId);
          }
        });
      });
    });
  
    /* 1. Hero tissue fades as you scroll past it --------------------- */
    if (!reduceMotion) gsap.to('#hero-cells', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      opacity: 0.25
    });
  
    /* 2. Count‑up animation in stats ------------------------------------ */
    // The HTML carries the final numbers; only count up from 0 when motion is welcome.
    if (!reduceMotion) gsap.utils.toArray('.num').forEach(el => {
      const final = +el.dataset.count;
      let counted = false;
      const countUp = () => {
        if (counted) return;
        counted = true;
        gsap.fromTo(el, {textContent: 0}, {
          textContent: final,
          duration: 2,
          ease: 'power1.out',
          snap: {textContent: 1},
          onUpdate: () => el.textContent = Math.floor(el.textContent)
        });
      };
      // Blank the number only while it is below the fold, so it counts up in view.
      // Counting on enter-back too means a visitor who lands further down (deep
      // link, reload) and scrolls up never sees a stuck 0.
      if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = 0;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: countUp,
        onEnterBack: countUp
      });
    });
  
    /* 3. Split panels reveal ------------------------------------------- */
    if (!reduceMotion) gsap.utils.toArray('.projects .split').forEach(panel => {
      const img  = panel.querySelector('.split__img');
      const copy = panel.querySelector('.split__copy');
  
      gsap.from(img,  {
        xPercent: -25,
        scale: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 90%',
          end: 'top 50%',
          scrub: true
        }
      });
  
      gsap.from(copy, {
        opacity: 0,
        y: 100,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          end: 'top 60%',
          scrub: true
        }
      });
    });
  
    /* 4. Pin each section for nice snap feeling ------------------------- */
    // Panels taller than the viewport pin at their bottom edge instead of their
    // top, so all of their content scrolls past before the next panel covers it.
    // Pinning a tall panel at 'top top' froze it and hid everything below the fold.
    gsap.utils.toArray('.panel').forEach(panel => {
      ScrollTrigger.create({
        trigger: panel,
        start: () => panel.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top',
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true
      });
    });

    // Panel heights change when missing project images collapse; re-measure the pins
    Promise.all(imageChecks).then(() => ScrollTrigger.refresh());
  });
  