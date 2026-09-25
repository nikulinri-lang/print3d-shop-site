const fs = require("fs");
const path = require("path");
const { renderLayout } = require("./layout");

const SPECS = [
  { icon: "01", label: "Скорость печати", value: "до 500 мм/с" },
  { icon: "02", label: "Точность", value: "±0.05 мм" },
  { icon: "03", label: "Область печати", value: "256×256×256 мм" },
  { icon: "04", label: "Мультиматериальность", value: "до 16 цветов (AMS 2 Pro)" },
  { icon: "05", label: "Материалы", value: "PLA, PETG, ABS, TPU, PA и др." },
];

const MEANING = [
  { title: "Высокая скорость", text: "500 мм/с — значит короткие сроки изготовления. Мелкие изделия готовы в течение дня, а не недели." },
  { title: "Точность ±0.05 мм", text: "Мелкие резьбовые соединения, зубчатые передачи и посадочные места печатаются без доработки напильником." },
  { title: "16 цветов без доплаты", text: "Многоцветное изделие печатается за один проход — не нужно красить вручную и накидывать за это к цене." },
  { title: "Закрытая камера", text: "Стабильная температура внутри корпуса — ABS и PA печатаются без растрескивания и отслоения углов от стола." },
];

const MATERIALS = [
  {
    name: "PLA",
    desc: "Базовый и самый экологичный пластик. Для декора, фигурок и всего, что не требует высокой прочности к нагрузкам.",
    strength: 55, flex: 30, heat: 35,
    examples: [["Кольцо-кубик Fidget", "/catalog/fidget-ring"], ["Ваза геометрическая", "/catalog/geo-vase"]],
  },
  {
    name: "PETG",
    desc: "Прочнее и гибче PLA, устойчив к влаге. Для функциональных деталей, которые должны выдерживать нагрузку.",
    strength: 75, flex: 65, heat: 60,
    examples: [["Настенный крючок", "/catalog/wall-hook"], ["Органайзер для кабелей", "/catalog/cable-organizer"]],
  },
  {
    name: "ABS",
    desc: "Термостойкий и ударопрочный. Для деталей, которые работают при нагреве или механическом износе.",
    strength: 85, flex: 55, heat: 85,
    examples: [["Держатель для наушников", "/catalog/headphone-stand"]],
  },
  {
    name: "TPU",
    desc: "Гибкий эластичный пластик — сгибается и пружинит, а не ломается. Для чехлов, амортизирующих вставок, уплотнителей.",
    strength: 40, flex: 95, heat: 45,
    examples: [],
  },
];

function statBar(label, value) {
  return `<div class="stat-row"><span>${label}</span><div class="stat-bar"><div class="stat-bar-fill" data-value="${value}"></div></div></div>`;
}

function materialCard(m) {
  const examples = m.examples.length
    ? `<div class="material-examples">${m.examples.map(([name, url]) => `<a href="${url}">${name}</a>`).join(", ")}</div>`
    : "";
  return `<div class="material-card">
        <div class="material-icon mono">${m.name.slice(0, 3)}</div>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <div class="stats">
          ${statBar("Прочность", m.strength)}
          ${statBar("Гибкость", m.flex)}
          ${statBar("Термостойкость", m.heat)}
        </div>
        ${examples}
      </div>`;
}

