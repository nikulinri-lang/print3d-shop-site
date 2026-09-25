const fs = require("fs");
const path = require("path");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");
const { TELEGRAM_HANDLE, CITY, CITY_PREP, LEAD_TIME } = require("./constants");
const { breadcrumbSchema } = require("./render-products");

function crumbScript(items) {
  return `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema(items))}</script>`;
}

function aboutPage() {
  const body = `<section class="page-hero premium-page-hero premium-page-hero--about">
  <div class="container">
    <div class="premium-page-hero-grid">
      <div class="premium-page-hero-copy">
        <span class="kicker">О нас / 3Д Вещь</span>
        <h1>Из идеи — в <span>реальную вещь.</span></h1>
        <p class="lede">Студия 3D-печати в Брянске. Готовые изделия, кастомные проекты и печать по вашим файлам, эскизам или фотографиям.</p>
        <div class="premium-page-hero-actions"><a href="/custom-order" class="btn btn-primary">Запустить проект →</a><a href="/catalog/" class="btn btn-ghost">Смотреть каталог</a></div>
      </div>
      <div class="premium-hero-panel premium-hero-panel--metrics">
        <div class="premium-hero-panel-top"><span>3D / STUDIO</span><span>BRYANSK</span></div>
        <div class="premium-metric-list">
          <div><b>01</b><strong>1 636</strong><span>продано</span></div>
          <div><b>02</b><strong>178</strong><span>кастомных запросов</span></div>
          <div><b>03</b><strong>1 247</strong><span>изделий по запросам</span></div>
          <div><b>04</b><strong>48</strong><span>регионов доставки</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="info-grid info-grid--about">
      <article class="info-card">
        <div class="info-card-icon" aria-hidden="true">▦</div>
        <h2>Готовые изделия</h2>
        <p>Товары для дома, подарки, полезные аксессуары и необычные вещи из каталога. Выбираете изделие — мы печатаем и передаём заказ.</p>
        <a class="info-card-link" href="/catalog/">Смотреть каталог →</a>
      </article>
      <article class="info-card">
        <div class="info-card-icon" aria-hidden="true">⌁</div>
        <h2>Изготовление под заказ</h2>
        <p>Если нужной вещи нет в каталоге, пришлите фото, эскиз, размеры или готовую 3D-модель — оценим возможность и стоимость.</p>
        <a class="info-card-link" href="/custom-order">Заказать по фото →</a>
      </article>
      <article class="info-card">
        <div class="info-card-icon" aria-hidden="true">◇</div>
        <h2>Наше оборудование</h2>
        <p>Печатаем на Bambu Lab P2S Combo. Рассказываем, как оборудование влияет на скорость, точность и качество готовых изделий.</p>
        <a class="info-card-link" href="/printer">Посмотреть принтер →</a>
      </article>
      <article class="info-card">
        <div class="info-card-icon" aria-hidden="true">◌</div>
        <h2>Материалы</h2>
        <p>Используем PLA, PETG, ABS и TPU. Материал подбираем под назначение изделия, нагрузку, гибкость и условия эксплуатации.</p>
        <a class="info-card-link" href="/printer">Материалы и характеристики →</a>
      </article>
      <article class="info-card">
        <div class="info-card-icon" aria-hidden="true">⌖</div>
        <h2>Брянск и доставка</h2>
        <p>Самовывоз в ${CITY_PREP}, отправка по России. Способ получения и стоимость доставки согласуем после подтверждения заказа.</p>
        <a class="info-card-link" href="/delivery">Условия доставки →</a>
      </article>
      <article class="info-card info-card--accent">
        <div class="info-card-icon" aria-hidden="true">→</div>
        <h2>Есть идея?</h2>
        <p>Напишите нам в Telegram. Поможем понять, как лучше реализовать задумку и что потребуется для печати.</p>
        <a class="info-card-link" href="${TELEGRAM_BOT_URL}" target="_blank" rel="noopener">Написать в Telegram →</a>
      </article>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "О нас — 3Д Вещь, студия 3D-печати в Брянске",
    description: "3Д Вещь — студия 3D-печати в Брянске: готовые товары из каталога и изготовление изделий под заказ по файлу, эскизу или фотографии.",
    canonical: "/about",
    activeNav: "/about",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["О нас", "/about"]]),
  });
}

function deliveryPage() {
  const body = `<section class="custom-hero delivery-custom-hero"><div class="container"><div class="custom-hero-grid">
    <div class="custom-hero-copy"><span class="kicker">02 / Доставка и оплата</span><h1>От печати —<br><span>до ваших рук.</span></h1>
    <p class="lede">Сначала согласуем заказ, затем изготовим, после чего вы выбираете удобный способ получения. Никаких сложных схем — всё по шагам.</p>
    <div class="custom-hero-actions"><a href="#delivery-process" class="btn btn-primary">Как это работает →</a><a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost" target="_blank" rel="noopener">Уточнить условия</a></div>
    <div class="custom-trust-row"><span><b>01</b> заказ</span><span><b>02</b> печать</span><span><b>03</b> получение</span></div></div>
    <div class="custom-hero-visual delivery-hero-visual"><div class="custom-visual-orbit orbit-a"></div><div class="custom-visual-orbit orbit-b"></div><div class="custom-visual-core delivery-visual-core"><span>01 → 03</span><small>ORDER / DELIVERY</small></div><div class="custom-visual-label label-a">PAYMENT</div><div class="custom-visual-label label-b">PRINT</div><div class="custom-visual-label label-c">DELIVERY</div></div>
  </div></div></section>

<section class="section custom-process-section" id="delivery-process"><div class="container"><div class="section-head"><span class="kicker">03 / Как это работает</span><h2>Просто и <span>по шагам</span></h2><p>Вы не оплачиваете заказ вслепую: сначала подтверждаем состав, стоимость и срок.</p></div>
<div class="custom-process-grid delivery-process-grid">
  <article class="custom-process-card"><span>01</span><h3>Оформляем заказ</h3><p>Вы выбираете товар или присылаете идею для изготовления. Уточняем количество, цвет и другие детали.</p></article>
  <article class="custom-process-card"><span>02</span><h3>Подтверждаем оплату</h3><p>После согласования заказа менеджер сообщает итоговую стоимость и удобный способ оплаты.</p></article>
  <article class="custom-process-card"><span>03</span><h3>Печатаем</h3><p>Изготавливаем заказ. Ориентировочный срок — ${LEAD_TIME}, если отдельно не согласован другой срок.</p></article>
  <article class="custom-process-card custom-process-card--accent"><span>04</span><h3>Получаете</h3><p>Самовывоз в ${CITY_PREP} или отправка по России согласованным способом.</p></article>
</div></div></section>

<section class="section"><div class="container"><div class="custom-order-heading"><span class="kicker">04 / Получение</span><h2>Два способа <span>забрать заказ</span></h2></div>
<div class="delivery-premium-grid">
  <article class="delivery-premium-card"><div class="delivery-premium-number">01</div><div><span class="kicker">БРЯНСК</span><h3>Самовывоз</h3><p>Готовый заказ можно забрать в ${CITY_PREP}. Точку и время встречи согласуем в Telegram после изготовления.</p></div><div class="delivery-premium-meta"><span>ПОЛУЧЕНИЕ</span><strong>ЛИЧНО</strong></div></article>
  <article class="delivery-premium-card"><div class="delivery-premium-number">02</div><div><span class="kicker">РОССИЯ</span><h3>Доставка</h3><p>Отправляем транспортной компанией или через Авито Доставку. Стоимость зависит от размера, веса и города.</p></div><div class="delivery-premium-meta"><span>МАРШРУТ</span><strong>ПО РОССИИ</strong></div></article>
</div></div></section>

<section class="section" id="vozvrat"><div class="container"><div class="custom-order-heading"><span class="kicker">05 / Условия</span><h2>Возврат и <span>обмен</span></h2></div>
<div class="delivery-premium-grid">
  <article class="delivery-premium-card"><div class="delivery-premium-number">01</div><div><h3>Готовые изделия</h3><p>Если изделие не подошло и сохранило товарный вид — возврат или обмен возможен в течение 7 дней с момента получения. Обратная пересылка в этом случае за счёт покупателя.</p></div></article>
  <article class="delivery-premium-card"><div class="delivery-premium-number">02</div><div><h3>Изделия на заказ</h3><p>Изделия с индивидуально согласованными параметрами по общему правилу не подлежат возврату надлежащего качества. Все размеры и детали согласуем до печати.</p></div></article>
  <article class="delivery-premium-card delivery-premium-card--accent"><div class="delivery-premium-number">03</div><div><h3>Брак или ошибка</h3><p>Если изделие повреждено, имеет явный дефект или прислан не тот товар — напишите нам с фото. Обмен или возврат решим за наш счёт.</p></div></article>
</div></div></section>

<section class="section custom-material-section"><div class="container"><div class="custom-material-strip"><div><span class="kicker">06 / Вопрос</span><h2>Нужен расчёт доставки?</h2><p>Напишите город и название изделия — подскажем стоимость и срок.</p></div><a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Написать в Telegram →</a></div></div></section>`;

  return renderLayout({
    title: "Доставка и оплата — 3Д Вещь",
    description: `Доставка и оплата 3Д Вещь: самовывоз в ${CITY_PREP} или доставка по России. Понятные условия оформления, оплаты, получения, возврата и обмена.`,
    canonical: "/delivery",
    activeNav: "/delivery",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["Доставка и оплата", "/delivery"]]),
  });
}
function customOrderPage() {
  const body = `<section class="custom-hero"><div class="container"><div class="custom-hero-grid">
    <div class="custom-hero-copy"><span class="kicker">01 / Кастомный заказ</span><h1>Создадим вещь,<br><span>которой ещё нет.</span></h1>
    <p class="lede">Присылайте фотографию, эскиз, размеры или 3D-модель. Мы поможем превратить идею в готовое изделие.</p>
    <div class="custom-hero-actions"><a href="#custom-order" class="btn btn-primary">Рассказать об идее →</a><a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost" target="_blank" rel="noopener">Сразу в Telegram</a></div>
    <div class="custom-trust-row"><span><b>01</b> идея</span><span><b>02</b> расчёт</span><span><b>03</b> печать</span></div></div>
    <div class="custom-hero-visual"><div class="custom-visual-orbit orbit-a"></div><div class="custom-visual-orbit orbit-b"></div><div class="custom-visual-core"><span>3D</span><small>YOUR IDEA</small></div><div class="custom-visual-label label-a">PHOTO / SKETCH</div><div class="custom-visual-label label-b">MODEL / SIZE</div><div class="custom-visual-label label-c">PRINT / RESULT</div></div>
  </div></div></section>
<section class="section custom-process-section"><div class="container"><div class="section-head"><span class="kicker">02 / Как это работает</span><h2>От идеи до <span>готовой вещи</span></h2><p>Не обязательно разбираться в 3D-моделировании. Покажите, что хотите получить — дальше разберёмся вместе.</p></div>
<div class="custom-process-grid"><article class="custom-process-card"><span>01</span><h3>Покажите идею</h3><p>Фото, рисунок, ссылка, пример или описание словами.</p></article><article class="custom-process-card"><span>02</span><h3>Согласуем детали</h3><p>Размер, материал, цвет, количество и особенности изделия.</p></article><article class="custom-process-card"><span>03</span><h3>Рассчитаем стоимость</h3><p>Сообщим цену и срок до начала изготовления.</p></article><article class="custom-process-card custom-process-card--accent"><span>04</span><h3>Напечатаем</h3><p>Изготовим и передадим самовывозом или отправим по России.</p></article></div></div></section>
<section class="section custom-order-section" id="custom-order"><div class="container"><div class="custom-order-heading"><span class="kicker">03 / Заявка</span><h2>Расскажите, <span>что придумали</span></h2><p>Чем больше деталей — тем точнее оценим задачу.</p></div>
<div class="custom-order-layout custom-order-layout--premium"><form class="custom-order-form custom-order-form--premium" id="customOrderForm">
<div class="custom-form-top"><span>НОВЫЙ ПРОЕКТ</span><span>PRINTLAB / 3D</span></div>
<div class="custom-form-grid"><label class="form-field"><span>Ваше имя</span><input type="text" name="name" placeholder="Как к вам обращаться?" required></label><label class="form-field"><span>Telegram или телефон</span><input type="text" name="contact" placeholder="@username или +7…" required></label></div>
<label class="form-field"><span>Что нужно изготовить?</span><textarea name="description" rows="5" placeholder="Например: органайзер по фотографии, деталь, фигурка или серия подарков…" required></textarea></label>
<div class="custom-form-grid"><label class="form-field"><span>Количество</span><input type="number" name="qty" min="1" value="1"></label><label class="form-field"><span>Желаемый размер</span><input type="text" name="size" placeholder="Например: 120 × 80 × 40 мм"></label></div>
<label class="form-field"><span>Цвет / материал</span><input type="text" name="color" placeholder="Если важен — укажите"></label>
<label class="custom-file-drop form-field"><span>Файл проекта</span><input type="file" name="file" accept="image/*,.stl,.obj,.step,.pdf"><strong>Фото, эскиз или 3D-модель</strong><small>STL, OBJ, STEP, PDF или изображение. Можно приложить позже в Telegram.</small></label>
<button type="submit" class="btn btn-primary btn-block custom-submit">Отправить проект →</button></form>
<div class="custom-order-result-column"><div id="customOrderResult" hidden><div class="order-success" id="customOrderSuccess" hidden><div class="order-success-icon">✓</div><h3>Заявка отправлена</h3><p>Менеджер свяжется с вами, чтобы уточнить детали и стоимость.</p><a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Открыть Telegram</a></div>
<div class="custom-order-result" id="customOrderFallback" hidden><h3>Заявка готова</h3><p>Скопируйте текст и отправьте его первым сообщением в Telegram-боте.</p><pre class="custom-order-summary" id="customOrderSummary"></pre><div class="custom-order-actions"><button type="button" class="btn btn-ghost" id="copyOrderBtn">Скопировать</button><a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener" id="openTelegramBtn">Открыть Telegram</a></div></div></div>
<aside class="custom-order-aside custom-order-aside--premium"><span class="kicker">Что можно сделать</span><div class="custom-use-list"><div><b>01</b><span>Декор и интерьер</span></div><div><b>02</b><span>Органайзеры и полезные вещи</span></div><div><b>03</b><span>Подарки и сувениры</span></div><div><b>04</b><span>Детали и небольшие серии</span></div></div><div class="custom-aside-note"><span>⌁</span><p>Не знаете, как это смоделировать? Начните с фотографии или идеи.</p></div></aside></div></div></div></section>
<section class="section custom-material-section"><div class="container"><div class="custom-material-strip"><div><span class="kicker">04 / Материалы</span><h2>Подберём материал под задачу</h2></div><div class="custom-materials"><span>PLA</span><span>PETG</span><span>ABS</span><span>TPU</span><span>и другие</span></div><a href="/printer" class="btn btn-ghost">Посмотреть принтер →</a></div></div></section>`;
  return renderLayout({title:"Кастомный заказ — изготовление изделий на заказ | 3Д Вещь",description:"Изготовим 3D-печатное изделие по фотографии, эскизу, размерам или готовой модели. Оставьте заявку — оценим возможность и стоимость.",canonical:"/custom-order",activeNav:"/custom-order",bodyContent:body,extraScripts:`${crumbScript([["Главная","/"],["Кастомный заказ","/custom-order"]])}\n<script defer src="/js/custom-order.js?v=4"></script>`});
}

function cartPage() {
  const body = `<section class="page-hero page-hero--compact">
  <div class="container">
    <div class="checkout-hero-line"><span class="kicker">Заказ / 01</span><span>КОРЗИНА</span></div>
    <h1>Ваша <span>корзина.</span></h1>
    <div class="checkout-progress"><b class="is-active">01 Корзина</b><span></span><b>02 Оформление</b><span></span><b>03 Подтверждение</b></div>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div id="cartEmpty" class="cart-empty" hidden>
      <p>Корзина пуста.</p>
      <a href="/catalog/" class="btn btn-primary">Перейти в каталог</a>
    </div>
    <div id="cartLayout" class="cart-layout" hidden>
      <div class="cart-lines" id="cartLines"></div>
      <aside class="cart-summary">
        <div class="cart-summary-row">
          <span>Товары</span>
          <span class="mono" id="cartSubtotal">0 ₽</span>
        </div>
        <p class="form-hint">Стоимость доставки по России уточняем в Telegram при оформлении — зависит от размера и веса изделий.</p>
        <p class="form-hint">💳 Оплата после подтверждения заказа менеджером.</p>
        <a href="/checkout" class="btn btn-primary btn-block">Оформить заказ</a>
      </aside>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Корзина — 3Д Вещь",
    description: "Ваша корзина с 3D-печатными товарами 3Д Вещь.",
    canonical: "/cart",
    activeNav: "/cart",
    bodyContent: body,
    extraScripts: `<script defer src="/js/cart-page.js?v=3"></script>`,
  });
}

