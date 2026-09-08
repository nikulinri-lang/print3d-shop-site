(function () {
  var emptyEl = document.getElementById("checkoutEmpty");
  var layoutEl = document.getElementById("checkoutLayout");
  var linesEl = document.getElementById("checkoutLines");
  var subtotalEl = document.getElementById("checkoutSubtotal");
  var form = document.getElementById("checkoutForm");
  var addressField = document.getElementById("addressField");
  var resultEl = document.getElementById("checkoutResult");
  var summaryEl = document.getElementById("checkoutSummary");
  var copyBtn = document.getElementById("copyCheckoutBtn");
  var clearBtn = document.getElementById("clearCartBtn");
  if (!form) return;

  function renderSummary() {
    var items = window.PrintlabCart.get();
    if (!items.length) {
      emptyEl.hidden = false;
      layoutEl.hidden = true;
      return false;
    }
    emptyEl.hidden = true;
    layoutEl.hidden = false;
    linesEl.innerHTML = items.map(function (item) {
      var unit = item.price + (item.variantExtra || 0);
      var label = [item.variantName, item.colorName ? "цвет: " + item.colorName : ""].filter(Boolean).join(" · ");
      return `<div class="checkout-line">
        <span>${item.title}${label ? " (" + label + ")" : ""} × ${item.qty}</span>
        <span class="mono">${(unit * item.qty).toLocaleString("ru-RU")} ₽</span>
      </div>`;
    }).join("");
    subtotalEl.textContent = window.PrintlabCart.subtotal().toLocaleString("ru-RU") + " ₽";
    return true;
  }

  form.querySelectorAll('input[name="method"]').forEach(function (r) {
    r.addEventListener("change", function () {
      addressField.hidden = r.value !== "delivery" || !r.checked;
      form.querySelectorAll('input[name="method"]').forEach(function (radio) {
        if (radio.checked) addressField.hidden = radio.value !== "delivery";
      });
    });
  });

  function buildOrderText(data) {
    var items = window.PrintlabCart.get();
    var lines = items.map(function (item) {
      var unit = item.price + (item.variantExtra || 0);
      var label = [item.variantName, item.colorName ? "цвет: " + item.colorName : ""].filter(Boolean).join(", ");
      return "— " + item.title + (label ? " (" + label + ")" : "") + " × " + item.qty + " = " + (unit * item.qty).toLocaleString("ru-RU") + " ₽";
    });
    var methodLabel = data.method === "delivery" ? "Доставка по России" : "Самовывоз в Брянске";
    var out = [
      "Новый заказ с сайта PRINTLAB",
      "",
      "Товары:",
      lines.join("\n"),
      "",
      "Итого: " + window.PrintlabCart.subtotal().toLocaleString("ru-RU") + " ₽",
      "",
      "Имя: " + data.name,
      "Контакт: " + data.contact,
      "Получение: " + methodLabel,
    ];
    if (data.method === "delivery" && data.address) out.push("Адрес: " + data.address);
    if (data.comment) out.push("Комментарий: " + data.comment);
    return out.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var data = {
      name: fd.get("name"),
      contact: fd.get("contact"),
      method: fd.get("method"),
      address: fd.get("address"),
      comment: fd.get("comment"),
    };
    var text = buildOrderText(data);
    summaryEl.textContent = text;
    layoutEl.hidden = true;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(summaryEl.textContent).then(function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = "Скопировано ✓";
        setTimeout(function () { copyBtn.textContent = prev; }, 1500);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      window.PrintlabCart.clear();
      resultEl.hidden = true;
      renderSummary();
    });
  }

  renderSummary();
})();
