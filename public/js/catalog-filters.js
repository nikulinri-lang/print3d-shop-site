/* Поиск / фильтры / сортировка каталога — работает поверх уже
 * отрендеренных на сервере карточек (данные читаются из data-*
 * атрибутов), без повторного запроса к серверу. Категория с плитки на
 * главной передаётся через ?category=... и применяется при загрузке. */
(function () {
  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll(".catalog-item"));
  var search = document.getElementById("catalogSearch");
  var priceSelect = document.getElementById("catalogPrice");
  var colorSelect = document.getElementById("catalogColor");
  var sortSelect = document.getElementById("catalogSort");
  var categoryButtons = document.querySelectorAll("#catalogCategoryFilters .filter-btn");
  var emptyEl = document.getElementById("catalogEmpty");
  var countEl = document.getElementById("catalogCount");

  var state = { category: "all", price: "all", color: "all", sort: "popular", q: "" };

  function parsePrice(range) {
    if (range === "all") return null;
    var parts = range.split("-").map(Number);
    return { min: parts[0], max: parts[1] };
  }

  function matches(item) {
    if (state.category !== "all") {
      if (state.category === "__featured__") {
        if (item.dataset.featured !== "1") return false;
      } else {
        var cats = (item.dataset.categories || "").split("|");
        if (cats.indexOf(state.category) === -1) return false;
      }
    }
    var priceRange = parsePrice(state.price);
    if (priceRange) {
      var price = Number(item.dataset.price);
      if (price < priceRange.min || price > priceRange.max) return false;
    }
    if (state.color !== "all") {
      var colors = (item.dataset.colors || "").split("|");
      if (colors.indexOf(state.color) === -1) return false;
    }
    if (state.q) {
      if ((item.dataset.search || "").indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function sortItems(list) {
    var sorted = list.slice();
    if (state.sort === "price-asc") {
      sorted.sort(function (a, b) { return Number(a.dataset.price) - Number(b.dataset.price); });
    } else if (state.sort === "price-desc") {
      sorted.sort(function (a, b) { return Number(b.dataset.price) - Number(a.dataset.price); });
    } else if (state.sort === "new") {
      sorted.sort(function (a, b) { return Number(b.dataset.index) - Number(a.dataset.index); });
    } else {
      // popular: featured сначала, внутри группы — исходный порядок каталога
      sorted.sort(function (a, b) {
        var fa = a.dataset.featured === "1" ? 0 : 1;
        var fb = b.dataset.featured === "1" ? 0 : 1;
        if (fa !== fb) return fa - fb;
        return Number(a.dataset.index) - Number(b.dataset.index);
      });
    }
    return sorted;
  }

  function apply() {
    var visible = items.filter(matches);
    var visibleSet = new Set(visible);
    var ordered = sortItems(items).filter(function (i) { return visibleSet.has(i); });

    items.forEach(function (i) { i.style.display = "none"; });
    ordered.forEach(function (i) {
      i.style.display = "";
      grid.appendChild(i);
    });

    emptyEl.style.display = visible.length === 0 ? "block" : "none";
    countEl.textContent = visible.length === items.length ? "" : "Показано " + visible.length + " из " + items.length;
  }

  if (search) {
    search.addEventListener("input", function () {
      state.q = search.value.trim().toLowerCase();
      apply();
    });
  }
  if (priceSelect) {
    priceSelect.addEventListener("change", function () {
      state.price = priceSelect.value;
      apply();
    });
  }
  if (colorSelect) {
    colorSelect.addEventListener("change", function () {
      state.color = colorSelect.value;
      apply();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      apply();
    });
  }
  categoryButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      categoryButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.category = btn.dataset.filterCategory;
      apply();
    });
  });

  // Плитка категории с главной: /catalog?category=Для%20дома или
  // /catalog?category=featured
  var params = new URLSearchParams(location.search);
  var presetCategory = params.get("category");
  if (presetCategory) {
    var key = presetCategory === "featured" ? "__featured__" : presetCategory;
    var targetBtn = Array.prototype.find.call(categoryButtons, function (b) { return b.dataset.filterCategory === key; });
    if (targetBtn) {
      categoryButtons.forEach(function (b) { b.classList.remove("active"); });
      targetBtn.classList.add("active");
      state.category = key;
    }
  }

  apply();
})();
