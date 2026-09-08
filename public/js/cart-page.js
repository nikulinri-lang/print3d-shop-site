(function () {
  var emptyEl = document.getElementById("cartEmpty");
  var layoutEl = document.getElementById("cartLayout");
  var linesEl = document.getElementById("cartLines");
  var subtotalEl = document.getElementById("cartSubtotal");
  if (!linesEl) return;

  function lineLabel(item) {
    var parts = [];
    if (item.variantName) parts.push(item.variantName);
    if (item.colorName) parts.push("цвет: " + item.colorName);
    return parts.join(" · ");
  }

  function render() {
    var items = window.PrintlabCart.get();
    if (!items.length) {
      emptyEl.hidden = false;
      layoutEl.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    layoutEl.hidden = false;

    linesEl.innerHTML = items.map(function (item) {
      var unit = item.price + (item.variantExtra || 0);
      var label = lineLabel(item);
      return `<div class="cart-line" data-slug="${item.slug}" data-variant="${item.variantName || ""}">
        <div class="cart-line-icon" aria-hidden="true">${item.icon}</div>
        <div class="cart-line-body">
          <a href="/catalog/${item.slug}" class="cart-line-title">${item.title}</a>
          ${label ? `<div class="cart-line-variant">${label}</div>` : ""}
          <div class="cart-line-price mono">${unit.toLocaleString("ru-RU")} ₽ / шт</div>
        </div>
        <div class="qty-stepper qty-stepper--sm">
          <button type="button" class="qty-btn" data-action="minus">−</button>
          <span class="qty-value">${item.qty}</span>
          <button type="button" class="qty-btn" data-action="plus">+</button>
        </div>
        <div class="cart-line-total mono">${(unit * item.qty).toLocaleString("ru-RU")} ₽</div>
        <button type="button" class="cart-line-remove" aria-label="Удалить">✕</button>
      </div>`;
    }).join("");

    subtotalEl.textContent = window.PrintlabCart.subtotal().toLocaleString("ru-RU") + " ₽";
  }

  linesEl.addEventListener("click", function (e) {
    var line = e.target.closest(".cart-line");
    if (!line) return;
    var slug = line.dataset.slug;
    var variant = line.dataset.variant;
    var items = window.PrintlabCart.get();
    var current = items.find(function (i) { return i.slug === slug && (i.variantName || "") === variant; });
    if (!current) return;

    if (e.target.closest('[data-action="plus"]')) {
      window.PrintlabCart.setQty(slug, variant, current.qty + 1);
    } else if (e.target.closest('[data-action="minus"]')) {
      window.PrintlabCart.setQty(slug, variant, current.qty - 1);
    } else if (e.target.closest(".cart-line-remove")) {
      window.PrintlabCart.remove(slug, variant);
    } else {
      return;
    }
    render();
  });

  window.addEventListener("cart:change", render);
  render();
})();