function checkoutPage() {
  const body = `<section class="page-hero page-hero--compact">
  <div class="container">
    <div class="checkout-hero-line"><span class="kicker">Заказ / 02</span><span>CHECKOUT</span></div>
    <h1 data-letter-reveal>Оформить <span>заказ.</span></h1>
    <div class="checkout-progress"><b class="is-active">01 Корзина</b><span></span><b class="is-active">02 Оформление</b><span></span><b>03 Подтверждение</b></div>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div id="checkoutEmpty" class="cart-empty" hidden>
      <p>Корзина пуста — сначала добавьте товары.</p>
      <a href="/catalog/" class="btn btn-primary">Перейти в каталог</a>
    </div>
    <div id="checkoutLayout" class="cart-layout" hidden>
      <form class="custom-order-form" id="checkoutForm">
        <div id="checkoutLines" class="checkout-lines"></div>
        <label class="form-field">
          <span>Имя и фамилия</span>
          <input type="text" name="name" required>
        </label>
        <label class="form-field">
          <span>Телефон или Telegram</span>
          <input type="text" name="contact" placeholder="@username или +7…" required>
        </label>
        <fieldset class="form-field method-field">
          <span>Способ получения</span>
          <div class="method-cards">
            <label class="method-card">
              <input type="radio" name="method" value="pickup" checked>
              <span class="method-card-icon">🏠</span>
              <span class="method-card-label">Самовывоз в ${CITY_PREP}</span>
            </label>
            <label class="method-card">
              <input type="radio" name="method" value="delivery">
              <span class="method-card-icon">🚚</span>
              <span class="method-card-label">Доставка по России</span>
            </label>
          </div>
        </fieldset>
        <label class="form-field" id="addressField" hidden>
          <span>Город и адрес доставки</span>
          <input type="text" name="address" placeholder="Город, ПВЗ или адрес">
        </label>
        <label class="form-field">
          <span>Комментарий к заказу</span>
          <textarea name="comment" rows="3" placeholder="Необязательно"></textarea>
        </label>
        <button type="submit" class="btn btn-primary btn-block">Оформить заказ</button>
      </form>

      <aside class="cart-summary">
        <div class="cart-summary-row">
          <span>Товары</span>
          <span class="mono" id="checkoutSubtotal">0 ₽</span>
        </div>
        <p class="form-hint">💳 Оплата после подтверждения заказа менеджером.</p>
      </aside>
    </div>

    <div id="checkoutResult" hidden>
      <div class="order-success" id="checkoutSuccess" hidden>
        <div class="order-success-icon">✅</div>
        <h3>Спасибо за заказ!</h3>
        <p>Наш менеджер свяжется с вами в ближайшее время для подтверждения и оплаты.</p>
        <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Написать в Telegram</a>
      </div>
      <div class="custom-order-result" id="checkoutFallback" hidden>
        <h3>Заказ сформирован</h3>
        <p>Не получилось отправить его автоматически — скопируйте текст и отправьте его первым сообщением в Telegram-боте, мы подтвердим заказ и сроки.</p>
        <pre class="custom-order-summary" id="checkoutSummary"></pre>
        <div class="custom-order-actions">
          <button type="button" class="btn btn-ghost" id="copyCheckoutBtn">Скопировать заказ</button>
          <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Открыть Telegram-бота</a>
        </div>
      </div>
      <button type="button" class="btn btn-ghost" id="clearCartBtn" style="margin-top: var(--space-md);">Очистить корзину</button>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Оформление заказа — 3Д Вещь",
    description: "Оформление заказа 3Д Вещь: самовывоз в Брянске или доставка по России, оплата после подтверждения менеджером.",
    canonical: "/checkout",
    activeNav: "/checkout",
    bodyContent: body,
    extraScripts: `<script defer src="/js/hero-text-reveal.js?v=3"></script>\n<script defer src="/js/checkout.js?v=5"></script>`,
  });
}

function offerPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Документы</span>
    <h1>Публичная оферта</h1>
    <p class="lede">Условия оформления и исполнения заказов на сайте 3Д Вещь.</p>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <div class="article-body">
      <p><!-- TODO: заменить реальными реквизитами после оформления ИП/самозанятости —
        полное наименование, ИНН, ОГРНИП/номер как самозанятого, юридический адрес --></p>

      <h2>1. Общие положения</h2>
      <p>Настоящий документ является публичной офертой 3Д Вещь (далее — «Исполнитель») и определяет условия изготовления и продажи 3D-печатных изделий через сайт 3-d-shop.ru. Оформляя заказ на сайте, покупатель («Заказчик») принимает условия настоящей оферты.</p>

      <h2>2. Предмет</h2>
      <p>Исполнитель обязуется изготовить и передать Заказчику изделия из каталога сайта либо изготовленные по индивидуальному заказу (по файлу, эскизу, фотографии или размерам), а Заказчик — принять и оплатить изделие.</p>

      <h2>3. Оформление заказа</h2>
      <p>Заказ оформляется через корзину на сайте или форму кастомного заказа. После оформления с Заказчиком связывается менеджер в Telegram (${TELEGRAM_HANDLE}) для подтверждения деталей, сроков и стоимости.</p>

      <h2>4. Цена и оплата</h2>
      <p>Стоимость изделия указывается на сайте либо согласуется индивидуально для кастомных заказов. Оплата производится после подтверждения заказа менеджером — при самовывозе в ${CITY_PREP} или по согласованному способу при доставке. Онлайн-оплата на сайте не предусмотрена.</p>

      <h2>5. Получение</h2>
      <p>Самовывоз — в ${CITY_PREP}, точка и время согласовываются в Telegram. Доставка по России — способом, согласованным с Заказчиком при оформлении.</p>

      <h2>6. Срок изготовления</h2>
      <p>Изготовление занимает ${LEAD_TIME} с момента подтверждения заказа, если иной срок не согласован отдельно для кастомного заказа.</p>

      <h2>7. Контакты</h2>
      <p>По всем вопросам — Telegram <a href="${TELEGRAM_BOT_URL}" target="_blank" rel="noopener">${TELEGRAM_HANDLE}</a>.</p>

      <p><!-- TODO: добавить дату публикации/редакции документа после оформления ИП --></p>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Публичная оферта — 3Д Вещь",
    description: "Условия оформления и исполнения заказов на сайте 3Д Вещь.",
    canonical: "/offer",
    activeNav: "/offer",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["Публичная оферта", "/offer"]]),
  });
}

function privacyPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Документы</span>
    <h1>Политика конфиденциальности</h1>
    <p class="lede">Как обрабатываются персональные данные посетителей сайта 3Д Вещь.</p>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <div class="article-body">
      <p><!-- TODO: заменить реальными реквизитами оператора персональных данных
        после оформления ИП/самозанятости --></p>

      <h2>1. Общие положения</h2>
      <p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта 3-d-shop.ru (далее — «Сайт») студией 3Д Вещь (далее — «Оператор»).</p>

      <h2>2. Какие данные собираются</h2>
      <p>При оформлении заказа или кастомной заявки Оператор получает: имя, контактные данные (телефон или Telegram), содержание заказа (товар, вариант, количество), адрес — при доставке. Сайт также использует Яндекс.Метрику для анализа посещаемости (обезличенная статистика).</p>

      <h2>3. Цели обработки</h2>
      <p>Данные используются исключительно для оформления, изготовления и передачи заказа, связи с Заказчиком по вопросам заказа и улучшения работы сайта.</p>

      <h2>4. Передача данных</h2>
      <p>Данные заказа передаются Оператору через Telegram (мессенджер, выбранный Заказчиком как канал связи) и не передаются третьим лицам, кроме случаев, необходимых для доставки (транспортные компании, Авито Доставка — при выборе такого способа получения).</p>

      <h2>5. Хранение</h2>
      <p>Данные хранятся в переписке в Telegram и удаляются по запросу Заказчика.</p>

      <h2>6. Права пользователя</h2>
      <p>Заказчик вправе запросить удаление своих данных, написав в Telegram <a href="${TELEGRAM_BOT_URL}" target="_blank" rel="noopener">${TELEGRAM_HANDLE}</a>.</p>

      <p><!-- TODO: добавить дату публикации/редакции документа после оформления ИП --></p>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Политика конфиденциальности — 3Д Вещь",
    description: "Как 3Д Вещь обрабатывает персональные данные посетителей сайта.",
    canonical: "/privacy",
    activeNav: "/privacy",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["Политика конфиденциальности", "/privacy"]]),
  });
}

function render(distDir) {
  fs.writeFileSync(path.join(distDir, "about.html"), aboutPage());
  fs.writeFileSync(path.join(distDir, "delivery.html"), deliveryPage());
  fs.writeFileSync(path.join(distDir, "custom-order.html"), customOrderPage());
  fs.writeFileSync(path.join(distDir, "cart.html"), cartPage());
  fs.writeFileSync(path.join(distDir, "checkout.html"), checkoutPage());
  fs.writeFileSync(path.join(distDir, "offer.html"), offerPage());
  fs.writeFileSync(path.join(distDir, "privacy.html"), privacyPage());
  console.log("  ✓ about.html, delivery.html, custom-order.html, cart.html, checkout.html, offer.html, privacy.html");
}

module.exports = { render };
