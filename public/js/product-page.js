/* Страница товара: степпер количества, выбор цвета/варианта, кнопки
 * "В корзину" / "Купить сейчас" + аккуратная анимация и форматирование описания. */
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
  var stickyBar = document.getElementById("stickyBuyBar");
  var stickyPriceEl = document.getElementById("stickyPrice");
  var stickyAddBtn = document.getElementById("stickyAddToCartBtn");

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
    var swatch = document.querySelector(".color-swatch.selected");
    if (swatch && swatch.dataset.extra !== undefined) {
      return { name: swatch.dataset.colorName, extra: Number(swatch.dataset.extra) || 0 };
    }
    return { name: "", extra: 0 };
  }

  function updatePrice() {
    var extra = selectedVariant().extra;
    var text = (product.price + extra).toLocaleString("ru-RU") + " ₽";
    priceEl.textContent = text;
    if (stickyPriceEl) stickyPriceEl.textContent = text;
  }

  document.querySelectorAll('input[name="variant"]').forEach(function (r) { r.addEventListener("change", updatePrice); });
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
      variantName: hasVariantRadios ? variant.name : "",
      variantExtra: variant.extra,
      colorName: colorName,
    };
  }

  function track() {
    if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("add_to_cart", { slug: product.slug });
  }

  function handleAdd(btn) {
    window.PrintlabCart.add(buildCartItem(), getQty());
    track();
    var prev = btn.textContent;
    btn.textContent = "Добавлено ✓";
    btn.classList.add("is-added");
    setTimeout(function () { btn.textContent = prev; btn.classList.remove("is-added"); }, 1200);
  }

  if (addBtn) addBtn.addEventListener("click", function () { handleAdd(addBtn); });
  if (stickyAddBtn) stickyAddBtn.addEventListener("click", function () { handleAdd(stickyAddBtn); });
  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      window.PrintlabCart.add(buildCartItem(), getQty());
      track();
      location.href = "/cart";
    });
  }

  /* Sticky-панель "В корзину" на мобильном: показываем, как только
   * основной блок кнопок уходит вверх за пределы экрана (пользователь
   * пролистал вниз), прячем обратно, когда он снова виден. */
  var actionsBlock = document.querySelector(".product-actions");
  if (stickyBar && actionsBlock && "IntersectionObserver" in window) {
    var stickyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        stickyBar.classList.toggle("is-visible", scrolledPast);
        stickyBar.setAttribute("aria-hidden", scrolledPast ? "false" : "true");
      });
    }, { threshold: 0 });
    stickyObserver.observe(actionsBlock);
  }

  /* Красивое описание: превращаем длинный текст в читаемые смысловые блоки. */
  var desc = document.querySelector(".product-description");
  if (desc) {
    var raw = desc.textContent.trim();
    var sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 4) {
      var groups = [];
      for (var i = 0; i < sentences.length; i += 2) groups.push(sentences.slice(i, i + 2).join(" "));
      desc.innerHTML = groups.map(function (text, index) {
        return '<span class="description-block" style="--delay:' + (index * 70) + 'ms">' + text + '</span>';
      }).join("");
    }
  }

  /* Плавное появление блоков при прокрутке без зависимости от сторонних библиотек. */
  var revealItems = document.querySelectorAll(".product-info > *, .product-gallery, .product-specs, .product-trust-row, .product-desc-section");
  revealItems.forEach(function (el, index) {
    el.classList.add("product-reveal");
    el.style.setProperty("--reveal-delay", Math.min(index * 45, 420) + "ms");
    if (el.hasAttribute("data-anim-section")) el.style.transitionDelay = Math.min(index * 70, 420) + "ms";
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
