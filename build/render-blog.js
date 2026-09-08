const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const { renderLayout } = require("./layout");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, "");
}

function fmtDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function loadPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: slugFromFilename(f),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        html: marked.parse(content),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function blogIndexPage(posts) {
  const cards = posts
    .map(
      (p) => `<a href="/blog/${p.slug}" class="blog-card">
        <div class="blog-card-media"><div class="blog-card-photo"></div><span class="placeholder-label mono">[ обложка ]</span></div>
        <div class="blog-card-date mono">${fmtDate(p.date)}</div>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
      </a>`
    )
    .join("\n      ");

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

function blogPostPage(post) {
  const body = `<div class="reading-progress" id="readingProgress"></div>

<section class="page-hero page-hero--article">
  <div class="container">
    <span class="kicker">Блог</span>
    <div class="blog-card-date mono">${fmtDate(post.date)}</div>
    <h1>${post.title}</h1>
  </div>
</section>

<section class="section">
  <div class="container container--article">
    <article class="article-body">
      ${post.html}
    </article>
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
</script>`;

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

  fs.writeFileSync(path.join(distDir, "blog.html"), blogIndexPage(posts));
  for (const post of posts) {
    fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), blogPostPage(post));
  }

  console.log(`  ✓ blog.html + ${posts.length} статей`);
  return posts;
}

module.exports = { render, loadPosts, fmtDate };