function printerPage() {
  const body = `<section class="hero hero--printer premium-printer-hero">
  <div class="hero-visual premium-printer-visual">
    <div class="printer-hero-gridlines" aria-hidden="true"></div>
    <img src="/images/printer/p2s-front.webp"
      srcset="/images/printer/p2s-front-480.webp 480w, /images/printer/p2s-front-800.webp 800w, /images/printer/p2s-front.webp 1600w"
      sizes="(max-width: 767px) 90vw, 560px"
      alt="Bambu Lab P2S Combo" class="printer-hero-photo" loading="eager" fetchpriority="high">
  </div>
  <div class="container hero-content premium-printer-content">
    <div class="premium-printer-topline"><span>HARDWARE / 01</span><span>PRINTLAB LAB</span></div>
    <span class="kicker">Наше оборудование</span>
    <h1>Bambu Lab P2S Combo<br><span>— наш принтер.</span></h1>
    <p class="lede">Именно на нём печатается каждый ваш заказ — от небольшой детали до серии готовых изделий.</p>
    <div class="premium-printer-specline"><span><b>500</b> мм/с</span><span><b>0.05</b> мм</span><span><b>16</b> цветов</span><span><b>24/7</b> контроль</span></div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><span class="kicker">Характеристики</span><h2>Что под капотом</h2></div>
    <div class="printer-specs-grid">
      ${SPECS.map((s) => `<div class="printer-spec-card"><div class="printer-spec-icon" aria-hidden="true">${s.icon}</div><div class="printer-spec-value mono">${s.value}</div><div class="printer-spec-label">${s.label}</div></div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section print-layers">
  <div class="container">
    <div class="section-head"><span class="kicker">На практике</span><h2>Что это значит для вас</h2></div>
    <div class="steps">
      ${MEANING.map((m) => `<div class="step"><h3>${m.title}</h3><p>${m.text}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><span class="kicker">Материалы</span><h2>Что мы используем</h2></div>
    <div class="materials-grid materials-grid--4">
      ${MATERIALS.map(materialCard).join("\n      ")}
    </div>
  </div>
</section>

<section class="section print-layers">
  <div class="container">
    <div class="section-head"><span class="kicker">Фотогалерея</span><h2>Принтер вживую</h2></div>
    <div class="printer-gallery">
      <img src="/images/printer/p2s-angle.webp" srcset="/images/printer/p2s-angle-480.webp 480w, /images/printer/p2s-angle-800.webp 800w, /images/printer/p2s-angle.webp 1600w" sizes="(max-width: 767px) 90vw, 400px" alt="Bambu Lab P2S Combo, вид спереди с AMS 2 Pro" loading="lazy">
      <img src="/images/printer/p2s-side.webp" srcset="/images/printer/p2s-side-480.webp 480w, /images/printer/p2s-side-800.webp 800w, /images/printer/p2s-side.webp 1600w" sizes="(max-width: 767px) 90vw, 400px" alt="Bambu Lab P2S Combo, вид сбоку" loading="lazy">
      <img src="/images/printer/p2s-front.webp" srcset="/images/printer/p2s-front-480.webp 480w, /images/printer/p2s-front-800.webp 800w, /images/printer/p2s-front.webp 1600w" sizes="(max-width: 767px) 90vw, 400px" alt="Bambu Lab P2S Combo, фронтальный вид" loading="lazy">
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-banner">
      <h2>Хотите увидеть, что можно напечатать?</h2>
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-lg);">Смотрите готовые изделия в каталоге или пришлите свою модель в Telegram.</p>
      <div class="hero-actions" style="justify-content:center;">
        <a href="/catalog/" class="btn btn-primary">Смотреть каталог</a>
        <a href="https://t.me/Shop3D_online_bot" class="btn btn-ghost" target="_blank" rel="noopener">Написать в Telegram</a>
      </div>
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Bambu Lab P2S Combo — наш принтер | 3Д Вещь",
    description: "Рассказываем, на чём мы печатаем: скорость до 500 мм/с, точность ±0.05 мм, до 16 цветов за один проход, закрытая камера для ABS и PA.",
    canonical: "/printer",
    ogImage: "/images/printer/p2s-front.webp",
    activeNav: "/printer",
    bodyContent: body,
    extraHead: `<link rel="preload" as="image" href="/images/printer/p2s-front-800.webp" imagesrcset="/images/printer/p2s-front-480.webp 480w, /images/printer/p2s-front-800.webp 800w, /images/printer/p2s-front.webp 1600w" imagesizes="(max-width: 767px) 90vw, 560px">`,
  });
}

function render(distDir) {
  fs.writeFileSync(path.join(distDir, "printer.html"), printerPage());
  console.log("  ✓ printer.html");
}

module.exports = { render, SPECS, MEANING, MATERIALS };
