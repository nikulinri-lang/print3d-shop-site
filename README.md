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
  js/                  # Three.js/GSAP-скрипты, cart.js (клиентская корзина), *-page.js
  images/, models/     # статические ассеты
content/
  products.json        # источник данных о товарах (статичный; см. "Синхронизация с ботом")
  blog/*.md             # статьи блога (frontmatter + markdown)
dist/                  # результат сборки, в git не попадает
```

## Оплата и заказы

Сайт полностью статический (нет бэкенда). Корзина и оформление заказа —
клиентские (localStorage), при отправке формируют текстовую сводку
заказа и предлагают скопировать её и отправить первым сообщением в
Telegram-боте (`@Shop3D_online_bot`). Онлайн-оплата (ЮKassa и т.п.) не
подключена — для неё нужен бэкенд или serverless-функция, см.
`.env.example`.

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
