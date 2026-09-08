/* 3D-наклон карточки товара за курсором (CSS perspective + rotateX/Y).
 * Только там, где есть реальный hover (не тач-экраны) и когда
 * пользователь не просил уменьшить анимацию. */
function initProductTilt() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (prefersReducedMotion || !hasHover) return;

  const cards = document.querySelectorAll('.product-card');
  const MAX_TILT = 10; // градусов

  cards.forEach((card) => {
    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = (0.5 - py) * MAX_TILT * 2;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      card.style.setProperty('--glow-x', `${px * 100}%`);
      card.style.setProperty('--glow-y', `${py * 100}%`);
    }
    function onLeave() {
      card.style.transform = '';
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
}

if (document.readyState !== 'loading') initProductTilt();
else document.addEventListener('DOMContentLoaded', initProductTilt);
