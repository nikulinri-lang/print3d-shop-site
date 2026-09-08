/* Страница товара: степпер количества, выбор цвета/варианта, кнопки
 * "В корзину" / "Купить сейчас". Данные о самом товаре приходят через
 * window.__PRODUCT__ (см. render-products.js), детали (вариант/цвет/
 * количество) читаются из уже отрендеренных элементов на странице. */
(function () {
  var product = window.__PRODUCT__;
  if (!product) return;

  if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("product_view", { slug: product.slug });

  var qtyInput = document.getElementById("qtyValue");
  var qtyMinus = document.getElementById("qtyMinus");
  var qtyPlus = document.getElementById("qtyPlus");
  var priceEl = document.getElementById("productPrice");
  var swatches = document.querySelectorAll(".color-swatch");
  var selectedColorEl = document.getElementById("selectedColorName");
  var addBtn = document.getElementById("addToCartBtn");
  var buyBtn = document.getElementById("buyNowBtn");

  function getQty() {
    var n = parseInt(qtyInput.value, 10);
    return isNaN(n) || n < 1 ? 1 : Math.min(n, 99);
  }
  function setQty(n) {
    qtyInput.value = String(Math.max(1, Math.min(99, n)));
  }

  if (qtyMinus) qtyMinus.addEventListener("click", function () { setQty(getQty() - 1); });
  if (qtyPlus) qtyPlus.addEventListener("click", function () { setQty(getQty() + 1); });
  if (qtyInput) {
    qtyInput.addEventListener("change", function () { setQty(getQty()); });
    qtyInput.addEventListener("input", function () { qtyInput.value = qtyInput.value.replace(/[^0-9]/g, ""); });
  }

  function selectedVariant() {
    var checked = document.querySelector('input[name="variant"]:checked');
    if (checked) return { name: checked.value, extra: Number(checked.dataset.extra) || 0 };
    // Нет отдельного блока вариантов — значит цвет и есть вариант
    // (см. variantsAreColors в build/render-products.js), берём extra
    // из выбранного свотча.
    var swatch = document.querySelector(".color-swatch.selected");
    if (swatch && swatch.dataset.extra !== undefined) {
      return { name: swatch.dataset.colorName, extra: Number(swatch.dataset.extra) || 0 };
    }
    return { name: "", extra: 0 };
  }

  function updatePrice() {
    var extra = selectedVariant().extra;
    priceEl.textContent = (product.price + extra).toLocaleString("ru-RU") + " ₽";
  }

  document.querySelectorAll('input[name="variant"]').forEach(function (r) {
    r.addEventListener("change", updatePrice);
  });

  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      swatches.forEach(function (s) { s.classList.remove("selected"); s.setAttribute("aria-checked", "false"); });
      sw.classList.add("selected");
      sw.setAttribute("aria-checked", "true");
      if (selectedColorEl) selectedColorEl.textContent = sw.dataset.colorName;
      updatePrice();
    });
  });

  function buildCartItem() {
    var variant = selectedVariant();
    var hasVariantRadios = !!document.querySelector('input[name="variant"]');
    var selectedSwatch = document.querySelector(".color-swatch.selected");
    var colorName = selectedSwatch ? selectedSwatch.dataset.colorName : "";
    return {
      slug: product.slug,
      title: product.title,
      price: product.price,
      icon: product.icon,
      // Если отдельных радио-вариантов нет, "вариант" — это и есть
      // выбранный цвет (см. selectedVariant) — не дублируем его же в
      // colorName, иначе в корзине появится "Красный · цвет: Красный".
      variantName: hasVariantRadios ? variant.name : "",
      variantExtra: variant.extra,
      colorName: colorName,
    };
  }

  function track() {
    if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("add_to_cart", { slug: product.slug });
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      window.PrintlabCart.add(buildCartItem(), getQty());
      track();
      var prev = addBtn.textContent;
      addBtn.textContent = "Добавлено ✓";
      setTimeout(function () { addBtn.textContent = prev; }, 1200);
    });
  }
  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      window.PrintlabCart.add(buildCartItem(), getQty());
      track();
      location.href = "/cart";
    });
  }
})();
