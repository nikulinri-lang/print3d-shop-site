const fs = require("fs");
const path = require("path");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");
const { CATEGORY_TILES, LEAD_TIME } = require("./constants");
const { productArt, primaryIcon } = require("./placeholder-art");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_JSON = path.join(ROOT, "content", "products.json");
const SITE_URL = "https://3-d-shop.ru";

function loadProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));
}

function fmtPrice(p) {
  return `${p.toLocaleString("ru-RU")} ₽`;
}

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Только реальные статусы — ничего не выдумываем (нет "рейтингов",
// "хитов продаж" и т.п., только то, что действительно есть в данных).
function badgesOf(p) {
  const list = [];
  if (p.featured) list.push({ label: "Популярное", cls: "badge-hot" });
  if (p.categories && p.categories.includes("Подарки")) list.push({ label: "Подарок", cls: "badge-gift" });
  if (p.stock === 0) list.push({ label: "Под заказ", cls: "badge-order" });
  return list.slice(0, 2);
}

function badgesHTML(p) {
  const b = badgesOf(p);
  if (!b.length) return "";
  return `<div class="product-card-badges">${b.map((x) => `<span class="product-badge ${x.cls}">${x.label}</span>`).join("")}</div>`;
}

function cartProductPayload(p) {
  return JSON.stringify({ slug: p.slug, title: p.title, price: p.price, icon: primaryIcon(p) });
}

function searchText(p) {
  return [p.title, p.shortDesc, p.description, ...(p.categories || [])].join(" ").toLowerCase();
}

function productCard(p, opts = {}) {
  const dataAttrs = opts.withFilterData
    ? ` data-categories="${(p.categories || []).join("|")}" data-featured="${p.featured ? 1 : 0}" data-price="${p.price}" data-colors="${(p.colors || []).map((c) => c.hex).join("|")}" data-index="${opts.index}" data-search="${escAttr(searchText(p))}"`
    : "";
  const itemClass = opts.withFilterData ? "product-card catalog-item" : "product-card";
  return `<a href="/catalog/${p.slug}" class="${itemClass}"${dataAttrs}>
        ${productArt(p)}
        ${badgesHTML(p)}
        <div class="product-card-body">
          <div class="product-card-title">${p.title}</div>
          <div class="product-card-desc">${p.shortDesc}</div>
          <div class="product-card-bottom">
            <div class="product-card-price mono">${fmtPrice(p.price)}</div>
            <button type="button" class="btn-cart-add" data-add-to-cart data-product="${escAttr(cartProductPayload(p))}" aria-label="В корзину: ${escAttr(p.title)}">
              <span class="add-label">В корзину</span>
            </button>
          </div>
        </div>
      </a>`;
}


// 4 раздела описания товара: короткий хук, материал/качество печати,
// Секции описания товара: иконка, заголовок, ключ в descriptionSections.
// Разделы выглядят как карточки с иконкой и заголовком — без синей полосы.
const SECTION_META = [
  { key: "whatIsIt",    icon: "✦", title: "Что это такое" },
  { key: "material",   icon: "◈", title: "Материал и печать" },
  { key: "whoFor",     icon: "◎", title: "Кому подойдёт" },
];

function descriptionSectionsHTML(p) {
  if (!p.descriptionSections) {
    return `<p class="product-description">${p.description}</p>`;
  }
  const blocks = SECTION_META.map(({ key, icon, title }) => {
    const value = p.descriptionSections[key];
    if (!value) return "";
    const content = Array.isArray(value)
      ? `<ul class="product-desc-list">${value.map((li) => `<li>${li}</li>`).join("")}</ul>`
      : `<p>${value}</p>`;
    return `<div class="product-desc-section" data-anim-section>
        <div class="product-desc-section-head">
          <span class="product-desc-icon" aria-hidden="true">${icon}</span>
          <span class="product-desc-title">${title}</span>
        </div>
        <div class="product-desc-section-body">${content}</div>
      </div>`;
  }).filter(Boolean).join("\n      ");
  return `<div class="product-description-sections" data-anim-sections>
      ${blocks}
    </div>`;
}

function customOrderTeaser() {
  return `<div class="custom-order-teaser">
    <div>
      <span class="kicker">Не нашли нужную вещь?</span>
      <h3>Изготовим изделие специально для вас</h3>
      <p>По фотографии, размерам, эскизу или готовой 3D-модели.</p>
    </div>
    <a href="/custom-order" class="btn btn-primary">Заказать своё изделие</a>
  </div>`;
}

function catalogPage(products, categories, colorNames) {
  // Собираем категории, в которых есть хотя бы один товар
  const usedCategories = new Set();
  products.forEach((p) => {
    (p.categories || [p.category]).forEach((c) => usedCategories.add(c));
    if (p.featured) usedCategories.add("__featured__");
  });

  const tileButtons = CATEGORY_TILES
    .filter((t) => {
      if (t.kind === "custom") return false; // «На заказ» — отдельная ссылка
      if (t.kind === "featured") return usedCategories.has("__featured__");
      return usedCategories.has(t.key);
    })
    .map((t) => `<button class="filter-btn" data-filter-category="${t.kind === "featured" ? "__featured__" : t.key}">${t.icon} ${t.label}</button>`)
    .join("\n      ");

  const colorOptions = colorNames.map((c) => `<option value="${c.hex}">${c.name}</option>`).join("");

  const cards = products.map((p, i) => productCard(p, { withFilterData: true, index: i })).join("\n      ");

  const body = `<section class="page-hero premium-page-hero premium-page-hero--catalog">
  <div class="container">
    <div class="premium-page-hero-grid">
      <div class="premium-page-hero-copy">
        <span class="kicker">Каталог / PRINTLAB</span>
        <h1>Вещи, которые <span>хочется оставить.</span></h1>
        <p class="lede">${products.length} готовых изделий — печатаем на Bambu Lab P2S Combo. Выбирайте готовое или запускайте собственный проект.</p>
        <div class="premium-page-hero-actions">
          <a href="#catalogGrid" class="btn btn-primary">Смотреть изделия →</a>
          <a href="/custom-order" class="btn btn-ghost">Нужна своя вещь</a>
        </div>
      </div>
      <div class="premium-hero-panel">
        <div class="premium-hero-panel-top"><span>CATALOG / 2026</span><span>ONLINE</span></div>
        <div class="premium-hero-stat-main"><strong>${products.length}</strong><span>готовых<br>изделий</span></div>
        <div class="premium-hero-stat-grid">
          <div><b>01</b><span>печатаем<br>под заказ</span></div>
          <div><b>02</b><span>выбор<br>цвета</span></div>
          <div><b>03</b><span>Брянск +<br>Россия</span></div>
          <div><b>04</b><span>свой<br>проект</span></div>
        </div>
        <div class="premium-hero-scan"><span></span><span></span><span></span><em>SELECT / PRINT / RECEIVE</em></div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="catalog-toolbar">
      <input type="search" id="catalogSearch" class="catalog-search" placeholder="Поиск по каталогу…" aria-label="Поиск по каталогу">
      <select id="catalogPrice" class="catalog-select" aria-label="Фильтр по цене">
        <option value="all">Цена: любая</option>
        <option value="0-500">до 500 ₽</option>
        <option value="500-1000">500–1000 ₽</option>
        <option value="1000-99999">от 1000 ₽</option>
      </select>
      ${colorNames.length ? `<select id="catalogColor" class="catalog-select" aria-label="Фильтр по цвету">
        <option value="all">Цвет: любой</option>
        ${colorOptions}
      </select>` : ""}
      <select id="catalogSort" class="catalog-select" aria-label="Сортировка">
        <option value="popular">Сначала популярные</option>
        <option value="price-asc">Сначала дешёвые</option>
        <option value="price-desc">Сначала дорогие</option>
        <option value="new">Сначала новые</option>
      </select>
    </div>
    <div class="catalog-filters" id="catalogCategoryFilters">
      <button class="filter-btn active" data-filter-category="all">Все</button>
      ${tileButtons}
    </div>
    <p class="catalog-count" id="catalogCount"></p>
    <div class="product-grid catalog-grid" id="catalogGrid">
      ${cards}
    </div>
    <p class="catalog-empty" id="catalogEmpty" style="display:none;">Ничего не нашлось — попробуйте изменить фильтры или <a href="/custom-order">закажите изделие под себя</a>.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    ${customOrderTeaser()}
  </div>
</section>`;

  return renderLayout({
    title: "Каталог 3D-печатных товаров — 3Д Вещь",
    description: `Каталог готовых 3D-печатных изделий: ${categories.join(", ").toLowerCase()}. Поиск, фильтры по цене и цвету, изготовление ${LEAD_TIME}.`,
    canonical: "/catalog",
    activeNav: "/catalog",
    bodyContent: body,
    extraScripts: `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema([["Главная", "/"], ["Каталог", "/catalog"]]))}</script>\n<script defer src="/js/catalog-filters.js?v=2"></script>\n<script defer src="/js/product-tilt.js?v=2"></script>`,
  });
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: SITE_URL + url,
    })),
  };
}

