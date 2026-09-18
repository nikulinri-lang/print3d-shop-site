/* Реальные бизнес-факты проекта, используемые в нескольких местах сборки
 * (главная, каталог, товар, доставка, кастомный заказ) — держим в одном
 * месте, чтобы не расходились формулировки между страницами. */

const TELEGRAM_BOT_URL = "https://t.me/Shop3D_online_bot";
const TELEGRAM_HANDLE = "@Shop3D_online_bot";
const CITY = "Брянск";
const CITY_PREP = "Брянске"; // предложный падеж — для "в Брянске"
const LEAD_TIME = "1–3 дня";
const LEAD_TIME_LONG = "Изготовление занимает 1–3 дня — печатаем изделие после оформления заказа, готовых складских остатков на все позиции не держим.";

// Новая таксономия категорий для каталога/главной. "Популярное" — не тег
// товара, а computed-выборка featured:true. "На заказ" — не фильтр по
// товарам, а плитка-переход к форме кастомного заказа.
const CATEGORY_TILES = [
  { key: "featured", label: "Популярное", icon: "🔥", kind: "featured", img: "featured" },
  { key: "Подарки", label: "Подарки", icon: "🎁", kind: "category", img: "gifts" },
  { key: "Прикольные штуки", label: "Прикольные штуки", icon: "😂", kind: "category", img: "fun-stuff" },
  { key: "Для дома", label: "Для дома", icon: "🏠", kind: "category", img: "home" },
  { key: "Для телефона", label: "Для телефона", icon: "📱", kind: "category", img: "phone" },
  { key: "Игры и хобби", label: "Игры и хобби", icon: "🎮", kind: "category", img: "hobby" },
  { key: "Антистресс", label: "Антистресс", icon: "🧩", kind: "category", img: "antistress" },
  { key: "Полезные детали", label: "Полезные детали", icon: "⚙️", kind: "category", img: "parts" },
  { key: "custom", label: "На заказ", icon: "🛠", kind: "custom", img: "custom" },
];

// Заполнить, когда придут реальные значения (см. finalный отчёт в чате):
// - YANDEX_METRIKA_ID: номер счётчика с metrika.yandex.ru
// - YANDEX_VERIFICATION: код с webmaster.yandex.ru -> Добавить сайт -> HTML-тег
// - GOOGLE_VERIFICATION: код с search.google.com/search-console -> HTML-тег
// Пока пусто — соответствующий тег/скрипт просто не выводится (см. layout.js).
const YANDEX_METRIKA_ID = "112399054";
// Яндекс подтверждается отдельным файлом (public/yandex_c95da4ec46ec707d.html),
// не мета-тегом — см. .htaccess (исключение из .html-редиректа) — так что
// эта константа для Яндекса не используется.
const YANDEX_VERIFICATION = "";
const GOOGLE_VERIFICATION = "G_Qt8RV3r5sIUm7vLWDagkfA51Vx1qoxjynC9tehG-o";

// Цифры доверия для блока статистики на главной — реальные бизнес-факты,
// обновляются вручную по мере роста магазина. Пока это заглушки — см.
// финальный отчёт в чате, куда нужно вписать реальные значения.
// Цифры обновлять здесь при изменении бизнес-данных
const TRUST_STATS = [
  { value: 1636, suffix: "", label: "товаров продано", icon: "🛒", accent: "#FF6B00" },
  { value: 178,  suffix: "", label: "заказов под запрос", icon: "🛠", accent: "#00D4FF" },
  { value: 1247, suffix: "", label: "изделий напечатано на заказ", icon: "🖨", accent: "#FF6B00" },
];

module.exports = {
  TELEGRAM_BOT_URL,
  TELEGRAM_HANDLE,
  CITY,
  CITY_PREP,
  LEAD_TIME,
  LEAD_TIME_LONG,
  CATEGORY_TILES,
  TRUST_STATS,
  YANDEX_METRIKA_ID,
  YANDEX_VERIFICATION,
  GOOGLE_VERIFICATION,
};
