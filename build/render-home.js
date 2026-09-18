const fs = require("fs");
const path = require("path");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");
const { CATEGORY_TILES, LEAD_TIME, CITY_PREP, TRUST_STATS } = require("./constants");
const { loadProducts, productCard, customOrderTeaser } = require("./render-products");
const { loadPosts, blogCardHTML } = require("./render-blog");

function categoryHref(tile) {
  if (tile.kind === "custom") return "/custom-order";
  if (tile.kind === "featured") return "/catalog?category=featured";
  return `/catalog?category=${encodeURIComponent(tile.key)}`;
}

function categoriesSection() {
  // Иконка+подпись уже нарисованы на самом фото (см. public/images/categories/),
  // поэтому поверх ничего не дублируем — только доступный alt для скринридеров.
  const tiles = CATEGORY_TILES.map(
    (t) => `<a href="${categoryHref(t)}" class="category-tile category-tile--photo">
        <picture>
          <source srcset="/images/categories/${t.img}.webp" type="image/webp">
          <img src="/images/categories/${t.img}.jpg" alt="${t.label}" loading="lazy">
        </picture>
      </a>`
  ).join("\n      ");

  return `<section class="section">
  <div class="container">
    <div class="section-head"><span class="kicker">Каталог</span><h2>Категории</h2></div>
    <div class="categories-grid">
      ${tiles}
    </div>
  </div>
</section>`;
}

function trustStatsSection() {
  const items = TRUST_STATS.map(
    (s) => `<div class="trust-stat">
        <div class="trust-stat-icon">${s.icon}</div>
        <div class="trust-stat-value mono" data-count-to="${s.value}" data-count-suffix="${s.suffix || ""}">${s.value.toLocaleString("ru-RU")}${s.suffix || ""}</div>
        <div class="trust-stat-label">${s.label}</div>
      </div>`
  ).join("\n      ");
  return `<section class="section trust-stats-section">
  <div class="container">
    <div class="section-head"><span class="kicker">Наш опыт</span><h2>Цифры говорят сами</h2></div>
    <div class="trust-stats">
      ${items}
    </div>
  </div>
</section>`;
}

