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
  { key: "Освещение", label: "Освещение", icon: "💡", kind: "category", img: "copy_49BF10C0-5ABA-40DC-B5A4-121775BA0BF9.jpeg" },
  { key: "Декор", label: "Декор", icon: "🪴", kind: "category", img: "copy_6C7B3CB8-AF54-4B54-9C0C-0455C519B73F.jpeg" },
  { key: "Для детей", label: "Для детей", icon: "🧸", kind: "category", img: "copy_5DE84F5F-079D-4436-80EB-22A06F4093A6.jpeg" },
  { key: "custom", label: "На заказ", icon: "🛠", kind: "custom", img: "copy_62565173-13C3-4401-A745-B543F15C901F.jpeg" },
  { key: "Подарки", label: "Подарки", icon: "🎁", kind: "category", img: "copy_522296B7-CF6A-4F49-A12E-402FCFFBE5BA.jpeg" },
  { key: "Для дома", label: "Для дома", icon: "🏠", kind: "category", img: "copy_AA75305E-F29F-4E7D-BA95-B49E1A3FD016.jpeg" },
  { key: "Аксессуары", label: "Аксессуары", icon: "🧩", kind: "category", img: "copy_B42D38E1-5E44-41F3-87AE-5D00622E6B09.jpeg" },
];

// Заполнить, когда придут реальные значения (см. finalный отчёт в чате):
// - YANDEX_METRIKA_ID: номер счётчика с metrika.yandex.ru
// - YANDEX_VERIFICATION: код с webmaster.yandex.ru -> Добавить сайт -> HTML-тег
// - GOOGLE_VERIFICATION: код с search.google.com/search-console -> HTML-тег
// Пока пусто — соответствующий тег/скрипт просто не выводится (см. layout.js).
const YANDEX_METRIKA_ID = "113079521";
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
  { value: 1636, suffix: "", label: "продано изделий" },
  { value: 178,  suffix: "", label: "заказов под индивидуальные запросы" },
  { value: 1247, suffix: "", label: "изделий изготовлено под Ваши запросы" },
  { value: 48,   suffix: "", label: "регионов отправлены заказы" },
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
