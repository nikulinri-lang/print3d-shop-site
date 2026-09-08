/* Cloudflare Worker: принимает заказ/кастомную заявку с 3-d-shop.ru и
 * пересылает её владельцу магазина личным сообщением в Telegram через
 * Bot API. Существует ОТДЕЛЬНО от статического сайта именно потому, что
 * токен бота — секрет: его нельзя положить в клиентский JS (любой
 * посетитель откроет исходный код страницы и сможет писать от имени
 * бота). Секреты (BOT_TOKEN, OWNER_CHAT_ID) задаются через
 * `wrangler secret put`, не хранятся в этом файле и не попадают в git.
 *
 * POST /  — { kind: "order" | "custom", ...поля из checkout.js/custom-order.js }
 * Ответ: { ok: true } или { ok: false, error }
 */

const ALLOWED_ORIGIN = "https://3-d-shop.ru";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function esc(v) {
  return String(v == null ? "" : v).slice(0, 2000);
}

function formatOrderMessage(d) {
  const lines = [
    "🛒 Новый заказ с сайта",
    "",
    `👤 Имя: ${esc(d.name)}`,
    `📞 Контакт: ${esc(d.contact)}`,
    "📦 Товар:",
    ...(Array.isArray(d.items) ? d.items : []).map(
      (i) => `  — ${esc(i.title)}${i.variant ? ` (${esc(i.variant)})` : ""} × ${esc(i.qty)}`
    ),
    `🚚 Получение: ${esc(d.method)}`,
  ];
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
  if (d.fileName) lines.push(`📎 Файл (у клиента, пришлёт в чат): ${esc(d.fileName)}`);
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
