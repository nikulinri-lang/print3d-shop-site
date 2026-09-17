/* Cloudflare Worker: каталог + приём заказов с 3-d-shop.ru.
 * Каталог берётся из GitHub — тот же products-autumn.json, из которого
 * собирается сайт. Telegram-бот может использовать GET /products как
 * единый источник каталога.
 *
 * Секреты BOT_TOKEN и OWNER_CHAT_ID задаются через wrangler secret put.
 */

const ALLOWED_ORIGIN = "https://3-d-shop.ru";
const CATALOG_URL = "https://api.github.com/repos/nikulinri-lang/print3d-shop-site/contents/content/products-autumn.json?ref=main";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(), ...extraHeaders },
  });
}

function esc(v) {
  return String(v == null ? "" : v).slice(0, 2000);
}

function normalizeProduct(p) {
  return {
    id: String(p.id || p.slug || ""),
    slug: String(p.slug || p.id || ""),
    title: String(p.title || "Без названия"),
    category: String(p.category || "Другое"),
    categories: Array.isArray(p.categories) ? p.categories.map(String) : [],
    price: Number(p.price || 0),
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({ name: String(v.name || ""), extra: Number(v.extra || 0) }))
      : [],
    stock: Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0,
    featured: Boolean(p.featured),
    description: String(p.description || ""),
    shortDesc: String(p.shortDesc || ""),
    specs: p.specs && typeof p.specs === "object" ? p.specs : {},
    colors: p.colors ?? null,
    images: Array.isArray(p.images)
      ? p.images.map((src) => new URL(String(src), "https://3-d-shop.ru/").href)
      : [],
  };
}

async function getProducts() {
  const resp = await fetch(CATALOG_URL, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": "PRINTLAB-Catalog-Worker",
    },
    cf: { cacheTtl: 60, cacheEverything: true },
  });
  if (!resp.ok) throw new Error(`catalog fetch failed: ${resp.status}`);

  const payload = await resp.json();
  if (!payload || payload.encoding !== "base64" || typeof payload.content !== "string") {
    throw new Error("GitHub catalog response is not base64 content");
  }

  const decoded = atob(payload.content.replace(/\n/g, ""));
  const data = JSON.parse(decoded);
  if (!Array.isArray(data)) throw new Error("catalog must be an array");
  return data.map(normalizeProduct);
}

function formatOrderMessage(d) {
  const lines = [
    "🛒 Новый заказ",
    "",
    `👤 Имя: ${esc(d.name)}`,
    `📞 Контакт: ${esc(d.contact)}`,
    "📦 Товары:",
    ...(Array.isArray(d.items) ? d.items : []).map(
      (i) => `  — ${esc(i.title || i.slug)}${i.variant ? ` (${esc(i.variant)})` : ""} × ${esc(i.qty)}`
    ),
    `🚚 Получение: ${esc(d.method)}`,
  ];
  if (d.total != null) lines.push(`💰 Сумма: ${esc(d.total)} ₽`);
  if (d.address) lines.push(`📍 Адрес: ${esc(d.address)}`);
  if (d.comment) lines.push(`💬 Комментарий: ${esc(d.comment)}`);
  lines.push(`🕐 Время: ${new Date().toISOString()}`);
  return lines.join("\n");
}

function formatCustomMessage(d) {
  const lines = [
    "🛠 Новая заявка на кастомный заказ",
    "",
    `👤 Имя: ${esc(d.name)}`,
    `📞 Контакт: ${esc(d.contact)}`,
    `📝 Описание: ${esc(d.description)}`,
    `🔢 Количество: ${esc(d.qty)}`,
  ];
  if (d.size) lines.push(`📏 Размер: ${esc(d.size)}`);
  if (d.color) lines.push(`🎨 Цвет: ${esc(d.color)}`);
  if (d.fileName) lines.push(`📎 Файл: ${esc(d.fileName)}`);
  lines.push(`🕐 Время: ${new Date().toISOString()}`);
  return lines.join("\n");
}

async function sendTelegramMessage(env, text) {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.OWNER_CHAT_ID, text }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Telegram API ${resp.status}: ${body}`);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/products") {
      try {
        const products = await getProducts();
        return json({ ok: true, products, source: CATALOG_URL });
      } catch (err) {
        return json({ ok: false, error: String(err) }, 502);
      }
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method not allowed" }, 405);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "invalid json" }, 400);
    }

    if (!data || !data.name || !data.contact) {
      return json({ ok: false, error: "missing name/contact" }, 400);
    }

    const text = data.kind === "custom" ? formatCustomMessage(data) : formatOrderMessage(data);

    try {
      await sendTelegramMessage(env, text);
    } catch (err) {
      return json({ ok: false, error: String(err) }, 502);
    }

    return json({ ok: true });
  },
};

// Trigger deployment after switching catalog source from raw.githubusercontent.com to GitHub Contents API.
