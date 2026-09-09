/* Общий каркас (header/footer/подключение стилей и скриптов) для ВСЕХ
 * страниц сайта, включая главную (см. render-home.js) — раньше
 * index.html был отдельным самодостаточным файлом с ручной копией
 * header/footer, из-за чего эти копии разошлись (например, ссылка
 * "О нас" вела на несуществующую /about). Теперь один источник правды.
 *
 * Каждая страница — всё равно полностью самодостаточный HTML-файл на
 * выходе (без клиентских include'ов) — дублирование живёт только на
 * уровне этой функции в исходниках сборки, не в браузере.
 */

const { TELEGRAM_BOT_URL, YANDEX_METRIKA_ID, YANDEX_VERIFICATION, GOOGLE_VERIFICATION, CITY } = require("./constants");

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRINTLAB",
  url: "https://3-d-shop.ru",
  address: { "@type": "PostalAddress", addressLocality: CITY, addressCountry: "RU" },
  sameAs: [TELEGRAM_BOT_URL],
};

// Apache отдаёт CSS/JS с cache-control: max-age=31536000 (год) без
// собственного billing-хэша — единственный способ инвалидировать кэш
// у уже заходивших посетителей — вручную бампать эту версию при правке
// tokens/base/components.css или любого /js/*.js.
const ASSET_V = 5;

function metrikaSnippet() {
  if (!YANDEX_METRIKA_ID) return "";
  return `<script>window.__YM_ID__ = ${YANDEX_METRIKA_ID};</script>
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');
    ym(${YANDEX_METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true,
    ecommerce:"dataLayer", referrer: document.referrer,
    url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}"
style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
}

function verificationTags() {
  const tags = [];
  if (YANDEX_VERIFICATION) tags.push(`<meta name="yandex-verification" content="${YANDEX_VERIFICATION}"/>`);
  if (GOOGLE_VERIFICATION) tags.push(`<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}"/>`);
  return tags.join("\n");
}

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
${verificationTags()}
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
${metrikaSnippet()}
<script type="application/ld+json">${JSON.stringify(ORGANIZATION_SCHEMA)}</script>
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
      <a href="/cart" class="cart-icon" aria-label="Корзина"><span aria-hidden="true">🛒</span><span class="count" id="cartCount" hidden>0</span></a>
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
      <li><a href="/delivery">Доставка</a></li>
    </ul>
    <div class="footer-actions">
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
<script src="/js/cart.js?v=${ASSET_V}"></script>
<script src="/js/analytics.js?v=${ASSET_V}"></script>
<script src="/js/order-api.js?v=${ASSET_V}"></script>
${extraScripts}
</body>
</html>
`;
}

module.exports = { renderLayout, TELEGRAM_BOT_URL };
