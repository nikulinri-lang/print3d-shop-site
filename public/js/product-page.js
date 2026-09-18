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
    priceEl.textContent = (product.price + extra).toLocaleString("ru-RU") + " ₽";
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

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      window.PrintlabCart.add(buildCartItem(), getQty());
      track();
      var prev = addBtn.textContent;
      addBtn.textContent = "Добавлено ✓";
      addBtn.classList.add("is-added");
      setTimeout(function () { addBtn.textContent = prev; addBtn.classList.remove("is-added"); }, 1200);
    });
  }
  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      window.PrintlabCart.add(buildCartItem(), getQty());
      track();
      location.href = "/cart";
    });
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
