/* Нейтральные сгенерированные превью товаров (вместо белых квадратов и
 * текста-плейсхолдера "[ рендер / .glb ]", и вместо хотлинка чужих фото
 * с MakerWorld/Printables — см. решение в чате). Абстрактная
 * wireframe-карточка в палитре сайта с иконкой основной категории —
 * честно выглядит как стилизованная заглушка, а не как фото конкретного
 * изделия. */

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

// size: "card" (каталог/похожее) | "gallery" (страница товара, крупнее)
function productArt(product, size = "card") {
  const icon = primaryIcon(product);
  const cls = size === "gallery" ? "product-art product-art--lg" : "product-art";
  return `<div class="${cls}" aria-hidden="true">
    <svg viewBox="0 0 100 100" class="product-art-grid" preserveAspectRatio="none">
      <line x1="0" y1="25" x2="100" y2="25" />
      <line x1="0" y1="50" x2="100" y2="50" />
      <line x1="0" y1="75" x2="100" y2="75" />
      <line x1="25" y1="0" x2="25" y2="100" />
      <line x1="50" y1="0" x2="50" y2="100" />
      <line x1="75" y1="0" x2="75" y2="100" />
    </svg>
    <span class="product-art-icon">${icon}</span>
  </div>`;
}

module.exports = { productArt, primaryIcon, CATEGORY_ICON };
