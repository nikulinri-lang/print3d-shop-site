const fs = require("fs");
const path = require("path");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");
const { TELEGRAM_HANDLE, CITY, CITY_PREP, LEAD_TIME } = require("./constants");
const { breadcrumbSchema } = require("./render-products");

function crumbScript(items) {
  return `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema(items))}</script>`;
}

function aboutPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">О нас</span>
    <h1>PRINTLAB — студия 3D-печати в Брянске</h1>
    <p class="lede">Печатаем готовые вещи на продажу и изделия под заказ по вашим файлам, эскизам или фотографиям.</p>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <div class="article-body">
      <p>PRINTLAB — небольшая студия 3D-печати. Мы делаем две вещи: печатаем готовые изделия из каталога, которые можно заказать прямо сейчас, и изготавливаем вещи под заказ — по вашему файлу, эскизу, фотографии или размерам.</p>

      <h2>Что можно купить</h2>
      <p>В каталоге — товары для дома, подарки, полезные мелочи для телефона, антистресс-игрушки и функциональные детали. Это готовые к печати позиции: выбираете вариант и цвет, где это предусмотрено, — печатаем и передаём вам.</p>

      <h2>Изготовление под заказ</h2>
      <p>Если нужной вещи нет в каталоге — пришлите нам файл модели, фотографию или эскиз с размерами в Telegram, и мы оценим, сможем ли напечатать и сколько это будет стоить. Подробности и форма — на странице <a href="/custom-order">кастомного заказа</a>.</p>

      <h2>Оборудование</h2>
      <p>Печатаем на принтере Bambu Lab P2S Combo — подробно про него и про то, что это даёт по скорости и точности печати, на <a href="/printer">странице о производстве</a>.</p>

      <h2>Материалы</h2>
      <p>Работаем с PLA, PETG, ABS и TPU — выбор материала зависит от назначения изделия: PLA для декора и мелочей, PETG и ABS для функциональных нагруженных деталей, TPU для гибких вещей.</p>

      <h2>Где мы</h2>
      <p>Печатаем и собираем заказы в ${CITY_PREP}. Самовывоз — в городе, доставка — по всей России. Подробнее на странице <a href="/delivery">доставки</a>.</p>

      <h2>Как связаться</h2>
      <p>Быстрее всего — в Telegram: <a href="${TELEGRAM_BOT_URL}" target="_blank" rel="noopener">${TELEGRAM_HANDLE}</a>. Отвечаем на вопросы по товарам, срокам и кастомным заказам.</p>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "О нас — PRINTLAB, студия 3D-печати в Брянске",
    description: "PRINTLAB — студия 3D-печати в Брянске: готовые товары из каталога и изготовление изделий под заказ по файлу, эскизу или фотографии.",
    canonical: "/about",
    activeNav: "/about",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["О нас", "/about"]]),
  });
}

function deliveryPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Доставка и получение</span>
    <h1>Как забрать или получить заказ</h1>
    <p class="lede">Самовывоз в ${CITY_PREP} или доставка по России — договариваемся о деталях в Telegram при оформлении.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="delivery-grid">
      <div class="delivery-card">
        <div class="delivery-card-icon">📍</div>
        <h3>${CITY}: самовывоз</h3>
        <p>Забираете готовое изделие сами. Точку и время встречи согласовываем в Telegram после того, как заказ напечатан — обычно это ${LEAD_TIME} с момента оформления.</p>
        <p>💳 Оплата после подтверждения заказа менеджером.</p>
      </div>
      <div class="delivery-card">
        <div class="delivery-card-icon">📦</div>
        <h3>Россия: доставка</h3>
        <p>Отправляем в другие города транспортными компаниями и через Авито Доставку — способ и стоимость зависят от размера и веса изделия, уточняем индивидуально при оформлении заказа в Telegram.</p>
        <p>Если заказ оформлен через Авито — вся переписка и оплата по этому заказу идут через Авито, это не отменяет и не дублирует оформление на сайте.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-banner">
      <h2>Есть вопрос по доставке в ваш город?</h2>
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-lg);">Напишите в Telegram — посчитаем стоимость и сроки для конкретного изделия.</p>
      <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Написать в Telegram</a>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Доставка и получение — PRINTLAB",
    description: `Самовывоз в ${CITY_PREP} или доставка по России. Условия получения и оплаты 3D-печатных изделий PRINTLAB.`,
    canonical: "/delivery",
    activeNav: "/delivery",
    bodyContent: body,
    extraScripts: crumbScript([["Главная", "/"], ["Доставка", "/delivery"]]),
  });
}

function customOrderPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Кастомный заказ</span>
    <h1>Изготовим изделие специально для вас</h1>
    <p class="lede">По фотографии, размерам, эскизу или готовой 3D-модели. Опишите задачу — оценим возможность и стоимость.</p>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="custom-order-layout">
      <form class="custom-order-form" id="customOrderForm">
        <label class="form-field">
          <span>Имя</span>
          <input type="text" name="name" required>
        </label>
        <label class="form-field">
          <span>Telegram или телефон</span>
          <input type="text" name="contact" placeholder="@username или +7…" required>
        </label>
        <label class="form-field">
          <span>Описание изделия</span>
          <textarea name="description" rows="4" placeholder="Что нужно напечатать, для чего" required></textarea>
        </label>
        <div class="form-row">
          <label class="form-field">
            <span>Количество</span>
            <input type="number" name="qty" min="1" value="1">
          </label>
          <label class="form-field">
            <span>Желаемый размер</span>
            <input type="text" name="size" placeholder="если важен">
          </label>
        </div>
        <label class="form-field">
          <span>Желаемый цвет</span>
          <input type="text" name="color" placeholder="если важен">
        </label>
        <label class="form-field">
          <span>Фото, эскиз или файл модели</span>
          <input type="file" name="file" accept="image/*,.stl,.obj,.step,.pdf">
          <span class="form-hint">Файл прикрепите тем же вложением при отправке сообщения в Telegram — сайт статический и не загружает файлы на сервер сам.</span>
        </label>
        <button type="submit" class="btn btn-primary btn-block">Сформировать заявку</button>
      </form>

      <div id="customOrderResult" hidden>
        <div class="order-success" id="customOrderSuccess" hidden>
          <div class="order-success-icon">✅</div>
          <h3>Заявка отправлена!</h3>
          <p>Наш менеджер свяжется с вами в ближайшее время, чтобы уточнить детали и стоимость.</p>
          <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Написать в Telegram</a>
        </div>
        <div class="custom-order-result" id="customOrderFallback" hidden>
          <h3>Заявка готова</h3>
          <p>Не получилось отправить её автоматически — скопируйте текст и отправьте его первым сообщением в Telegram-боте, так мы сразу увидим все детали.</p>
          <pre class="custom-order-summary" id="customOrderSummary"></pre>
          <div class="custom-order-actions">
            <button type="button" class="btn btn-ghost" id="copyOrderBtn">Скопировать заявку</button>
            <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener" id="openTelegramBtn">Открыть Telegram-бота</a>
          </div>
        </div>
      </div>

      <aside class="custom-order-aside">
        <div class="custom-order-aside-card">
          <div class="printer-teaser-spec-icon">⚡</div>
          <div>
            <div class="printer-teaser-spec-value mono">${LEAD_TIME}</div>
            <div class="printer-teaser-spec-label">обычно на изготовление после согласования</div>
          </div>
        </div>
        <div class="custom-order-aside-card">
          <div class="printer-teaser-spec-icon">🎨</div>
          <div>
            <div class="printer-teaser-spec-value mono">PLA / PETG / ABS / TPU</div>
            <div class="printer-teaser-spec-label">материал подберём под задачу</div>
          </div>
        </div>
        <p>Есть вопрос до того, как заполнять форму? Просто напишите в Telegram — ответим и подскажем, как лучше сформулировать заказ.</p>
        <a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost btn-block" target="_blank" rel="noopener">Написать в Telegram</a>
      </aside>
    </div>
  </div>
</section>

<section class="section print-layers">
  <div class="container">
    <div class="section-head"><span class="kicker">Оптом</span><h2>Нужна партия изделий?</h2></div>
    <div class="bulk-order-card">
      <p>Изготавливаем небольшие серии, сувениры, корпоративные подарки и детали по индивидуальному заказу.</p>
      <a href="${TELEGRAM_BOT_URL}" class="btn btn-primary" target="_blank" rel="noopener">Получить расчёт</a>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Кастомный заказ — изготовление изделий на заказ | PRINTLAB",
    description: "Изготовим 3D-печатное изделие по фотографии, эскизу, размерам или готовой модели. Оставьте заявку — оценим возможность и стоимость.",
    canonical: "/custom-order",
    activeNav: "/custom-order",
    bodyContent: body,
    extraScripts: `${crumbScript([["Главная", "/"], ["Кастомный заказ", "/custom-order"]])}\n<script defer src="/js/custom-order.js?v=4"></script>`,
  });
}

function cartPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Корзина</span>
    <h1>Ваша корзина</h1>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div id="cartEmpty" class="cart-empty" hidden>
      <p>Корзина пуста.</p>
      <a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
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
    title: "Корзина — PRINTLAB",
    description: "Ваша корзина с 3D-печатными товарами PRINTLAB.",
    canonical: "/cart",
    activeNav: "/cart",
    bodyContent: body,
    extraScripts: `<script defer src="/js/cart-page.js?v=3"></script>`,
  });
}

function checkoutPage() {
  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Оформление заказа</span>
    <h1 data-letter-reveal>Оформить заказ</h1>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div id="checkoutEmpty" class="cart-empty" hidden>
      <p>Корзина пуста — сначала добавьте товары.</p>
      <a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
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
    title: "Оформление заказа — PRINTLAB",
    description: "Оформление заказа PRINTLAB: самовывоз в Брянске или доставка по России, оплата после подтверждения менеджером.",
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
    <p class="lede">Условия оформления и исполнения заказов на сайте PRINTLAB.</p>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <div class="article-body">
      <p><!-- TODO: заменить реальными реквизитами после оформления ИП/самозанятости —
        полное наименование, ИНН, ОГРНИП/номер как самозанятого, юридический адрес --></p>

      <h2>1. Общие положения</h2>
      <p>Настоящий документ является публичной офертой PRINTLAB (далее — «Исполнитель») и определяет условия изготовления и продажи 3D-печатных изделий через сайт 3-d-shop.ru. Оформляя заказ на сайте, покупатель («Заказчик») принимает условия настоящей оферты.</p>

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
    title: "Публичная оферта — PRINTLAB",
    description: "Условия оформления и исполнения заказов на сайте PRINTLAB.",
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
    <p class="lede">Как обрабатываются персональные данные посетителей сайта PRINTLAB.</p>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <div class="article-body">
      <p><!-- TODO: заменить реальными реквизитами оператора персональных данных
        после оформления ИП/самозанятости --></p>

      <h2>1. Общие положения</h2>
      <p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта 3-d-shop.ru (далее — «Сайт») студией PRINTLAB (далее — «Оператор»).</p>

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
    title: "Политика конфиденциальности — PRINTLAB",
    description: "Как PRINTLAB обрабатывает персональные данные посетителей сайта.",
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
