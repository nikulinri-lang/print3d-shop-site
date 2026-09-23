(function () {
  var form = document.getElementById("customOrderForm");
  var resultEl = document.getElementById("customOrderResult");
  var successEl = document.getElementById("customOrderSuccess");
  var fallbackEl = document.getElementById("customOrderFallback");
  var summaryEl = document.getElementById("customOrderSummary");
  var copyBtn = document.getElementById("copyOrderBtn");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form) return;

  function buildText(fd, file) {
    var lines = [
      "Заявка на кастомный заказ — 3Д Вещь",
      "",
      "Имя: " + fd.get("name"),
      "Контакт: " + fd.get("contact"),
      "Описание: " + fd.get("description"),
      "Количество: " + (fd.get("qty") || 1),
    ];
    if (fd.get("size")) lines.push("Размер: " + fd.get("size"));
    if (fd.get("color")) lines.push("Цвет: " + fd.get("color"));
    if (file && file.name) lines.push("Файл: " + file.name + " (прикрепите этим же файлом в Telegram)");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var file = fd.get("file");

    var payload = {
      kind: "custom",
      name: fd.get("name"),
      contact: fd.get("contact"),
      description: fd.get("description"),
      qty: fd.get("qty") || 1,
      size: fd.get("size") || "",
      color: fd.get("color") || "",
      fileName: file && file.name ? file.name : "",
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Отправляем…"; }

    window.PrintlabOrderApi.send(payload).then(function (result) {
      if (window.PrintlabAnalytics) window.PrintlabAnalytics.trackGoal("custom_order");
      form.hidden = true;
      resultEl.hidden = false;

      if (result.ok) {
        successEl.hidden = false;
        fallbackEl.hidden = true;
      } else {
        summaryEl.textContent = buildText(fd, file);
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
})();
