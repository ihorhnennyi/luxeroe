'use server'
import 'server-only'

export type LeadPayload = { name: string; phone: string }

export type OrderItem = {
  id: string
  title: string
  qty: number
  lineTotal?: number
  image?: string
  variant?: string
  type?: 'single' | 'bundle'
}

export type OrderPayload = {
  customer: {
    firstName: string
    lastName: string
    phone: string
    city: string
    branch: string
  }
  items: OrderItem[]
  subtotal?: number
  note?: string
  source?: string
}

type TgResponse = { ok: boolean; result?: unknown; description?: string }

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const LEADS_CHAT_ID = process.env.TELEGRAM_LEADS_CHAT_ID || ''
const LEADS_THREAD_ID = envInt(process.env.TELEGRAM_LEADS_THREAD_ID)
const ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID || ''
const ORDERS_THREAD_ID = envInt(process.env.TELEGRAM_ORDERS_THREAD_ID)

function envInt(v?: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function assertEnv(which: 'leads' | 'orders') {
  if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN')
  const chat = which === 'leads' ? LEADS_CHAT_ID : ORDERS_CHAT_ID
  if (!chat) throw new Error(`Missing ${which.toUpperCase()} chat id`)
}

export async function sendLeadToTelegram({ name, phone }: LeadPayload) {
  assertEnv('leads')

  const cleanedPhone = normalizePhone(phone)
  const text =
    `<b>Нова заявка</b>\n` +
    `👤 Ім’я: <code>${escapeHtml(name)}</code>\n` +
    `📞 Телефон: <code>${escapeHtml(cleanedPhone)}</code>`

  return tgSend({ chatId: LEADS_CHAT_ID, threadId: LEADS_THREAD_ID, text })
}

export async function sendOrderToTelegram(order: OrderPayload) {
  assertEnv('orders')

  const { customer, items } = order
  const phone = normalizePhone(customer.phone)

  const head =
    `<b>Новий заказ</b>\n` +
    `👤 Клієнт: <code>${escapeHtml(customer.lastName)} ${escapeHtml(customer.firstName)}</code>\n` +
    `📞 Телефон: <code>${escapeHtml(phone)}</code>\n` +
    `🚚 Місто/Відділення: <code>${escapeHtml(customer.city)} / ${escapeHtml(
      customer.branch
    )}</code>`

  const maxLines = 25
  const lines: string[] = []
  let restCount = 0

  for (const it of items) {
    const title = truncate(escapeHtml(it.title), 64)
    const variant = it.variant ? ` (${escapeHtml(it.variant)})` : ''
    const qty = Math.max(1, it.qty)
    const sum = typeof it.lineTotal === 'number' ? ` — <b>${formatUA(it.lineTotal)}</b>` : ''
    const row = `• ${title}${variant} × <b>${qty}</b>${sum}`
    if (lines.length < maxLines) lines.push(row)
    else restCount++
  }
  if (restCount > 0) lines.push(`…та ще ${restCount} позицій`)

  const itemsBlock = `<b>Позиції:</b>\n${lines.join('\n')}`

  const tail: string[] = []
  if (typeof order.subtotal === 'number') tail.push(`💰 Разом: <b>${formatUA(order.subtotal)}</b>`)
  if (order.note) tail.push(`📝 Коментар: <i>${escapeHtml(order.note)}</i>`)
  if (order.source) tail.push(`🔗 Джерело: <code>${escapeHtml(order.source)}</code>`)

  const text = [head, itemsBlock, tail.join('\n')].filter(Boolean).join('\n\n')

  const chunks = chunkByLen(text, 4096)
  let last: TgResponse | undefined

  for (const [i, chunk] of chunks.entries()) {
    last = await tgSend({
      chatId: ORDERS_CHAT_ID,
      threadId: ORDERS_THREAD_ID,
      text: chunks.length > 1 ? `${chunk}\n\n(${i + 1}/${chunks.length})` : chunk
    })
  }

  return last
}

async function tgSend(opts: { chatId: string; text: string; threadId?: number }) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const baseBody = {
    chat_id: opts.chatId,
    text: opts.text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  }

  const body =
    typeof opts.threadId === 'number' ? { ...baseBody, message_thread_id: opts.threadId } : baseBody

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  let json: TgResponse | null = null
  try {
    json = (await res.json()) as TgResponse
  } catch {}

  if (!json?.ok && String(json?.description || '').includes('message thread not found')) {
    const res2 = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baseBody)
    })
    const json2 = (await res2.json()) as TgResponse
    if (!json2?.ok) throw new Error('Telegram API error (fallback): ' + JSON.stringify(json2))
    return json2
  }

  if (!json?.ok) throw new Error('Telegram API error: ' + JSON.stringify(json))
  return json
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function formatUA(n: number) {
  return `${n.toLocaleString('uk-UA')} ₴`
}
function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}
function normalizePhone(p: string) {
  const d = (p || '').replace(/[^\d+]/g, '')
  return d.startsWith('+') ? d : '+' + d
}
function chunkByLen(s: string, max: number) {
  const out: string[] = []
  for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max))
  return out
}
async function fetchWithTimeout(input: RequestInfo, init: RequestInit, ms = 10000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal })
    return res
  } finally {
    clearTimeout(t)
  }
}
