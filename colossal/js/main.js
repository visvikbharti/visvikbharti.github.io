/* ===== Initialise GSAP ===== */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
  
    /* 1. Hero colour‑shift on scroll ------------------------------------ */
    gsap.to('#hero .bg-video', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      filter: 'contrast(130%) saturate(200%) brightness(1)'
    });
  
    /* 2. Count‑up animation in stats ------------------------------------ */
    gsap.utils.toArray('.num').forEach(el => {
      const final = +el.dataset.count;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(el, {textContent: 0}, {
            textContent: final,
            duration: 2,
            ease: 'power1.out',
            snap: {textContent: 1},
            onUpdate: () => el.textContent = Math.floor(el.textContent)
          });
        }
      });
    });
  
    /* 3. Split panels reveal ------------------------------------------- */
    gsap.utils.toArray('.projects .split').forEach(panel => {
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
    gsap.utils.toArray('.panel').forEach(panel => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        pin: true,
        pinSpacing: false
      });
    });
  });
  