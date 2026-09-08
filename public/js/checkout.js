(function () {
  var emptyEl = document.getElementById("checkoutEmpty");
  var layoutEl = document.getElementById("checkoutLayout");
  var linesEl = document.getElementById("checkoutLines");
  var subtotalEl = document.getElementById("checkoutSubtotal");
  var form = document.getElementById("checkoutForm");
  var addressField = document.getElementById("addressField");
  var resultEl = document.getElementById("checkoutResult");
  var successEl = document.getElementById("checkoutSuccess");
  var fallbackEl = document.getElementById("checkoutFallback");
  var summaryEl = document.getElementById("checkoutSummary");
  var copyBtn = document.getElementById("copyCheckoutBtn");
  var clearBtn = document.getElementById("clearCartBtn");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form) return;

  var trackedStart = false;

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
    if (!trackedStart) {
      trackedStart = true;
      if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("checkout_start");
    }
    return true;
  }

  form.querySelectorAll('input[name="method"]').forEach(function (r) {
    r.addEventListener("change", function () {
      form.querySelectorAll('input[name="method"]').forEach(function (radio) {
        if (radio.checked) addressField.hidden = radio.value !== "delivery";
      });
    });
  });

  function methodLabel(method) {
    return method === "delivery" ? "Доставка по России" : "Самовывоз в Брянске";
  }

  function buildOrderText(data) {
    var items = window.PrintlabCart.get();
    var lines = items.map(function (item) {
      var unit = item.price + (item.variantExtra || 0);
      var label = [item.variantName, item.colorName ? "цвет: " + item.colorName : ""].filter(Boolean).join(", ");
      return "— " + item.title + (label ? " (" + label + ")" : "") + " × " + item.qty + " = " + (unit * item.qty).toLocaleString("ru-RU") + " ₽";
    });
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
      "Получение: " + methodLabel(data.method),
    ];
    if (data.method === "delivery" && data.address) out.push("Адрес: " + data.address);
    if (data.comment) out.push("Комментарий: " + data.comment);
    return out.join("\n");
  }

  function buildApiPayload(data) {
    var items = window.PrintlabCart.get();
    return {
      kind: "order",
      name: data.name,
      contact: data.contact,
      method: methodLabel(data.method),
      address: data.method === "delivery" ? data.address : "",
      comment: data.comment,
      items: items.map(function (item) {
        var label = [item.variantName, item.colorName ? "цвет: " + item.colorName : ""].filter(Boolean).join(", ");
        return { title: item.title, variant: label, qty: item.qty };
      }),
    };
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

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Отправляем…"; }

    window.PrintlabOrderApi.send(buildApiPayload(data)).then(function (result) {
      if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("order_submitted");
      layoutEl.hidden = true;
      resultEl.hidden = false;

      if (result.ok) {
        successEl.hidden = false;
        fallbackEl.hidden = true;
      } else {
        summaryEl.textContent = buildOrderText(data);
        successEl.hidden = true;
        fallbackEl.hidden = false;
      }
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Оформить заказ"; }
      renderSummary();
    });
  }

  renderSummary();
})();
