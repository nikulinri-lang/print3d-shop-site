const fs = require("fs");
const path = require("path");

const SITE_URL = "https://3-d-shop.ru";

// Корзина и чекаут — служебные страницы без собственного контента для
// индексации, в sitemap их не кладём (стандартная практика для e-commerce).
function render(distDir, { products, blogPosts }) {
  const urls = [
    "/",
    "/catalog",
    "/printer",
    "/about",
    "/delivery",
    "/custom-order",
    "/blog",
    ...products.map((p) => `/catalog/${p.slug}`),
    ...blogPosts.map((p) => `/blog/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml);

  const robots = `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, "robots.txt"), robots);

  console.log(`  ✓ sitemap.xml (${urls.length} url), robots.txt`);
}

module.exports = { render };
