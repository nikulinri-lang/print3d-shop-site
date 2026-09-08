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
  { key: "featured", label: "Популярное", icon: "🔥", kind: "featured" },
  { key: "Подарки", label: "Подарки", icon: "🎁", kind: "category" },
  { key: "Прикольные штуки", label: "Прикольные штуки", icon: "😂", kind: "category" },
  { key: "Для дома", label: "Для дома", icon: "🏠", kind: "category" },
  { key: "Для телефона", label: "Для телефона", icon: "📱", kind: "category" },
  { key: "Игры и хобби", label: "Игры и хобби", icon: "🎮", kind: "category" },
  { key: "Антистресс", label: "Антистресс", icon: "🧩", kind: "category" },
  { key: "Полезные детали", label: "Полезные детали", icon: "⚙️", kind: "category" },
  { key: "custom", label: "На заказ", icon: "🛠", kind: "custom" },
];

// Заполнить, когда придут реальные значения (см. finalный отчёт в чате):
// - YANDEX_METRIKA_ID: номер счётчика с metrika.yandex.ru
// - YANDEX_VERIFICATION: код с webmaster.yandex.ru -> Добавить сайт -> HTML-тег
// - GOOGLE_VERIFICATION: код с search.google.com/search-console -> HTML-тег
// Пока пусто — соответствующий тег/скрипт просто не выводится (см. layout.js).
const YANDEX_METRIKA_ID = "";
const YANDEX_VERIFICATION = "";
const GOOGLE_VERIFICATION = "";

module.exports = {
  TELEGRAM_BOT_URL,
  TELEGRAM_HANDLE,
  CITY,
  CITY_PREP,
  LEAD_TIME,
  LEAD_TIME_LONG,
  CATEGORY_TILES,
  YANDEX_METRIKA_ID,
  YANDEX_VERIFICATION,
  GOOGLE_VERIFICATION,
};
