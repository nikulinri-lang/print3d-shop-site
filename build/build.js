/* Сборщик сайта: копирует public/ как есть, кладёт vendor-библиотеки
 * (Three.js/GSAP) и генерирует все HTML-страницы из content/ через общий
 * layout.js (главная тоже — см. render-home.js).
 */
const fs = require("fs");
const path = require("path");
const renderProducts = require("./render-products");
const renderBlog = require("./render-blog");
const renderPrinter = require("./render-printer");
const renderStaticPages = require("./render-static-pages");
const renderSitemap = require("./render-sitemap");
const renderHome = require("./render-home");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");
const NODE_MODULES = path.join(ROOT, "node_modules");

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

// Полное дерево examples/jsm/ — 430+ файлов, из которых реально
// используется 13 (остальное — неиспользуемые лоадеры/пассы других
// форматов). Копирование всего дерева раздувало FTP-деплой до многих
// минут (каждый файл — отдельная FTP-транзакция). Список ниже —
// результат явной трассировки import-графа от GLTFLoader/EffectComposer/
// UnrealBloomPass/OutputPass (см. их import-заголовки) — если добавляете
// новый addon из three-jsm, проверьте его импорты и дополните список.
const THREE_JSM_FILES = [
  "loaders/GLTFLoader.js",
  "utils/BufferGeometryUtils.js",
  "utils/SkeletonUtils.js",
  "postprocessing/EffectComposer.js",
  "postprocessing/RenderPass.js",
  "postprocessing/UnrealBloomPass.js",
  "postprocessing/OutputPass.js",
  "postprocessing/Pass.js",
  "postprocessing/MaskPass.js",
  "postprocessing/ShaderPass.js",
  "shaders/CopyShader.js",
  "shaders/LuminosityHighPassShader.js",
  "shaders/OutputShader.js",
];

function copyVendorLibs() {
  // Нет бандлера — Three.js/GSAP отдаём браузеру как есть, тем же
  // способом, каким их публикуют сами авторы для прямого <script type="module">
  // подключения. GLTFLoader импортирует 'three' голым спецификатором
  // (резолвится через importmap в HTML) и соседние файлы из examples/jsm
  // относительными путями — поэтому сохраняем их относительную структуру.
  const vendor = path.join(DIST, "js", "vendor");
  fs.mkdirSync(vendor, { recursive: true });

  // three.module.js в новых версиях Three.js — тонкая обёртка над
  // three.core.js (relative import './three.core.js'), нужны оба файла
  // рядом друг с другом.
  fs.copyFileSync(
    path.join(NODE_MODULES, "three", "build", "three.module.js"),
    path.join(vendor, "three.module.js")
  );
  fs.copyFileSync(
    path.join(NODE_MODULES, "three", "build", "three.core.js"),
    path.join(vendor, "three.core.js")
  );

  const jsmSrc = path.join(NODE_MODULES, "three", "examples", "jsm");
  const jsmDest = path.join(vendor, "three-jsm");
  for (const rel of THREE_JSM_FILES) {
    const dest = path.join(jsmDest, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(jsmSrc, rel), dest);
  }

  fs.copyFileSync(
    path.join(NODE_MODULES, "gsap", "dist", "gsap.min.js"),
    path.join(vendor, "gsap.min.js")
  );
  fs.copyFileSync(
    path.join(NODE_MODULES, "gsap", "dist", "ScrollTrigger.min.js"),
    path.join(vendor, "ScrollTrigger.min.js")
  );
  console.log(`  ✓ vendor: three.module.js, three-jsm/ (${THREE_JSM_FILES.length} файлов), gsap.min.js, ScrollTrigger.min.js`);
}

function build() {
  console.log("Сборка сайта в dist/...");
  clean();
  copyPublicAssets();
  copyVendorLibs();
  const { products } = renderProducts.render(DIST);
  const blogPosts = renderBlog.render(DIST);
  renderPrinter.render(DIST);
  renderStaticPages.render(DIST);
  renderHome.render(DIST);
  renderSitemap.render(DIST, { products, blogPosts });
  console.log("Готово.");
}

build();
