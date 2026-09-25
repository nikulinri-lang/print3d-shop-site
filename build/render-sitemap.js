const fs = require("fs");
const path = require("path");

const SITE_URL = "https://3-d-shop.ru";

// Корзина и чекаут — служебные страницы без собственного контента для
// индексации, в sitemap их не кладём (стандартная практика для e-commerce).
function render(distDir, { products, blogPosts }) {
  // lastmod для статей блога — их реальная дата публикации (frontmatter);
  // для остального (каталог, статичные страницы) — дата текущей сборки:
  // все эти страницы генерируются заново при каждом деплое, так что это
  // честное "последнее изменение", а не выдуманная дата.
  const buildDate = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: "/", lastmod: buildDate },
    { loc: "/catalog/", lastmod: buildDate },
    { loc: "/printer", lastmod: buildDate },
    { loc: "/about", lastmod: buildDate },
    { loc: "/delivery", lastmod: buildDate },
    { loc: "/custom-order", lastmod: buildDate },
    { loc: "/offer", lastmod: buildDate },
    { loc: "/privacy", lastmod: buildDate },
    { loc: "/blog/", lastmod: buildDate },
    ...products\n      .filter((p) => !["3d-lamp", "3d-lamp-1650"].includes(p.slug))\n      .map((p) => ({ loc: `/catalog/${p.slug}`, lastmod: buildDate })),
    ...blogPosts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: new Date(p.date).toISOString().slice(0, 10) })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml);

  const robots = `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /catalog?
Disallow: /catalog/?

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, "robots.txt"), robots);

  console.log(`  ✓ sitemap.xml (${urls.length} url), robots.txt`);
}

module.exports = { render };