function productSchema(p) {
  // Поля image/gid/gtin не указываем — у товаров пока нет настоящих фото
  // (только сгенерированные SVG-превью категории), а придумывать URL
  // несуществующей фотографии хуже для доверия к разметке, чем пропустить
  // необязательное поле.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    category: (p.categories || [])[0] || "",
    material: p.specs && p.specs.material ? p.specs.material : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: String(p.price),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${SITE_URL}/catalog/${p.slug}`,
    },
  };
}

// Для части каталога цвет — это и есть весь вариант (напр. "Красный" /
// "Чёрный" совпадают с названиями p.variants один в один). Показывать в
// этом случае отдельно и свотчи, и радио-варианты — значит дать выбрать
// два несинхронизированных значения одновременно (человек кликает
// "Чёрный" свотч, а в корзину улетает выбранный по умолчанию "Красный"
// вариант). Поэтому свотч сам несёт data-extra и выбор цвета = выбор
// варианта; отдельный блок .product-variants в этом случае не рендерим.
function variantsAreColors(p) {
  if (!p.colors || !p.colors.length || !p.variants || !p.variants.length) return false;
  if (p.colors.length !== p.variants.length) return false;
  // "includes", не строгое равенство: у части товаров название варианта —
  // "Красный PLA" (цвет + материал в одной строке), а не голое "Красный".
  return p.colors.every((c) => p.variants.some((v) => v.name.includes(c.name)));
}

function matchingVariant(p, colorName) {
  return p.variants.find((v) => v.name.includes(colorName));
}

function colorSwatches(p) {
  if (!p.colors || !p.colors.length) return "";
  const merged = variantsAreColors(p);
  return `<div class="product-colors">
        <div class="product-colors-label">Цвет:</div>
        <div class="color-swatches" role="radiogroup" aria-label="Выбор цвета">
          ${p.colors
            .map((c, i) => {
              const variant = merged ? matchingVariant(p, c.name) : null;
              const extraAttr = variant ? ` data-extra="${variant.extra}"` : "";
              return `<button type="button" class="color-swatch${i === 0 ? " selected" : ""}" style="--swatch-color:${c.hex}" data-color-name="${escAttr(c.name)}"${extraAttr} role="radio" aria-checked="${i === 0}" aria-label="${escAttr(c.name)}" title="${escAttr(c.name)}"></button>`;
            })
            .join("")}
        </div>
        <div class="product-colors-selected" id="selectedColorName">${p.colors[0].name}</div>
      </div>`;
}

function productPage(p, allProducts) {
  const variantsBlock = false
    ? `<div class="product-variants" id="productVariants">
        <div class="product-variants-label">Вариант:</div>
        ${p.variants.map((v, i) => `<label class="variant-row"><input type="radio" name="variant" value="${escAttr(v.name)}" data-extra="${v.extra}"${i === 0 ? " checked" : ""}><span>${v.name}</span><span class="mono">${v.extra > 0 ? "+" + v.extra + " ₽" : "включено"}</span></label>`).join("\n        ")}
      </div>`
    : "";

  const availability = p.stock > 0
    ? `<div class="availability in-stock">✅ В наличии: ${p.stock} шт.</div>`
    : `<div class="availability">🕐 Под заказ — печатаем после оформления</div>`;

  const similar = allProducts
    .filter((x) => x.slug !== p.slug && (x.categories || []).some((c) => (p.categories || []).includes(c)))
    .slice(0, 4);

  const similarBlock = similar.length
    ? `<section class="section">
  <div class="container">
    <div class="section-head"><span class="kicker">Похожее</span><h2>Из категории «${(p.categories || [])[0] || ""}»</h2></div>
    <div class="product-grid">
      ${similar.map((x) => productCard(x)).join("\n      ")}
    </div>
  </div>
</section>`
    : "";

  const breadcrumbs = `<nav class="breadcrumbs" aria-label="Хлебные крошки">
    <a href="/">Главная</a> <span>/</span> <a href="/catalog">Каталог</a> <span>/</span> <span aria-current="page">${p.title}</span>
  </nav>`;

  const body = `<section class="section product-detail product-detail--premium">
  <div class="container">
    <div class="product-page-topline"><span>PRINTLAB / PRODUCT</span><span>01 — 05</span></div>
    ${breadcrumbs}
  <div class="product-detail-grid">
    <div class="product-gallery">
      ${productArt(p, "gallery")}
    </div>
    <div class="product-info">
      <span class="kicker">${(p.categories || [])[0] || ""}</span>
      <h1>${p.title}</h1>
      ${badgesHTML(p)}
      <p class="product-shortdesc">${p.shortDesc}</p>
      <div class="product-price mono" id="productPrice">${p.price.toLocaleString("ru-RU")} ₽</div>
      ${availability}
      ${descriptionSectionsHTML(p)}
      ${colorSwatches(p)}
      ${variantsBlock}
      <div class="qty-stepper" aria-label="Количество">
        <button type="button" class="qty-btn" id="qtyMinus" aria-label="Уменьшить количество">−</button>
        <input type="text" id="qtyValue" class="qty-value" value="1" inputmode="numeric" aria-label="Количество">
        <button type="button" class="qty-btn" id="qtyPlus" aria-label="Увеличить количество">+</button>
      </div>
      <div class="product-actions">
        <button type="button" class="btn btn-primary" id="addToCartBtn">В корзину</button>
        <button type="button" class="btn btn-ghost" id="buyNowBtn">Купить сейчас</button>
      </div>
      <div class="product-trust-row">
        <span><b class="trust-index mono">01</b> Изготовление: ${LEAD_TIME}</span>
        <span><b class="trust-index mono">02</b> Доставка по России</span>
        ${p.colors && p.colors.length ? "<span><b class="trust-index mono">03</b> Можно выбрать цвет</span>" : ""}
        <span><b class="trust-index mono">04</b> Оплата после подтверждения заказа менеджером</span>
        <span><b class="trust-index mono">05</b> <a href="/delivery#vozvrat">Возврат и обмен</a></span>
      </div>
      <a href="${TELEGRAM_BOT_URL}" class="product-telegram-link" target="_blank" rel="noopener">Есть вопрос? Написать в Telegram →</a>
    </div>
  </div>
  </div>
</section>
<div class="sticky-buy-bar" id="stickyBuyBar" aria-hidden="true">
  <div class="sticky-buy-bar-info">
    <span class="sticky-buy-bar-title">${p.title}</span>
    <span class="sticky-buy-bar-price mono" id="stickyPrice">${p.price.toLocaleString("ru-RU")} ₽</span>
  </div>
  <button type="button" class="btn btn-primary" id="stickyAddToCartBtn">В корзину</button>
</div>
${similarBlock}
<section class="section">
  <div class="container">
    ${customOrderTeaser()}
  </div>
</section>`;

  const productData = { slug: p.slug, title: p.title, price: p.price, icon: primaryIcon(p) };

  const script = `<script type="application/ld+json">${JSON.stringify(productSchema(p))}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema([["Главная", "/"], ["Каталог", "/catalog"], [p.title, `/catalog/${p.slug}`]]))}</script>
