/* Отправка заказа/кастомной заявки в Cloudflare Worker (worker/), который
 * пересылает её владельцу в Telegram. Пока ORDER_ENDPOINT не заполнен
 * (или Worker недоступен) — window.PrintlabOrderApi.send() возвращает
 * ok:false, и вызывающий код (checkout.js/custom-order.js) сам
 * показывает покупателю запасной вариант — скопировать текст заказа и
 * отправить его в Telegram-бот вручную. Заказ никогда не теряется. */
(function () {
  var ORDER_ENDPOINT = "https://printlab-order-notifier.printlab3d.workers.dev";

  async function send(payload) {
    if (!ORDER_ENDPOINT) return { ok: false, error: "not configured" };
    try {
      const resp = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      return resp.ok && data.ok ? { ok: true } : { ok: false, error: data.error || resp.status };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  window.PrintlabOrderApi = { send: send, isConfigured: function () { return !!ORDER_ENDPOINT; } };
})();
