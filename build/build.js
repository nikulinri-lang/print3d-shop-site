/* Сборщик сайта — сейчас копирует public/ и уже готовые страницы из
 * templates/ в dist/ как есть. Пока в проекте только главная страница
 * (прототип, см. ТЗ п.3) — рендер каталога/товаров/блога из
 * content/products.json и content/blog/*.md добавится отдельными
 * шагами (render-products.js, render-blog.js) после подтверждения
 * дизайна, чтобы не собирать шаблоны для страниц, которых ещё нет.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");
const TEMPLATES = path.join(ROOT, "templates");

function clean() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
}

function copyPublicAssets() {
  // public/css, public/js, public/images, public/models -> dist/{css,js,images,models}
  for (const entry of fs.readdirSync(PUBLIC)) {
    fs.cpSync(path.join(PUBLIC, entry), path.join(DIST, entry), { recursive: true });
  }
}

function copyReadyPages() {
  const readyPages = ["index.html"];
  for (const page of readyPages) {
    const src = path.join(TEMPLATES, page);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, page));
      console.log(`  ✓ ${page}`);
    }
  }
}

function build() {
  console.log("Сборка сайта в dist/...");
  clean();
  copyPublicAssets();
  copyReadyPages();
  console.log("Готово.");
}

build();