<script>
window.__PRODUCT__ = ${JSON.stringify(productData)};
</script>
<script defer src="/js/product-page.js?v=6"></script>
<script defer src="/js/product-tilt.js?v=2"></script>`;

  return renderLayout({
    title: `${p.title} — купить за ${p.price.toLocaleString("ru-RU")} ₽ | PRINTLAB`,
    description: `${p.shortDesc}. ${p.description}`.slice(0, 300),
    canonical: `/catalog/${p.slug}`,
    activeNav: "/catalog",
    bodyContent: body,
    extraScripts: script,
  });
}

function render(distDir) {
  const products = loadProducts();
  const categories = [...new Set(products.flatMap((p) => p.categories || []))];
  // Один и тот же цвет у разных товаров может называться по-разному из-за
  // согласования рода прилагательного с товаром ("Чёрный" крючок / "Чёрная"
  // подставка) — для фильтра группируем по hex (первое встреченное имя
  // становится подписью пункта), на странице товара остаётся своё,
  // грамматически верное имя.
  const colorByHex = new Map();
  for (const p of products) {
    for (const c of p.colors || []) {
      if (!colorByHex.has(c.hex)) colorByHex.set(c.hex, c.name);
    }
  }
  const colorNames = [...colorByHex.entries()].map(([hex, name]) => ({ hex, name }));

  const catalogDir = path.join(distDir, "catalog");
  fs.mkdirSync(catalogDir, { recursive: true });

  // index.html внутри catalog/ (а не соседний catalog.html) — иначе имя
  // файла конфликтует с директорией catalog/, где лежат страницы товаров
  // (Apache отдаёт 403 при запросе /catalog, т.к. .htaccess не может
  // одновременно rewrite'ить extensionless-путь и в файл, и открыть
  // одноимённую директорию).
  fs.writeFileSync(path.join(catalogDir, "index.html"), catalogPage(products, categories, colorNames));
  for (const p of products) {
    fs.writeFileSync(path.join(catalogDir, `${p.slug}.html`), productPage(p, products));
  }

  console.log(`  ✓ catalog/index.html + ${products.length} страниц товаров`);
  return { products, categories, productCard, fmtPrice };
}

module.exports = { render, loadProducts, productCard, fmtPrice, customOrderTeaser, breadcrumbSchema };
