/* Нейтральные сгенерированные превью товаров. Для товаров с полем images
 * показываем реальные фотографии из public/images; для остальных остаётся
 * честная SVG-заглушка категории. */

const CATEGORY_ICON = {
  "Антистресс": "🧩",
  "Для дома": "🏠",
  "Для телефона": "📱",
  "Игры и хобби": "🎮",
  "Полезные детали": "⚙️",
  "Подарки": "🎁",
  "Прикольные штуки": "😂",
};

function primaryIcon(product) {
  const cat = (product.categories && product.categories[0]) || product.category;
  return CATEGORY_ICON[cat] || "🖨️";
}

const ICON_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

const CATEGORY_ICON_SVG = {
  "Антистресс": '<circle cx="12" cy="7" r="2.4"/><circle cx="7" cy="16" r="2.4"/><circle cx="17" cy="16" r="2.4"/><line x1="12" y1="9.4" x2="7" y2="13.6"/><line x1="12" y1="9.4" x2="17" y2="13.6"/><line x1="9.4" y1="16" x2="14.6" y2="16"/>',
  "Для дома": '<polyline points="4,11 12,4 20,11"/><rect x="6" y="11" width="12" height="9"/><rect x="10" y="15" width="4" height="5"/>',
  "Для телефона": '<rect x="8" y="2" width="8" height="20" rx="2"/><line x1="10.5" y1="18" x2="13.5" y2="18"/>',
  "Игры и хобби": '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  "Полезные детали": '<circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6.5"/><line x1="12" y1="17.5" x2="12" y2="21"/><line x1="3" y1="12" x2="6.5" y2="12"/><line x1="17.5" y1="12" x2="21" y2="12"/><line x1="5.6" y1="5.6" x2="8" y2="8"/><line x1="16" y1="16" x2="18.4" y2="18.4"/><line x1="18.4" y1="5.6" x2="16" y2="8"/><line x1="8" y1="16" x2="5.6" y2="18.4"/>',
  "Подарки": '<rect x="4" y="9" width="16" height="11" rx="1"/><line x1="4" y1="13" x2="20" y2="13"/><line x1="12" y1="9" x2="12" y2="20"/><rect x="4" y="5" width="16" height="4" rx="1"/><line x1="12" y1="5" x2="12" y2="9"/>',
  "Прикольные штуки": '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/>',
};

const DEFAULT_ICON_SVG = '<rect x="4" y="8" width="16" height="8" rx="1"/><rect x="7" y="4" width="10" height="4"/><rect x="7" y="16" width="10" height="4"/>';

function primaryIconSvg(product) {
  const cat = (product.categories && product.categories[0]) || product.category;
  return CATEGORY_ICON_SVG[cat] || DEFAULT_ICON_SVG;
}

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// size: "card" (каталог/похожее) | "gallery" (страница товара, крупнее)
function productArt(product, size = "card") {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const cls = size === "gallery" ? "product-art product-art--lg" : "product-art";

  if (images.length) {
    if (size === "gallery" && images.length > 1) {
      return `<div class="${cls}" style="display:grid;grid-template-columns:repeat(${Math.min(images.length, 2)},minmax(0,1fr));gap:10px;overflow:hidden;">
        ${images.slice(0, 2).map((src, i) => `<img src="${escAttr(src)}" alt="${escAttr(product.title)} — фото ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}" style="width:100%;height:100%;min-height:260px;object-fit:contain;display:block;border-radius:inherit;" />`).join("")}
      </div>`;
    }

    const cardImageStyle = size === "card"
      ? "width:100%;height:100%;object-fit:cover;object-position:center;display:block;border-radius:inherit;"
      : "width:100%;height:100%;object-fit:contain;display:block;border-radius:inherit;";
    const cardContainerStyle = size === "card"
      ? "aspect-ratio:4/3;overflow:hidden;"
      : "";

    return `<div class="${cls}"${cardContainerStyle ? ` style="${cardContainerStyle}"` : ""}>
      <img src="${escAttr(images[0])}" alt="${escAttr(product.title)}" loading="${size === "gallery" ? "eager" : "lazy"}" style="${cardImageStyle}" />
    </div>`;
  }

  const inner = primaryIconSvg(product);
  return `<div class="${cls}" aria-hidden="true">
    <svg viewBox="0 0 100 100" class="product-art-grid" preserveAspectRatio="none">
      <line x1="0" y1="25" x2="100" y2="25" />
      <line x1="0" y1="50" x2="100" y2="50" />
      <line x1="0" y1="75" x2="100" y2="75" />
      <line x1="25" y1="0" x2="25" y2="100" />
      <line x1="50" y1="0" x2="50" y2="100" />
      <line x1="75" y1="0" x2="75" y2="100" />
    </svg>
    <svg ${ICON_ATTRS} class="product-art-icon">${inner}</svg>
  </div>`;
}

module.exports = { productArt, primaryIcon, CATEGORY_ICON };