function popularSection(products) {
  // Показываем ровно 2 последних добавленных в каталог товара (последние
  // элементы объединённого списка products.json + products-autumn.json).
  // Список сам обновится при следующей сборке, как только появится новый
  // товар — вручную помечать "featured" для этого больше не нужно.
  const popular = products.slice(-2);
  const cards = popular.map((p) => productCard(p)).join("\n      ");
  return `<section class="section products-section">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Каталог</span>
      <h2>Популярное</h2>
    </div>
    <div class="product-grid popular-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

const WHY_US = [
  { icon: "⚡", title: "Изготовление от 1 дня", text: "Печатаем сами на своём принтере — без посредников и без ожидания чужой очереди." },
  { icon: "🎨", title: "Разные цвета и материалы", text: "PLA, PETG, ABS, TPU — подбираем материал под задачу, а не только под то, что есть." },
  { icon: "🛠", title: "Изготовление под заказ", text: "Не нашли нужную вещь в каталоге — напечатаем по вашему файлу, эскизу или фото." },
  { icon: "📦", title: "Доставка по России", text: "Самовывоз в Брянске или отправка в любой другой город." },
  { icon: "💬", title: "Поможем подобрать товар", text: "Не уверены, что выбрать — напишите в Telegram, подскажем вариант под задачу." },
];

function whyUsSection() {
  const cards = WHY_US.map(
    (w) => `<div class="why-us-card">
        <div class="why-us-icon">${w.icon}</div>
        <h3>${w.title}</h3>
        <p>${w.text}</p>
      </div>`
  ).join("\n      ");
  return `<section class="section print-layers">
  <div class="container">
    <div class="section-head"><span class="kicker">Почему мы</span><h2>Почему PRINTLAB?</h2></div>
    <div class="why-us-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

const FAQ = [
  { q: "Сколько изготавливается заказ?", a: `Обычно ${LEAD_TIME} — зависит от размера и сложности изделия.` },
  { q: "Можно ли выбрать цвет?", a: "Да, если у товара в каталоге указаны цветовые варианты — выбор доступен прямо на странице товара. Для остальных позиций уточняйте в Telegram." },
  { q: "Можно ли заказать своё изделие?", a: "Да — заполните форму кастомного заказа или напишите в Telegram с описанием, файлом или эскизом." },
  { q: "Можно ли сделать деталь по фотографии?", a: "Да, если по фото понятны форма и примерные размеры. Для точных деталей лучше приложить размеры или 3D-модель." },
  { q: "Отправляете ли вы по России?", a: "Да, доставляем в другие города — способ и стоимость уточняем в Telegram при оформлении заказа." },
  { q: "Можно ли заказать несколько изделий?", a: "Да, любое количество — для партий и сувенирных тиражей есть отдельный раздел «Нужна партия изделий» на странице кастомного заказа." },
];

function faqSection() {
  const items = FAQ.map(
    (f) => `<details class="faq-item">
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`
  ).join("\n      ");
  return `<section class="section">
  <div class="container container--article">
    <div class="section-head"><span class="kicker">Вопросы</span><h2>FAQ</h2></div>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>`;
}

function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function blogPreviewSection(posts) {
  const cards = posts.slice(0, 3).map(blogCardHTML).join("\n      ");
  return `<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Блог</span>
      <h2>Читаем перед печатью</h2>
    </div>
    <div class="blog-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

function printerTeaserSection() {
  return `<section class="section">
  <div class="container printer-teaser-grid">
    <img src="/images/printlab-equipment-800.webp"
      srcset="/images/printlab-equipment-480.webp 480w, /images/printlab-equipment-800.webp 800w, /images/printlab-equipment-1200.webp 1200w"
      sizes="(max-width: 767px) 90vw, 600px"
      alt="Наше оборудование для 3D-печати" class="printer-teaser-photo" loading="lazy">
    <div class="printer-teaser-content">
      <span class="kicker">Наше оборудование</span>
      <h2>Печатаем на современном 3D-принтере</h2>
      <p class="lede" style="margin-bottom: 0;">Быстро, точно и с многоцветной печатью за один проход — значит выше качество и короче срок изготовления вашего заказа.</p>
      <div class="printer-teaser-specs">
        <div class="printer-teaser-spec">
          <span class="printer-teaser-spec-icon">⚡</span>
          <span class="printer-teaser-spec-text"><span class="printer-teaser-spec-value mono">Высокая скорость</span><span class="printer-teaser-spec-label">короче срок изготовления</span></span>
        </div>
        <div class="printer-teaser-spec">
          <span class="printer-teaser-spec-icon">🎯</span>
          <span class="printer-teaser-spec-text"><span class="printer-teaser-spec-value mono">Высокая точность</span><span class="printer-teaser-spec-label">±0.05 мм, без доработки</span></span>
        </div>
        <div class="printer-teaser-spec">
          <span class="printer-teaser-spec-icon">🎨</span>
          <span class="printer-teaser-spec-text"><span class="printer-teaser-spec-value mono">До 16 цветов</span><span class="printer-teaser-spec-label">за один проход печати</span></span>
        </div>
        <div class="printer-teaser-spec">
          <span class="printer-teaser-spec-icon">🧪</span>
          <span class="printer-teaser-spec-text"><span class="printer-teaser-spec-value mono">4 материала</span><span class="printer-teaser-spec-label">PLA, PETG, ABS, TPU</span></span>
        </div>
      </div>
      <a href="/printer" class="btn btn-primary">Подробнее о производстве</a>
    </div>
  </div>
</section>`;
}

// Отзывы: реальные тексты добавляются по мере поступления (замените заглушки).
// Поля: author, source (платформа), text, date, rating (1-5).
const REVIEWS = [
  {
    author: "Анастасия К.",
    source: "Авито",
    rating: 5,
    date: "Август 2026",
    text: "Заказывала шкатулку-грибочек в подарок подруге. Качество отличное — швов нет, резьба работает плавно. Упаковала прямо в неё маленький подарочек, смотрится мило. Доставка быстрая, продавец на связи.",
  },
  {
    author: "Дмитрий В.",
    source: "Telegram",
    rating: 5,
    date: "Июль 2026",
    text: "Заказывал нестандартную деталь — напечатали точно по размерам за 2 дня. Пластик прочный, не гнётся. Буду обращаться ещё, уже присматриваю что-то из декора.",
  },
  {
    author: "Мария Л.",
    source: "Авито",
    rating: 5,
    date: "Сентябрь 2026",
    text: "Взяла тыкву и кашпо-тыкву для осенней фотозоны. Выглядят атмосферно! Цвет насыщенный. Компактные, но заметные. Продавец ответил на все вопросы быстро.",
  },
];

function starsHTML(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="review-star${i < n ? " filled" : ""}" aria-hidden="true">★</span>`
  ).join("");
}

