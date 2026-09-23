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

function categoriesSection(products) {
  const usedCategories = new Set();
  products.forEach((p) => {
    (p.categories || [p.category]).forEach((c) => usedCategories.add(c));
    if (p.featured) usedCategories.add("__featured__");
  });
  const visibleTiles = CATEGORY_TILES.filter((t) => {
    if (t.kind === "custom") return true;
    if (t.kind === "featured") return usedCategories.has("__featured__");
    return usedCategories.has(t.key);
  });
  const slideHtml = visibleTiles.map((t, i) =>
    `<a href="${categoryHref(t)}" class="cat-slide${i === 0 ? " active" : ""}" data-index="${i}">
        <div class="cat-slide-img">
          <picture>
            <source srcset="/images/categories/${t.img}.webp" type="image/webp">
            <img src="/images/categories/${t.img}.jpg" alt="${t.label}" loading="lazy">
          </picture>
        </div>
      </a>`
  ).join("\n      ");
  const dotsHtml = visibleTiles.map((_, i) =>
    `<button class="cat-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Категория ${i + 1}"></button>`
  ).join("");
  return `<section class="section cat-carousel-section">
  <div class="container">
    <div class="section-head"><span class="kicker">Каталог</span><h2>Категории</h2></div>
  </div>
  <div class="cat-carousel-wrap">
    <div class="cat-carousel" id="catCarousel">
      ${slideHtml}
    </div>
    <button class="cat-arrow cat-arrow--prev" id="catPrev" aria-label="Назад">&#8249;</button>
    <button class="cat-arrow cat-arrow--next" id="catNext" aria-label="Вперёд">&#8250;</button>
  </div>
  <div class="cat-dots" id="catDots">${dotsHtml}</div>
  <script>(function(){
    var el=document.getElementById('catCarousel'),sl=el?el.querySelectorAll('.cat-slide'):[],ds=document.querySelectorAll('#catDots .cat-dot'),cur=0;
    if(!sl.length)return;
    function go(n){
      ['active','prev-slide','next-slide'].forEach(function(c){sl[cur].classList.remove(c);});
      ds[cur]&&ds[cur].classList.remove('active');
      sl[(cur-1+sl.length)%sl.length].classList.remove('prev-slide');
      sl[(cur+1)%sl.length].classList.remove('next-slide');
      cur=(n+sl.length)%sl.length;
      sl[cur].classList.add('active');
      sl[(cur-1+sl.length)%sl.length].classList.add('prev-slide');
      sl[(cur+1)%sl.length].classList.add('next-slide');
      ds[cur]&&ds[cur].classList.add('active');
      sl[cur].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    }
    sl[sl.length-1].classList.add('prev-slide');
    if(sl.length>1)sl[1].classList.add('next-slide');
    var pp=document.getElementById('catPrev'),np=document.getElementById('catNext');
    pp&&pp.addEventListener('click',function(e){e.preventDefault();go(cur-1);});
    np&&np.addEventListener('click',function(e){e.preventDefault();go(cur+1);});
    ds.forEach(function(d){d.addEventListener('click',function(){go(+d.dataset.index);});});
    var sx=0;
    el.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
    el.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(dx<0?cur+1:cur-1);});
  })();<\/script>
</section>`;
}

function trustStatsSection() {
  const items = TRUST_STATS.map(
    (s) => `<div class="trust-stat">
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
    (w) => `<div class="review-card why-us-card">
      <div class="review-header">
        <span class="review-source">3Д Вещь</span>
      </div>
      <p class="review-text">${w.title}</p>
      <div class="review-footer">
        <span class="review-author">${w.text}</span>
      </div>
    </div>`
  ).join("\n      ");
  return `<section class="section print-layers">
  <div class="container">
    <div class="section-head"><span class="kicker">Почему мы</span><h2>Почему <span>3Д Вещь?</span></h2></div>
    <div class="reviews-grid why-us-grid">
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
    (f, i) => `<details class="faq-item">
        <summary>
          <span class="faq-num mono">${String(i + 1).padStart(2, "0")}</span>
          <span class="faq-question">${f.q}</span>
          <span class="faq-plus" aria-hidden="true"></span>
        </summary>
        <div class="faq-answer"><p>${f.a}</p></div>
      </details>`
  ).join("\n      ");

  return `<section class="section faq-section">
  <div class="container faq-layout">
    <div class="faq-intro">
      <span class="kicker">Вопросы и ответы</span>
      <h2>Перед заказом<br><span>важно знать.</span></h2>
      <p>Ответы на главные вопросы о сроках, цветах, индивидуальной печати и доставке.</p>
      <a href="${TELEGRAM_BOT_URL}" class="faq-contact">
        <span class="faq-contact-icon">↗</span>
        <span><strong>Написать в Telegram</strong><small>Ответим и поможем с заказом</small></span>
      </a>
    </div>
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
      <h2>Читаем перед <span>печатью</span></h2>
    </div>
    <div class="blog-grid blog-review-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

function printerTeaserSection() {
  return `<section class="section">
  <div class="container printer-teaser-grid review-card printer-equipment-card">
    <img src="/images/printlab-equipment-800.webp"
      srcset="/images/printlab-equipment-480.webp 480w, /images/printlab-equipment-800.webp 800w, /images/printlab-equipment-1200.webp 1200w"
      sizes="(max-width: 767px) 90vw, 600px"
      alt="Наше оборудование для 3D-печати" class="printer-teaser-photo" loading="lazy">
    <div class="printer-teaser-content">
      <span class="kicker">Наше оборудование</span>
      <h2>Печатаем на современном <span>3D-принтере</span></h2>
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
  {
    author: "Наталия С.",
    source: "Telegram",
    rating: 5,
    date: "Сентябрь 2026",
    text: "Заказывала небольшую фигурку в подарок. Напечатали аккуратно, всё совпало с описанием. Получилось красиво и необычно — подарок понравился.",
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

${categoriesSection(products)}

<section class="section print-layers">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Процесс</span>
      <h2>Как это <span>работает</span></h2>
    </div>
    <div class="steps">
      <svg class="steps-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 16.6 50 L 83.3 50" />
        <circle cx="16.6" cy="50" r="2.6" />
        <circle cx="50" cy="50" r="2.6" />
        <circle cx="83.3" cy="50" r="2.6" />
      </svg>
      <div class="step review-card">
        <div class="step-num mono">01</div>
        <h3>Выбираешь модель</h3>
        <p>В каталоге — готовые изделия с ценой и характеристиками, или форма кастомного заказа под свою идею.</p>
      </div>
      <div class="step review-card">
        <div class="step-num mono">02</div>
        <h3>Оформляешь заказ</h3>
        <p>Кладёшь товар в корзину и подтверждаешь заказ в Telegram — так мы точно не потеряем детали.</p>
      </div>
      <div class="step review-card">
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
    <div class="review-card custom-order-review-card">${customOrderTeaser()}</div>
  </div>
</section>

${blogPreviewSection(posts)}

${faqSection()}`;

  const extraScripts = `<script type="application/ld+json">${JSON.stringify(faqSchema())}</script>
<script type="module" src="/js/three-hero.js?v=4"></script>
<script defer src="/js/hero-text-reveal.js?v=3"></script>
<script defer src="/js/product-tilt.js?v=2"></script>`;

  return renderLayout({
    title: "3Д Вещь — напечатаем что угодно",
    description: "3Д Вещь — напечатаем что угодно. Готовые 3D-товары, подарки и изделия на заказ по фото, эскизу или модели. Самовывоз в Брянске, доставка по России.",
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
