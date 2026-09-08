# print3d-shop-site

Сайт магазина 3D-печатных изделий. Чистый HTML/CSS/JS + лёгкий Node.js
сборщик (без фреймворка) — деплоится как статика на Timeweb.

## Статус

Полноценный магазин: главная, каталог с поиском/фильтрами/сортировкой,
карточка товара (цвета, варианты, количество), корзина и оформление
заказа (client-side, хендофф в Telegram — см. "Оплата и заказы" ниже),
кастомный заказ, блог, страница о производстве, о нас, доставка. Three.js
(фоновый wireframe + hero-сцена) и GSAP-анимации.

## Структура

```
build/
  build.js             # сборщик: собирает всё ниже → dist/
  layout.js            # общий header/footer/подключение ассетов — ОДИН источник для всех страниц
  constants.js          # бизнес-факты (Telegram, город, сроки, категории)
  placeholder-art.js    # нейтральные SVG-превью товаров (вместо фото)
  render-home.js        # главная
  render-products.js    # каталог + карточка товара
  render-blog.js         # блог
  render-printer.js     # страница о принтере
  render-static-pages.js # /about, /delivery, /custom-order, /cart, /checkout
  render-sitemap.js     # sitemap.xml + robots.txt
public/
  css/                 # tokens.css (дизайн-токены), base.css, components.css
  js/                  # Three.js/GSAP-скрипты, cart.js (корзина), order-api.js
                        # (отправка заказа в Worker), analytics.js (цели Метрики)
  images/, models/     # статические ассеты
content/
  products.json        # источник данных о товарах (статичный; см. "Синхронизация с ботом")
  blog/*.md             # статьи блога (frontmatter + markdown)
worker/                # Cloudflare Worker: уведомления о заказах в Telegram (отдельный деплой, не Timeweb)
dist/                  # результат сборки, в git не попадает
```

## Аналитика и верификация

Яндекс.Метрика и мета-теги верификации (Яндекс.Вебмастер, Google Search
Console) подключаются через `build/constants.js`
(`YANDEX_METRIKA_ID`/`YANDEX_VERIFICATION`/`GOOGLE_VERIFICATION`) — пока
эти константы пустые, соответствующие теги просто не выводятся ни на
одной странице. Цели Метрики (`add_to_cart`, `checkout_start`,
`order_submitted`, `telegram_click`, `custom_order_submitted`)
настроены в коде (`public/js/analytics.js` + вызовы из `cart.js`,
`checkout.js`, `custom-order.js`, `product-page.js`) и заработают сразу
после того, как в `YANDEX_METRIKA_ID` появится номер счётчика — как
JavaScript-события с такими же идентификаторами нужно завести в
интерфейсе Метрики. Цель «Просмотр товара» отдельного кода не требует —
это URL-цель по маске `/catalog/*`, настраивается прямо в Метрике.

## Оплата и заказы

Онлайн-оплаты на сайте нет и не планируется — оплата подтверждается
менеджером после оформления заказа (самовывоз или доставка). Сайт сам
по себе статический (нет бэкенда), корзина и оформление — клиентские
(localStorage). При отправке заказ уходит POST-запросом в отдельный
Cloudflare Worker (`worker/`), который пересылает его владельцу личным
сообщением в Telegram — токен бота живёт как секрет Worker'а, а не в
коде сайта. Если Worker недоступен/не настроен, покупатель не теряет
заказ: сайт откатывается на текстовую сводку с кнопками «Скопировать» и
«Открыть Telegram-бота». См. `worker/README.md` для настройки.

## Локальная разработка

```bash
npm install
npm run dev   # сборка + сервер на localhost:3000
```

## Синхронизация с ботом

У сайта и Telegram-бота магазина сейчас **разные источники данных**:
бот хранит товары в SQLite на VPS и меняется живьём (админка, сток),
сайт — в статичном `content/products.json`, который пересобирается
только при деплое. Договорённость: пока это так, синхронизация (скрипт
экспорта `shop.db` → `products.json` перед сборкой) — отдельная задача
на потом, не блокирует текущую разработку сайта.

## Деплой

GitHub Actions при пуше в `main`: `npm run build` → FTP-деплой `dist/`
на Timeweb (по аналогии с
[nikulinri-lang/laserlove32-site](https://github.com/nikulinri-lang/laserlove32-site)).

- Хостинг: vh464.timeweb.ru, аккаунт cn203426
- Домен: 3-d-shop.ru (SSL — бесплатный Let's Encrypt от Timeweb)
- Путь: `/home/cn203426/3-d-shop.ru/public_html/`

Нужны GitHub Secrets в репозитории (Settings → Secrets and variables →
Actions):

- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`
