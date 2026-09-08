(function () {
  var form = document.getElementById("customOrderForm");
  var resultEl = document.getElementById("customOrderResult");
  var summaryEl = document.getElementById("customOrderSummary");
  var copyBtn = document.getElementById("copyOrderBtn");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var file = fd.get("file");
    var lines = [
      "Заявка на кастомный заказ — PRINTLAB",
      "",
      "Имя: " + fd.get("name"),
      "Контакт: " + fd.get("contact"),
      "Описание: " + fd.get("description"),
      "Количество: " + (fd.get("qty") || 1),
    ];
    if (fd.get("size")) lines.push("Размер: " + fd.get("size"));
    if (fd.get("color")) lines.push("Цвет: " + fd.get("color"));
    if (file && file.name) lines.push("Файл: " + file.name + " (прикрепите этим же файлом в Telegram)");

    summaryEl.textContent = lines.join("\n");
    form.hidden = true;
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
})();
