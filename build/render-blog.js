const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const WORDS_PER_MINUTE = 200;

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, "");
}

function fmtDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function readingTime(markdownContent) {
  const words = markdownContent.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Оборачивает абзацы вида "**Берите PLA, если:** ..." в callout-блок —
// матчим по markdown-соглашению (жирный лид-ин с двоеточием в начале
// абзаца), а не по тексту конкретной статьи, чтобы работало на любой
// новой статье без ручной разметки.
function wrapCallouts(html) {
  return html.replace(/<p><strong>([^<]*:)<\/strong>([\s\S]*?)<\/p>/g, (_m, lead, rest) => `<div class="callout"><p><strong>${lead}</strong>${rest}</p></div>`);
}

function wrapTables(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (_m, inner) => `<div class="table-scroll"><table>${inner}</table></div>`);
}

function slugifyHeading(text, used) {
  const base = text.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().toLowerCase().replace(/\s+/g, "-") || "section";
  const n = used.get(base) || 0;
  used.set(base, n + 1);
  return n ? `${base}-${n}` : base;
}

// Проставляет id заголовкам прямо в собранном HTML (без клиентского JS —
// содержимое и оглавление должны отдаваться в исходном HTML) и заодно
// строит список пунктов оглавления.
function injectHeadingIdsAndToc(html) {
  const used = new Map();
  const toc = [];
  const withIds = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id = slugifyHeading(text, used);
    toc.push({ level: Number(level), text, id });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html: withIds, toc };
}

function loadPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
      const { data, content } = matter(raw);
      const rawHtml = marked.parse(content);
      const { html: htmlWithIds, toc } = injectHeadingIdsAndToc(rawHtml);
      return {
        slug: slugFromFilename(f),
        title: data.title,
        date: data.date,
        category: data.category || "Блог",
        excerpt: data.excerpt,
        cover: data.cover || null,
        readMinutes: readingTime(content),
        toc,
        html: wrapTables(wrapCallouts(htmlWithIds)),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Реальное фото есть пока не у всех статей — для остальных остаётся
// градиент-плейсхолдер с подписью "[ обложка ]", один источник разметки
// карточки переиспользуется и на /blog, и в блоке блога на главной
// (render-home.js), чтобы они не разъезжались друг с другом.
const BLOG_PLACEHOLDER_ICON = '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>';

function blogCardMedia(p) {
  if (!p.cover) {
    return `<div class="blog-card-media">
        <div class="blog-card-photo"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="blog-card-placeholder-icon">${BLOG_PLACEHOLDER_ICON}</svg>
      </div>`;
  }
  return `<div class="blog-card-media blog-card-media--photo">
        <picture>
          <source srcset="${p.cover}.webp" type="image/webp">
          <img src="${p.cover}.jpg" alt="${p.title}" loading="lazy">
        </picture>
      </div>`;
}

function blogCardHTML(p) {
  return `<a href="/blog/${p.slug}" class="blog-card">
        ${blogCardMedia(p)}
        <span class="blog-card-tag">${p.category}</span>
        <div class="blog-card-meta">
          <span class="blog-card-date mono">${fmtDate(p.date)}</span>
          <span class="blog-card-read-time mono">${p.readMinutes} мин чтения</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
      </a>`;
}

function blogIndexPage(posts) {
  const cards = posts.map(blogCardHTML).join("\n      ");

  const body = `<section class="page-hero">
  <div class="container">
    <span class="kicker">Блог</span>
    <h1>Читаем перед печатью</h1>
    <p class="lede">Разбираем материалы, процесс печати и практические примеры — без воды, по делу.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="blog-grid">
      ${cards}
    </div>
  </div>
</section>`;

  return renderLayout({
    title: "Блог — PRINTLAB",
    description: "Статьи о материалах для 3D-печати, процессе изготовления и практических примерах применения.",
    canonical: "/blog",
    activeNav: "/blog",
    bodyContent: body,
  });
}

function tocHTML(toc) {
  if (toc.length < 2) return "";
  const links = toc
    .map((item) => `<a href="#${item.id}" class="article-toc-link${item.level === 3 ? " article-toc-link--sub" : ""}">${item.text}</a>`)
    .join("\n            ");
  return `<aside class="article-toc">
        <div class="article-toc-inner">
          <span class="article-toc-label">На этой странице</span>
          <nav class="article-toc-nav">
            ${links}
          </nav>
        </div>
      </aside>`;
}

function articleCta() {
  return `<div class="article-cta">
        <h2>Готовы заказать изделие?</h2>
        <div class="article-cta-actions">
          <a href="/catalog" class="btn btn-primary">Смотреть каталог</a>
          <a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost" target="_blank" rel="noopener">Написать в Telegram</a>
        </div>
      </div>`;
}

function blogPostPage(post) {
  const body = `<div class="reading-progress" id="readingProgress"></div>

<section class="page-hero page-hero--article">
  <div class="container">
    <span class="kicker">Блог</span>
    <div class="blog-card-date mono">${fmtDate(post.date)} · ${post.readMinutes} мин чтения</div>
    <h1>${post.title}</h1>
  </div>
</section>

<section class="section">
  <div class="container container--article-wide">
    <div class="article-layout">
      <article class="article-content">
        ${post.html}
        ${articleCta()}
      </article>
      ${tocHTML(post.toc)}
    </div>
    <a href="/blog" class="btn btn-ghost article-back">← Ко всем статьям</a>
  </div>
</section>`;

  const script = `<script>
(function(){
  var bar = document.getElementById('readingProgress');
  if (!bar) return;
  function update() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    var pct = height > 0 ? (scrolled / height) * 100 : 0;
    bar.style.width = pct + '%';
  }
  document.addEventListener('scroll', update, { passive: true });
  update();
})();
</script>${post.toc.length >= 2 ? '\n<script defer src="/js/article-toc.js?v=1"></script>' : ""}`;

  return renderLayout({
    title: `${post.title} — Блог PRINTLAB`,
    description: post.excerpt,
    canonical: `/blog/${post.slug}`,
    activeNav: "/blog",
    bodyContent: body,
    extraScripts: script,
  });
}

function render(distDir) {
  const posts = loadPosts();
  const blogDir = path.join(distDir, "blog");
  fs.mkdirSync(blogDir, { recursive: true });

  // index.html внутри blog/ (не соседний blog.html) — та же причина,
  // что и у catalog/index.html: избегаем конфликта имени файла с
  // директорией blog/, где лежат сами статьи.
  fs.writeFileSync(path.join(blogDir, "index.html"), blogIndexPage(posts));
  for (const post of posts) {
    fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), blogPostPage(post));
  }

  console.log(`  ✓ blog/index.html + ${posts.length} статей`);
  return posts;
}

module.exports = { render, loadPosts, fmtDate, blogCardHTML };
