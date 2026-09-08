/* Общий каркас (header/footer/подключение стилей и скриптов) для всех
 * СГЕНЕРИРОВАННЫХ страниц (каталог, товар, блог, принтер) — чтобы не
 * копировать вручную в каждом render-скрипте. index.html остаётся
 * отдельным самодостаточным файлом (первая страница, уже отлажена
 * и проверена вживую — не переводим её на этот каркас, чтобы не
 * рисковать регрессией).
 *
 * Каждая СГЕНЕРИРОВАННАЯ страница — всё равно полностью самодостаточный
 * HTML-файл на выходе (без клиентских include'ов) — дублирование живёт
 * только на уровне этой функции в исходниках сборки, не в браузере.
 */

const TELEGRAM_BOT_URL = "https://t.me/Shop3D_online_bot";

// Apache отдаёт CSS/JS с cache-control: max-age=31536000 (год) без
// собственного billing-хэша — единственный способ инвалидировать кэш
// у уже заходивших посетителей — вручную бампать эту версию при правке
// tokens/base/components.css или любого /js/*.js. Держим её же на
// templates/index.html (см. её собственные ?v= в <head>/перед </body>).
const ASSET_V = 1;

function navLink(href, label, activeHref) {
  const active = href === activeHref ? ' aria-current="page"' : "";
  return `<li><a href="${href}"${active}>${label}</a></li>`;
}

function renderLayout({
  title,
  description,
  canonical,
  ogImage = "/images/printer/p2s-front.webp",
  activeNav = "",
  bodyContent,
  extraHead = "",
  extraScripts = "",
}) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://3-d-shop.ru${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="https://3-d-shop.ru${ogImage}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🖨️</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/tokens.css?v=${ASSET_V}">
<link rel="stylesheet" href="/css/base.css?v=${ASSET_V}">
<link rel="stylesheet" href="/css/components.css?v=${ASSET_V}">
<script type="importmap">
{
  "imports": {
    "three": "/js/vendor/three.module.js?v=${ASSET_V}"
  }
}
</script>
${extraHead}
</head>
<body>

<canvas id="bg-canvas" aria-hidden="true"></canvas>

<header class="site-header">
  <div class="container">
    <a href="/" class="logo"><span class="logo-mark">◆</span> PRINTLAB</a>
    <ul class="nav-links">
      ${navLink("/catalog", "Каталог", activeNav)}
      ${navLink("/blog", "Блог", activeNav)}
      ${navLink("/printer", "Производство", activeNav)}
      ${navLink("/about", "О нас", activeNav)}
    </ul>
    <div class="nav-actions">
      <a href="/cart" class="cart-icon" aria-label="Корзина">🛒<span class="count">2</span></a>
      <a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost" target="_blank" rel="noopener">Telegram</a>
    </div>
  </div>
</header>

${bodyContent}

<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="logo"><span class="logo-mark">◆</span> PRINTLAB</div>
      <div class="footer-meta">© 2026 PRINTLAB · Брянск</div>
    </div>
    <ul class="footer-links">
      <li><a href="/catalog">Каталог</a></li>
      <li><a href="/blog">Блог</a></li>
      <li><a href="/printer">Производство</a></li>
      <li><a href="/about">О нас</a></li>
    </ul>
    <div class="footer-actions">
      <a href="#" class="social-icon" aria-label="Авито" title="Авито">A</a>
      <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary btn-telegram" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 4L2.5 11.5c-1 .4-1 1.5.1 1.8l4.4 1.4 1.7 5.3c.2.7 1.1.9 1.6.3l2.4-2.7 4.6 3.4c.7.5 1.7.1 1.9-.7L22 4.9c.2-.8-.6-1.4-1-.9z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
        Написать в Telegram
      </a>
    </div>
  </div>
</footer>

<script src="/js/vendor/gsap.min.js?v=${ASSET_V}"></script>
<script src="/js/vendor/ScrollTrigger.min.js?v=${ASSET_V}"></script>
<script type="module" src="/js/three-background.js?v=${ASSET_V}"></script>
<script src="/js/scroll-animations.js?v=${ASSET_V}"></script>
${extraScripts}
</body>
</html>
`;
}

module.exports = { renderLayout, TELEGRAM_BOT_URL };
