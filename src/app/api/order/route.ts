// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

// ── настройки
const NOTE_MAX = 600
const MIN_FORM_MS = 3500 // минимум 3.5s на заполнение
const RATE_WINDOW_MS = 10 * 60_000 // 10 минут
const RATE_MAX_IP = 5 // макс. 5 заявок/IP за окно
const RATE_MAX_PHONE = 3 // макс. 3 заявки/телефон за окно
const DUP_TTL_MS = 15 * 60_000 // 15 минут дедуп

// ── in-memory (в проде внеси в Redis)
const ipBuckets = new Map<string, { hits: number; ts: number }>()
const phoneBuckets = new Map<string, { hits: number; ts: number }>()
const dedupe = new Map<string, number>()

// ── utils
function getIp(req: Request) {
  const xf = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xf || req.headers.get('cf-connecting-ip') || '0.0.0.0'
}
function rateOk(map: Map<string, { hits: number; ts: number }>, key: string, max: number) {
  const now = Date.now()
  const b = map.get(key)
  if (!b || now - b.ts > RATE_WINDOW_MS) {
    map.set(key, { hits: 1, ts: now })
    return true
  }
  b.hits++
  return b.hits <= max
}
function looksLikeBotUA(ua: string) {
  const s = (ua || '').toLowerCase()
  return /httpclient|python|curl|wget|postman|headless|crawler|spider|bot(?!.*bing)/.test(s)
}
function sameOrigin(req: Request) {
  // Проверяем Origin или Referer против SITE_URL
  const site = (process.env.SITE_URL || '').replace(/\/+$/, '')
  if (!site) return true // если переменная не задана — не валим
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''
  return origin.startsWith(site) || referer.startsWith(site)
}
function dedupeKey(body: any) {
  const { customer, items, subtotal } = body || {}
  const src = JSON.stringify({
    phone: String(customer?.phone || '').replace(/\D/g, ''),
    city: (customer?.city || '').trim().toLowerCase(),
    branch: String(customer?.branch || '')
      .trim()
      .toLowerCase(),
    items: (items || []).map((i: any) => [i.id, i.qty]),
    subtotal: Number(subtotal || 0)
  })
  return crypto.createHash('sha256').update(src).digest('hex')
}
function sanitizeNote(s?: string) {
  if (!s) return undefined
  let t = s.replace(/<[^>]+>/g, '')
  t = t.replace(/https?:\/\/\S+/g, '')
  t = t.slice(0, NOTE_MAX)
  return t || undefined
}

// ── схема
const UA_PHONE = z
  .string()
  .trim()
  .transform(v => v.replace(/\s|-/g, ''))
  .pipe(z.string().regex(/^\+380\d{9}$/, 'Невірний формат телефону (+380XXXXXXXXX)'))

const UA_CITY = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[А-Яа-яЇїІіЄєҐґ' \-]+$/u)

const BRANCH = z.union([
  z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^(Відділення|Поштомат)\s*№\s*\d+$/i),
  z
    .string()
    .trim()
    .regex(/^\d{1,6}$/)
])

const ItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  qty: z.number().int().min(1).max(999),
  lineTotal: z.number().min(0),
  image: z.string().optional(),
  variant: z.any().optional(),
  type: z.any().optional()
})

const PayloadSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(2).max(100),
    lastName: z.string().trim().min(2).max(100),
    phone: UA_PHONE,
    city: UA_CITY,
    branch: BRANCH
  }),
  paymentMethod: z.literal('cod'),
  note: z.string().optional(),
  items: z.array(ItemSchema).min(1),
  subtotal: z.number().min(0),
  source: z.string().url().optional(),
  eventId: z.string().min(8),
  antiSpam: z
    .object({
      hpCompany: z.string().optional(),
      formMs: z.number().optional()
    })
    .optional()
})

export async function POST(req: Request) {
  try {
    // 0) базовые отказы до парсинга
    const ua = req.headers.get('user-agent') || ''
    if (looksLikeBotUA(ua)) {
      return NextResponse.json({ ok: false, error: 'bot_ua' }, { status: 400 })
    }
    if (!sameOrigin(req)) {
      return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 })
    }

    // 1) rate-limit по IP
    const ip = getIp(req)
    if (!rateOk(ipBuckets, ip, RATE_MAX_IP)) {
      return NextResponse.json({ ok: false, error: 'rate_ip' }, { status: 429 })
    }

    // 2) валидация входа
    const json = await req.json().catch(() => null)
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
    }
    const body = parsed.data

    // 3) антиспам: honeypot + «человеческое» время
    if ((body.antiSpam?.hpCompany || '').trim()) {
      return NextResponse.json({ ok: false, error: 'honeypot' }, { status: 400 })
    }
    const formMs = Number(body.antiSpam?.formMs || 0)
    if (formMs > 0 && formMs < MIN_FORM_MS) {
      return NextResponse.json({ ok: false, error: 'too_fast' }, { status: 400 })
    }

    // 4) rate-limit по телефону
    const normPhone = body.customer.phone.replace(/\D/g, '')
    if (!rateOk(phoneBuckets, normPhone, RATE_MAX_PHONE)) {
      return NextResponse.json({ ok: false, error: 'rate_phone' }, { status: 429 })
    }

    // 5) дедуп на 15 минут
    const key = dedupeKey(body)
    const now = Date.now()
    const until = dedupe.get(key)
    if (until && until > now) {
      return NextResponse.json({ ok: false, error: 'duplicate' }, { status: 409 })
    }
    dedupe.set(key, now + DUP_TTL_MS)

    // 6) нормализация
    const c = body.customer
    const safeCustomer = {
      firstName: c.firstName.trim(),
      lastName: c.lastName.trim(),
      phone: c.phone.trim(),
      city: c.city.trim(),
      branch: c.branch.trim()
    }
    const source =
      body.source ||
      (process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/+$/, '')}/cart` : undefined)
    const note = sanitizeNote(body.note)

    console.log('[ORDER]', {
      ip,
      ua,
      customer: {
        fn: safeCustomer.firstName[0] + '***',
        ln: safeCustomer.lastName[0] + '***',
        phone: safeCustomer.phone.replace(/\D+/g, '').replace(/^(\d{3})\d+(..)$/, '$1***$2'),
        city: safeCustomer.city,
        branch: safeCustomer.branch
      },
      subtotal: body.subtotal
    })

    // 7) отправка
    const tgRes = await sendOrderToTelegram({
      ...(json as OrderPayload),
      note,
      customer: safeCustomer,
      source
    })
    const ok = !!tgRes
    if (!ok) console.error('[ORDER] TG FAIL')

    return NextResponse.json({ ok, telegramOk: ok }, { status: ok ? 200 : 500 })
  } catch (e) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
