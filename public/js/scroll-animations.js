/* ScrollTrigger-анимации: шаги ("как это работает"), материалы,
 * горизонтальный pinned-скролл товаров на десктопе. Все триггеры —
 * once:true (не повторяются при обратном скролле). При
 * prefers-reduced-motion — просто показываем финальное состояние без
 * анимации, ничего не регистрируем в ScrollTrigger. */
function initScrollAnimations() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Шаги: стаггер-появление + draw-линия между номерами ----------
  const stepsSection = document.querySelector('.steps');
  const stepEls = gsap.utils.toArray('.step');
  const connectorPath = document.querySelector('.steps-connector path');
  const connectorDots = gsap.utils.toArray('.steps-connector circle');

  if (stepsSection && stepEls.length) {
    if (prefersReducedMotion) {
      gsap.set(stepEls, { opacity: 1, y: 0 });
      if (connectorPath) gsap.set(connectorPath, { strokeDashoffset: 0 });
      if (connectorDots.length) gsap.set(connectorDots, { scale: 1, opacity: 1 });
    } else {
      gsap.set(stepEls, { opacity: 0, y: 28 });
      if (connectorPath) {
        const len = connectorPath.getTotalLength();
        connectorPath.style.strokeDasharray = String(len);
        gsap.set(connectorPath, { strokeDashoffset: len });
      }
      if (connectorDots.length) {
        gsap.set(connectorDots, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
      }

      ScrollTrigger.create({
        trigger: stepsSection,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(stepEls, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.3 });
          if (connectorPath) {
            tl.to(connectorPath, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, 0.15);
          }
          if (connectorDots.length) {
            tl.to(connectorDots, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.3, ease: 'back.out(2)' }, 0.15);
          }
        },
      });
    }
  }

  // ---------- Материалы: clip-path reveal + прогресс-бары ----------
  gsap.utils.toArray('.material-card').forEach((card) => {
    const bars = card.querySelectorAll('.stat-bar-fill');
    if (prefersReducedMotion) {
      gsap.set(card, { clipPath: 'inset(0 0 0% 0)', opacity: 1 });
      bars.forEach((bar) => { bar.style.width = bar.dataset.value + '%'; });
      return;
    }
    gsap.set(card, { clipPath: 'inset(0 0 100% 0)', opacity: 1 });
    bars.forEach((bar) => { bar.style.width = '0%'; });

    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(card, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power3.out' });
        bars.forEach((bar, i) => {
          gsap.to(bar, {
            width: bar.dataset.value + '%',
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.25 + i * 0.12,
          });
        });
      },
    });
  });

  // ---------- Товары: горизонтальный pinned-скролл (только десктоп) ----------
  const track = document.querySelector('.products-track');
  const pinWrap = document.querySelector('.products-pin-wrap');
  if (track && pinWrap) {
    let horizontalST = null;

    function setupHorizontal() {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (horizontalST) { horizontalST.kill(); horizontalST = null; gsap.set(track, { x: 0 }); }
      if (!isDesktop || prefersReducedMotion) return;

      const distance = track.scrollWidth - pinWrap.clientWidth;
      if (distance <= 0) return;

      horizontalST = ScrollTrigger.create({
        trigger: pinWrap,
        start: 'top top+=72',
        end: () => '+=' + distance,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        animation: gsap.to(track, { x: -distance, ease: 'none' }),
      });
    }

    setupHorizontal();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { setupHorizontal(); ScrollTrigger.refresh(); }, 250);
    });
  }
}

// ScrollTrigger.create() сам по себе синхронно измеряет layout — не
// нужно к моменту первой отрисовки (анимации всё равно триггерятся при
// скролле), поэтому откладываем до простоя браузера. Lighthouse mobile
// показывал тут ~1.3s одной длинной задачи на критическом пути до фикса.
function schedule(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 200);
}

if (document.readyState !== 'loading') schedule(initScrollAnimations);
else document.addEventListener('DOMContentLoaded', () => schedule(initScrollAnimations));
