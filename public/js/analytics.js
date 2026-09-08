/* Обёртка над Яндекс.Метрикой (ym) для целей. Пока счётчик не настроен
 * (window.__YM_ID__ не задан layout.js), trackGoal просто ничего не
 * делает — остальной код (cart.js, checkout.js, custom-order.js) вызывает
 * его безусловно, ничего не ломается ни до, ни после подключения
 * счётчика.
 *
 * Клик по любой ссылке на Telegram отслеживается глобально прямо здесь
 * (делегирование на document), поэтому не нужно вручную помечать каждую
 * кнопку "Написать в Telegram" по всему сайту. */
(function () {
  function trackGoal(name, params) {
    if (typeof window.ym === "function" && window.__YM_ID__) {
      window.ym(window.__YM_ID__, "reachGoal", name, params);
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="https://t.me/"]');
    if (a) trackGoal("telegram_click");
  });

  window.PrintlabAnalytics = { trackGoal: trackGoal };
})();
