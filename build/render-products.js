const fs = require("fs");
const path = require("path");
const { renderLayout } = require("./layout");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_JSON = path.join(ROOT, "content", "products.json");

function loadProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));
}

function fmtPrice(p) {
  return `${p.toLocaleString("ru-RU")} ₽`;
}

function productCard(p) {
  const priceFrom = p.variants && p.variants.some((v) => v.extra > 0);
  return `<a href="/catalog/${p.slug}" class="product-card">
        <div class="product-card-media"><span class="placeholder-label mono">[ рендер / .glb ]</span></div>
        <div class="product-card-body">
          <div class="product-card-title">${p.title}</div>
          <div class="product-card-price mono">${priceFrom ? "от " : ""}${fmtPrice(p.price)}</div>
        </div>
      </a>`;
}

function productSpecsRows(specs) {
  return Object.entries(specs)
    .map(([k, v]) => `<div class="spec-row"><span class="spec-label">${specLabel(k)}</span><span class="spec-value mono">${v}</span></div>`)
    .join("\n");
}

function specLabel(key) {
  const labels = { material: "Материал", size: "Размер", weight: "Вес" };
  return labels[key] || key;
}

function catalogPage(products, categories) {
  const filterButtons = ['<button class="filter-btn active" data-filter="all">Все</button>']
    .concat(categories.map((c) => `<button class="filter-btn" data-filter="${c}">${c}</button>`))
    .join("\n      ");

  const cards = products
    .map(
      (p) => `<a href="/catalog/${p.slug}" class="product-card catalog-item" data-category="${p.category}">
        <div class="product-card-media"><span class="placeholder-label mono">[ рендер / .glb ]</span></div>
        <div class="product-card-body">
          <div class="product-card-title">${p.title}</div>
          <div class="product-card-price mono">${fmtPrice(p.price)}</div>
        </div>
      </a>`
    )
    .join("\n      ");

  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Каталог</span>
    <h1>Все товары</h1>
    <p class="lede">${products.length} готовых изделий — печатаются под заказ на нашем Bambu Lab P2S Combo.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="catalog-filters">
      ${filterButtons}
    </div>
    <div class="product-grid catalog-grid" id="catalogGrid">
      ${cards}
    </div>
    <p class="catalog-empty" id="catalogEmpty" style="display:none;">В этой категории пока нет товаров.</p>
  </div>
</section>`;

  const script = `<script>
(function(){
  var buttons = document.querySelectorAll('.filter-btn');
  var items = document.querySelectorAll('.catalog-item');
  var empty = document.getElementById('catalogEmpty');
  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      buttons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      var visible = 0;
      items.forEach(function(item){
        var show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      empty.style.display = visible === 0 ? 'block' : 'none';
    });
  });
})();
</script>`;

  return renderLayout({
    title: "Каталог товаров — PRINTLAB",
    description: `Каталог 3D-печатных изделий: ${categories.join(", ").toLowerCase()}. Печатаем на заказ, самовывоз в Брянске или доставка через Авито.`,
    canonical: "/catalog",
    activeNav: "/catalog",
    bodyContent: body,
    extraScripts: script,
  });
}

function productPage(p, allProducts) {
  const variantsBlock = p.variants && p.variants.length
    ? `<div class="product-variants">
        <div class="product-variants-label">Варианты:</div>
        ${p.variants.map((v) => `<div class="variant-row"><span>${v.name}</span><span class="mono">${v.extra > 0 ? "+" + v.extra + " ₽" : "включено"}</span></div>`).join("\n        ")}
      </div>`
    : "";

  const availability = p.stock > 0
    ? `<div class="availability in-stock">✅ В наличии: ${p.stock} шт.</div>`
    : `<div class="availability">🕐 Под заказ (3-5 дней)</div>`;

  const similar = allProducts
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .slice(0, 4);

  const similarBlock = similar.length
    ? `<section class="section">
  <div class="container">
    <div class="section-head"><span class="kicker">Похожее</span><h2>Из категории «${p.category}»</h2></div>
    <div class="product-grid">
      ${similar.map(productCard).join("\n      ")}
    </div>
  </div>
</section>`
    : "";

  const body = `<section class="section product-detail">
  <div class="container product-detail-grid">
    <div class="product-gallery">
      <div class="product-gallery-main"><span class="placeholder-label mono">[ галерея / .glb ]</span></div>
    </div>
    <div class="product-info">
      <span class="kicker">${p.category}</span>
      <h1>${p.title}</h1>
      <div class="product-price mono">${p.price.toLocaleString("ru-RU")} ₽</div>
      ${availability}
      <p class="product-description">${p.description}</p>
      ${variantsBlock}
      <div class="product-specs">
        ${productSpecsRows(p.specs)}
      </div>
      <div class="product-actions">
        <button class="btn btn-primary">В корзину</button>
        <button class="btn btn-ghost">Купить сейчас</button>
      </div>
      <a href="https://t.me/Shop3D_online_bot" class="product-telegram-link" target="_blank" rel="noopener">Открыть в Telegram-боте →</a>
    </div>
  </div>
</section>
${similarBlock}`;

  return renderLayout({
    title: `${p.title} — ${p.price.toLocaleString("ru-RU")} ₽ | PRINTLAB`,
    description: p.description,
    canonical: `/catalog/${p.slug}`,
    activeNav: "/catalog",
    bodyContent: body,
  });
}

function render(distDir) {
  const products = loadProducts();
  const categories = [...new Set(products.map((p) => p.category))];

  const catalogDir = path.join(distDir, "catalog");
  fs.mkdirSync(catalogDir, { recursive: true });

  fs.writeFileSync(path.join(distDir, "catalog.html"), catalogPage(products, categories));
  for (const p of products) {
    fs.writeFileSync(path.join(catalogDir, `${p.slug}.html`), productPage(p, products));
  }

  console.log(`  ✓ catalog.html + ${products.length} страниц товаров`);
  return { products, categories, productCard, fmtPrice };
}

module.exports = { render, loadProducts, productCard, fmtPrice };
