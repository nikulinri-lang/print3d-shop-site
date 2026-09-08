# print3d-shop-site

Сайт магазина 3D-печатных изделий. Чистый HTML/CSS/JS + лёгкий Node.js
сборщик (без фреймворка) — деплоится как статика на Timeweb.

## Статус

Сейчас в репозитории: дизайн-токены, базовые стили и статичный прототип
главной страницы (без JS/Three.js — согласовывается перед тем, как
добавлять анимации и остальные страницы, см. исходное ТЗ).

## Структура

```
build/
  build.js            # сборщик: public/ + готовые страницы из templates/ → dist/
templates/             # HTML-шаблоны страниц
public/
  css/                 # tokens.css (дизайн-токены), base.css, components.css
  js/                  # Three.js/GSAP-скрипты (появятся после подтверждения дизайна)
  images/, models/     # статические ассеты
content/
  products.json        # источник данных о товарах (статичный; см. "Синхронизация с ботом")
  blog/*.md             # статьи блога (frontmatter + markdown)
dist/                  # результат сборки, в git не попадает
```

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