function reviewsSection() {
  const cards = REVIEWS.map(
    (r) => `<div class="review-card">
      <div class="review-header">
        <div class="review-stars" aria-label="Оценка ${r.rating} из 5">${starsHTML(r.rating)}</div>
        <span class="review-source">${r.source}</span>
      </div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-footer">
        <span class="review-author">${r.author}</span>
        <span class="review-date">${r.date}</span>
      </div>
    </div>`
  ).join("\n      ");
  return `<section class="section">
  <div class="container">
    <div class="section-head reviews-section-head">
      <span class="kicker">Отзывы покупателей</span>
      <h2>Что говорят<br><span>клиенты</span></h2>
      <p class="reviews-section-lede">Реальные впечатления о готовых изделиях и печати на заказ.</p>
    </div>
    <div class="reviews-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

function homePage() {
  const products = loadProducts();
  const posts = loadPosts();

  const body = `<section class="hero">
  <div class="hero-visual">
    <canvas id="hero-canvas" aria-hidden="true"></canvas>
  </div>
  <div class="container hero-content">
    <span class="kicker">Магазин 3D-печатных товаров</span>
    <h1>Необычные вещи,<br>созданные на 3D-принтере</h1>
    <p class="lede">Готовые 3D-товары, подарки, полезные аксессуары и изделия на заказ.</p>
    <div class="hero-actions">
      <a href="/catalog" class="btn btn-primary">Смотреть каталог</a>
      <a href="/custom-order" class="btn btn-ghost">Создать свою вещь</a>
    </div>
  </div>
</section>

${trustStatsSection()}

${popularSection(products)}

${reviewsSection()}

${categoriesSection()}

<section class="section print-layers">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Процесс</span>
      <h2>Как это работает</h2>
    </div>
    <div class="steps">
      <svg class="steps-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 16.6 50 L 83.3 50" />
        <circle cx="16.6" cy="50" r="2.6" />
        <circle cx="50" cy="50" r="2.6" />
        <circle cx="83.3" cy="50" r="2.6" />
      </svg>
      <div class="step">
        <div class="step-num mono">01</div>
        <h3>Выбираешь модель</h3>
        <p>В каталоге — готовые изделия с ценой и характеристиками, или форма кастомного заказа под свою идею.</p>
      </div>
      <div class="step">
        <div class="step-num mono">02</div>
        <h3>Оформляешь заказ</h3>
        <p>Кладёшь товар в корзину и подтверждаешь заказ в Telegram — так мы точно не потеряем детали.</p>
      </div>
      <div class="step">
        <div class="step-num mono">03</div>
        <h3>Получаешь изделие</h3>
        <p>Печать занимает ${LEAD_TIME}. Готовое — забираешь сам в ${CITY_PREP} или получаешь посылкой.</p>
      </div>
    </div>
  </div>
</section>

${printerTeaserSection()}

${whyUsSection()}

<section class="section">
  <div class="container">
    ${customOrderTeaser()}
  </div>
</section>

${blogPreviewSection(posts)}

${faqSection()}`;

  const extraScripts = `<script type="application/ld+json">${JSON.stringify(faqSchema())}</script>
<script type="module" src="/js/three-hero.js?v=4"></script>
<script defer src="/js/hero-text-reveal.js?v=3"></script>
<script defer src="/js/product-tilt.js?v=2"></script>`;

  return renderLayout({
    title: "PRINTLAB — необычные вещи, созданные на 3D-принтере",
    description: "Готовые 3D-печатные товары, подарки и полезные аксессуары. Изготовление на заказ по фото, эскизу или модели. Самовывоз в Брянске, доставка по России.",
    canonical: "/",
    activeNav: "/",
    bodyContent: body,
    extraScripts,
  });
}

function render(distDir) {
  fs.writeFileSync(path.join(distDir, "index.html"), homePage());
  console.log("  ✓ index.html");
}

module.exports = { render };
