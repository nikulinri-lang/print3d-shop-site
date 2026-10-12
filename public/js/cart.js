/* Клиентская корзина (localStorage) — сайт статический, без бэкенда,
 * поэтому корзина живёт целиком в браузере покупателя. Единая точка
 * входа window.PrintlabCart, подключается на КАЖДОЙ странице (через
 * layout.js), чтобы бейдж-счётчик в хедере был верным везде, а карточки
 * каталога могли класть товар в корзину одной кнопкой без отдельного
 * JS на каждой странице. */
(function () {
  var KEY = "printlab_cart_v1";

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      /* приватный режим / диск полон — молча не сохраняем */
    }
    renderBadge(items);
    window.dispatchEvent(new CustomEvent("cart:change", { detail: { items: items } }));
  }

  function lineKey(slug, variantName, colorRequest) {
    return slug + "::" + (variantName || "") + "::" + (colorRequest ? "custom-color" : "standard");
  }

  function add(product, qty) {
    qty = Math.max(1, qty || 1);
    var items = read();
    var key = lineKey(product.slug, product.variantName, product.colorRequest);
    var existing = items.find(function (i) { return lineKey(i.slug, i.variantName, i.colorRequest) === key; });
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        slug: product.slug,
        title: product.title,
        price: product.price,
        icon: product.icon || "🖨️",
        variantName: product.variantName || "",
        variantExtra: product.variantExtra || 0,
        colorName: product.colorName || "",
        colorRequest: !!product.colorRequest,
        desiredColor: product.desiredColor || "",
        qty: qty,
      });
    }
    write(items);
    return items;
  }

  function setQty(slug, variantName, qty, colorRequest) {
    var items = read();
    var key = lineKey(slug, variantName, colorRequest);
    items = items
      .map(function (i) { return lineKey(i.slug, i.variantName, i.colorRequest) === key ? Object.assign({}, i, { qty: qty }) : i; })
      .filter(function (i) { return i.qty > 0; });
    write(items);
    return items;
  }

  function removeLine(slug, variantName, colorRequest) {
    var items = read().filter(function (i) { return lineKey(i.slug, i.variantName, i.colorRequest) !== lineKey(slug, variantName, colorRequest); });
    write(items);
    return items;
  }

  function updateDesiredColor(slug, variantName, colorRequest, desiredColor) {
    var items = read().map(function (i) {
      return lineKey(i.slug, i.variantName, i.colorRequest) === lineKey(slug, variantName, colorRequest)
        ? Object.assign({}, i, { desiredColor: String(desiredColor || "").slice(0, 100) })
        : i;
    });
    // Не перерисовываем корзину при каждом символе: иначе поле теряет фокус.
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    return items;
  }

  function clear() {
    write([]);
  }

  function count(items) {
    return (items || read()).reduce(function (n, i) { return n + i.qty; }, 0);
  }

  function subtotal(items) {
    return (items || read()).reduce(function (sum, i) { return sum + (i.price + (i.variantExtra || 0)) * i.qty; }, 0);
  }

  function renderBadge(items) {
    var el = document.getElementById("cartCount");
    if (!el) return;
    var n = count(items);
    el.textContent = String(n);
    el.hidden = n === 0;
  }

  // Универсальная кнопка "В корзину" без собственного JS на странице:
  // <button data-add-to-cart data-product='{"slug":"...","title":"...","price":350,"icon":"🧩"}'>
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;
    e.preventDefault();
    var raw = btn.getAttribute("data-product");
    if (!raw) return;
    var product;
    try {
      product = JSON.parse(raw);
    } catch (err) {
      return;
    }
    add(product, 1);
    if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("add_to_cart", { slug: product.slug });
    btn.classList.add("added");
    var label = btn.querySelector(".add-label");
    var prevText = label ? label.textContent : btn.textContent;
    if (label) label.textContent = "Добавлено ✓";
    else btn.textContent = "Добавлено ✓";
    setTimeout(function () {
      btn.classList.remove("added");
      if (label) label.textContent = prevText;
      else btn.textContent = prevText;
    }, 1200);
  });

  window.PrintlabCart = {
    get: read,
    add: add,
    setQty: setQty,
    remove: removeLine,
    updateDesiredColor: updateDesiredColor,
    clear: clear,
    count: count,
    subtotal: subtotal,
  };

  renderBadge(read());
})();
