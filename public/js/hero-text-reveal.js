/* Появление hero-текста при загрузке: заголовок — побуквенно, затем
 * подзаголовок и кнопки с задержкой. Исходный текст не трогаем в DOM
 * до JS (если скрипт не выполнился — заголовок останется обычным
 * читаемым текстом, а не пустым местом), поэтому скрытие/сплит делаем
 * через gsap.set(), а не CSS "opacity:0 по умолчанию". */
function initHeroReveal() {
  const gsap = window.gsap;
  const h1 = document.querySelector('.hero-content h1');
  const lede = document.querySelector('.hero-content .lede');
  const actions = document.querySelector('.hero-content .hero-actions');
  const kicker = document.querySelector('.hero-content .kicker');
  if (!gsap || !h1) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // текст уже виден как обычный HTML — ничего делать не нужно

  // textContent "съедает" <br> (переносит "Из идеи — в вещь." и "Слой за
  // слоем." в одну строку без пробела) — поэтому обходим childNodes и
  // сохраняем реальные <br> как есть, на буквы бьём только текстовые узлы.
  const originalNodes = [...h1.childNodes];
  h1.setAttribute('aria-label', h1.textContent);
  h1.innerHTML = '';

  // Каждая буква — свой inline-block span (нужно для по-буквенной
  // анимации), но без группировки по словам браузер переносит строку
  // между ЛЮБЫМИ двумя span'ами — в том числе посреди слова (поймано
  // вживую на мобильном экране). Оборачиваем каждое слово в span с
  // white-space:nowrap — перенос остаётся только между словами.
  const frag = document.createDocumentFragment();
  const letterSpans = [];

  function appendWord(word) {
    const wordWrap = document.createElement('span');
    wordWrap.style.display = 'inline-block';
    wordWrap.style.whiteSpace = 'nowrap';
    [...word].forEach((ch) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      wordWrap.appendChild(span);
      letterSpans.push(span);
    });
    frag.appendChild(wordWrap);
  }

  originalNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(' ');
      words.forEach((word, i) => {
        if (word) appendWord(word);
        if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });
    } else {
      frag.appendChild(node.cloneNode(true)); // <br> и подобное — как есть
    }
  });
  h1.appendChild(frag);

  const tl = gsap.timeline({ delay: 0.15 });

  if (kicker) tl.from(kicker, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' });

  tl.set(letterSpans, { opacity: 0, y: 24 })
    .to(letterSpans, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.022,
    }, kicker ? '-=0.15' : 0);

  if (lede) {
    tl.from(lede, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.15');
  }
  if (actions) {
    tl.from(actions, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  }
}

if (document.readyState !== 'loading') initHeroReveal();
else document.addEventListener('DOMContentLoaded', initHeroReveal);
