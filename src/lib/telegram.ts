// src/lib/telegram.ts
export type LeadPayload = { name: string; phone: string };

export type OrderItem = {
  id: string;
  title: string;
  qty: number;
  lineTotal?: number;
  image?: string;
  variant?: string;
  type?: string;
};

export type OrderPayload = {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    branch: string;
  };
  items: OrderItem[];
  subtotal?: number;
  note?: string;
  source?: string;
};

/* ===== ENV ===== */
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

// Лиды (звонок)
const LEADS_CHAT_ID = process.env.TELEGRAM_LEADS_CHAT_ID || "";
const LEADS_THREAD_ID = envInt(process.env.TELEGRAM_LEADS_THREAD_ID);

// Заказы (товар)
const ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID || "";
const ORDERS_THREAD_ID = envInt(process.env.TELEGRAM_ORDERS_THREAD_ID);

function envInt(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function assertEnv(chatId: string) {
  if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  if (!chatId) throw new Error("Missing TELEGRAM_*_CHAT_ID");
}

/* ===== SENDERS ===== */

export async function sendLeadToTelegram({ name, phone }: LeadPayload) {
  assertEnv(LEADS_CHAT_ID);

  const cleanedPhone = phone.replace(/[^\d+]/g, "");
  const text =
    `<b>Нова заявка</b>\n` +
    `👤 Ім’я: <code>${escapeHtml(name)}</code>\n` +
    `📞 Телефон: <code>${escapeHtml(cleanedPhone)}</code>`;

  return tgSend({ chatId: LEADS_CHAT_ID, threadId: LEADS_THREAD_ID, text });
}

export async function sendOrderToTelegram(order: OrderPayload) {
  assertEnv(ORDERS_CHAT_ID);

  const { customer, items } = order;
  const phone = customer.phone.replace(/[^\d+]/g, "");

  const head =
    `<b>Новий заказ</b>\n` +
    `👤 Клієнт: <code>${escapeHtml(customer.lastName)} ${escapeHtml(
      customer.firstName
    )}</code>\n` +
    `📞 Телефон: <code>${escapeHtml(phone)}</code>\n` +
    `🚚 Місто/Відділення: <code>${escapeHtml(customer.city)} / ${escapeHtml(
      customer.branch
    )}</code>`;

  const maxLines = 25;
  const lines: string[] = [];
  let restCount = 0;

  items.forEach((it) => {
    const title = truncate(escapeHtml(it.title), 64);
    const variant = it.variant ? ` (${escapeHtml(it.variant)})` : "";
    const qty = Math.max(1, it.qty);
    const sum =
      typeof it.lineTotal === "number"
        ? ` — <b>${formatUA(it.lineTotal)}</b>`
        : "";
    const row = `• ${title}${variant} × <b>${qty}</b>${sum}`;
    if (lines.length < maxLines) lines.push(row);
    else restCount++;
  });
  if (restCount > 0) lines.push(`…та ще ${restCount} позицій`);

  const itemsBlock = `<b>Позиції:</b>\n${lines.join("\n")}`;

  const tail: string[] = [];
  if (typeof order.subtotal === "number")
    tail.push(`💰 Разом: <b>${formatUA(order.subtotal)}</b>`);
  if (order.note) tail.push(`📝 Коментар: <i>${escapeHtml(order.note)}</i>`);
  if (order.source)
    tail.push(`🔗 Джерело: <code>${escapeHtml(order.source)}</code>`);

  const text = [head, itemsBlock, tail.join("\n")].filter(Boolean).join("\n\n");

  return tgSend({
    chatId: ORDERS_CHAT_ID,
    threadId: ORDERS_THREAD_ID,
    text,
  });
}

/* ===== Low-level sender with topic fallback ===== */
async function tgSend(opts: {
  chatId: string;
  threadId?: number;
  text: string;
}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const baseBody: Record<string, any> = {
    chat_id: opts.chatId,
    text: opts.text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  // 1) пробуем с темой (если задана)
  if (typeof opts.threadId === "number" && Number.isFinite(opts.threadId)) {
    const body = { ...baseBody, message_thread_id: opts.threadId };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json?.ok) return json;

    // если тема не найдена — повторяем без темы (чтобы не потерять заказ)
    if (String(json?.description || "").includes("message thread not found")) {
      const res2 = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseBody),
      });
      const json2 = await res2.json();
      if (!json2?.ok)
        throw new Error(
          "Telegram API error (fallback): " + JSON.stringify(json2)
        );
      return json2;
    }

    throw new Error("Telegram API error: " + JSON.stringify(json));
  }

  // 2) без темы
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(baseBody),
  });
  const json = await res.json();
  if (!json?.ok) throw new Error("Telegram API error: " + JSON.stringify(json));
  return json;
}

/* ===== utils ===== */
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function formatUA(n: number) {
  return `${n.toLocaleString("uk-UA")} ₴`;
}
function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
