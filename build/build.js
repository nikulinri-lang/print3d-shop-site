/* Сборщик сайта: копирует public/ как есть, кладёт vendor-библиотеки
 * (Three.js/GSAP) и генерирует все HTML-страницы из content/ через общий
 * layout.js (главная тоже — см. render-home.js).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
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
const PRODUCTS_JSON = path.join(ROOT, "content", "products.json");
const EXTRA_PRODUCTS_JSON = path.join(ROOT, "content", "products-autumn.json");

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

function publishCatalogJson() {
  // Публикуем сезонный каталог рядом с сайтом. Worker и Telegram-бот
  // читают этот публичный JSON, поэтому GitHub не требуется делать публичным.
  fs.copyFileSync(EXTRA_PRODUCTS_JSON, path.join(DIST, "products-autumn.json"));
  console.log("  ✓ products-autumn.json опубликован в корне dist/");
}

// Сжатие тяжёлых PNG/JPEG в WebP выполняется только при сборке.
// Исходники в репозитории не меняются, но браузер получает лёгкую версию.
function optimizeImages() {
  const generated = new Map();
  const imagesDir = path.join(DIST, "images");

  // Для обычных фото сначала применяем EXIF-ориентацию.
  // Для четырёх осенних фото принудительно поворачиваем исходные пиксели
  // на 90° БЕЗ -auto-orient: иначе двойная обработка EXIF могла вернуть
  // фотографию в горизонтальное положение.
  // -resize 1600x1600> — "только уменьшать", уже маленькие/квадратные
  // иконки категорий не трогает и не увеличивает.
  // Эти четыре фото для двух осенних товаров были сняты боком.
  // Поворачиваем только веб-версию при сборке; оригиналы в public/images
  // остаются полностью без изменений.
  const rotatePortrait = new Set([
    "IMG_9883.jpeg", "IMG_9884.jpeg",
    "IMG_9885.jpeg", "IMG_9886.jpeg",
  ]);

  function convertImage(src, out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const isForcedRotate = rotatePortrait.has(path.basename(src));
    let imageArgs;
    if (isForcedRotate) {
      // Сначала учитываем EXIF. Затем проверяем уже ориентированные
      // пиксели: если кадр всё ещё горизонтальный, поворачиваем на 90°.
      // Так все четыре фото гарантированно становятся вертикальными,
      // независимо от того, какой EXIF был записан камерой.
      const orientedSize = execFileSync(
        "convert",
        [src, "-auto-orient", "-format", "%w %h", "info:"],
        { encoding: "utf8" }
      ).trim().split(/\\s+/).map(Number);
      const needsRotate = orientedSize[0] > orientedSize[1];
      imageArgs = [
        src,
        "-auto-orient",
        ...(needsRotate ? ["-rotate", "90"] : []),
        "-resize", "1600x1600>",
        "-strip", "-quality", "82", out,
      ];
    } else {
      imageArgs = [src, "-auto-orient", "-resize", "1600x1600>", "-strip", "-quality", "82", out];
    }
    execFileSync("convert", imageArgs, { stdio: "ignore" });
    return fs.existsSync(out) && fs.statSync(out).size > 0;
  }

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(png|jpe?g)$/i.test(entry.name)) {
        // Порог убран: раньше маленькие файлы (<100 КБ) пропускались
        // «как уже лёгкие», но именно поэтому у них тоже не применялся
        // -auto-orient — часть фото могла остаться повёрнутой. Конвертируем
        // всё; -resize с ">" безопасен для уже маленьких файлов.
        const out = full.replace(/\.(png|jpe?g)$/i, ".webp");
        try {
          if (convertImage(full, out)) {
            const publicPath = "/images/" + path.relative(imagesDir, full).split(path.sep).join("/");
            generated.set(publicPath, publicPath.replace(/\.(png|jpe?g)$/i, ".webp"));
          }
        } catch (err) {
          console.warn(`  ⚠ Не удалось сжать ${path.relative(ROOT, full)}: ${err.message}`);
        }
      }
    }
  }

  walk(imagesDir);

  // Новое фото, добавленное в корень репозитория: на главной отдаём только
  // адаптивные WebP-версии, а оригинал 1.8 МБ в public не копируем.
  const homePhoto = path.join(ROOT, "IMG_7738.png");
  if (fs.existsSync(homePhoto)) {
    const targets = [
      [480, "printlab-equipment-480.webp"],
      [800, "printlab-equipment-800.webp"],
      [1200, "printlab-equipment-1200.webp"],
    ];
    for (const [width, name] of targets) {
      try {
        const out = path.join(imagesDir, name);
        execFileSync("convert", [homePhoto, "-resize", `${width}x`, "-strip", "-quality", "86", out], { stdio: "ignore" });
      } catch (err) {
        console.warn(`  ⚠ Не удалось подготовить ${name}: ${err.message}`);
      }
    }
  }

  return generated;
}

function replaceOptimizedImageUrls(dir, generated) {
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) {
        let html = fs.readFileSync(full, "utf8");
        for (const [from, to] of generated) html = html.split(from).join(to);
        fs.writeFileSync(full, html);
      }
    }
  }
  walk(dir);
}

function replaceBrandInGeneratedHtml(dir) {
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) {
        // Заменяем PRINTLAB → ПринтЛаб только в тексте и alt-атрибутах,
        // но НЕ в src/href/srcset чтобы не ломать пути к файлам.
        const html = fs.readFileSync(full, "utf8")
          .replace(/(?<!(src|href|srcset|url|content|name|id|class|data-[a-z-]+)=["'][^"']{0,200})PRINTLAB/gi, (m) => "3Д Вещь");
        fs.writeFileSync(full, html);
      }
    }
  }
  walk(dir);
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

function mergeExtraProductsForBuild() {
  if (!fs.existsSync(EXTRA_PRODUCTS_JSON)) return null;
  const original = fs.readFileSync(PRODUCTS_JSON, "utf8");
  const base = JSON.parse(original);
  const extra = JSON.parse(fs.readFileSync(EXTRA_PRODUCTS_JSON, "utf8"));
  if (Array.isArray(extra) && extra.length) {
    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify([...base, ...extra], null, 2) + "\n");
  }
  return original;
}

function build() {
  console.log("Сборка сайта в dist/...");
  clean();
  copyPublicAssets();
  publishCatalogJson();
  const optimizedImages = optimizeImages();
  copyVendorLibs();

  // Дополнительные товары храним отдельным файлом, чтобы не переписывать
  // большой основной каталог при каждом новом сезонном товаре.
  const originalProductsJson = mergeExtraProductsForBuild();
  try {
    const { products } = renderProducts.render(DIST);
    const blogPosts = renderBlog.render(DIST);
    renderPrinter.render(DIST);
    renderStaticPages.render(DIST);
    renderHome.render(DIST);
    renderSitemap.render(DIST, { products, blogPosts });
    replaceOptimizedImageUrls(DIST, optimizedImages);
    replaceBrandInGeneratedHtml(DIST);
    console.log("Готово.");
  } finally {
    if (originalProductsJson !== null) fs.writeFileSync(PRODUCTS_JSON, originalProductsJson);
  }
}

build();
