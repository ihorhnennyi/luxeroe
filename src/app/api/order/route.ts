// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

// ───────────────── антибот/антиспам настройки ─────────────────
const RATE_LIMIT = { windowMs: 10 * 60_000, max: 2 } // 8 заявок / 10 мин на IP
const DUP_TTL_MS = 15 * 60_000 // 15 мин на «похожий» заказ
const MIN_FORM_MS = 4000 // минимум «человеческого» времени
const NOTE_MAX = 600 // максимум символов в note

// in-memory (для VPS/PM2 ок; прод — лучше Redis)
const ipBuckets = new Map<string, { hits: number; ts: number }>()
const dedupeTtl = new Map<string, number>()

// ───────────────── утилиты ─────────────────
function getIp(req: Request) {
  const xf = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xf || req.headers.get('cf-connecting-ip') || '0.0.0.0'
}

function rateLimitOk(ip: string) {
  const now = Date.now()
  const bucket = ipBuckets.get(ip)
  if (!bucket || now - bucket.ts > RATE_LIMIT.windowMs) {
    ipBuckets.set(ip, { hits: 1, ts: now })
    return true
  }
  bucket.hits++
  return bucket.hits <= RATE_LIMIT.max
}

function dedupeKey(input: any) {
  const { customer, items, subtotal } = input
  const src = JSON.stringify({
    phone: String(customer?.phone || '').replace(/\D/g, ''),
    city: (customer?.city || '').trim().toLowerCase(),
    branch: (customer?.branch || '').trim().toLowerCase(),
    items: (items || []).map((i: any) => [i.id, i.qty]),
    subtotal: Number(subtotal || 0)
  })
  return crypto.createHash('sha256').update(src).digest('hex')
}

function looksLikeBotUA(ua: string) {
  const s = ua.toLowerCase()
  return /headless|crawler|spider|httpclient|python|curl|wget|postman|bot(?!.*bing)/.test(s)
}

function sameOrigin(req: Request) {
  const ref = req.headers.get('referer') || ''
  const site = (process.env.SITE_URL || '').replace(/\/+$/, '')
  if (!site) return true // если SITE_URL не задан — пропускаем проверку
  return ref.startsWith(site)
}

// ───────────────── схема валидации ─────────────────
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
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d[\d\s-]{8,}$/),
    city: z.string().trim().min(1).max(120),
    branch: z.string().trim().min(1).max(160)
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
      startedAt: z.number().optional(),
      clientNonce: z.string().optional(),
      formMs: z.number().optional(),
      captcha: z.string().optional() // если решишь подключить Turnstile
    })
    .optional()
})

function sanitizeNote(s: string | undefined) {
  if (!s) return undefined
  let t = s.replace(/<[^>]+>/g, '') // убираем HTML
  t = t.replace(/https?:\/\/\S+/g, '') // убираем ссылки
  t = t.slice(0, NOTE_MAX) // ограничиваем длину
  return t || undefined
}

export async function POST(req: Request) {
  try {
    // Базовая защита до чтения body
    const ua = req.headers.get('user-agent') || ''
    if (looksLikeBotUA(ua)) {
      return NextResponse.json({ ok: false, error: 'bot_ua' }, { status: 400 })
    }
    if (!sameOrigin(req)) {
      return NextResponse.json({ ok: false, error: 'bad_referer' }, { status: 403 })
    }

    const ip = getIp(req)
    if (!rateLimitOk(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    const json = await req.json().catch(() => null)
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
    }

    const body = parsed.data

    // Антиспам-проверки
    const hp = body.antiSpam?.hpCompany?.trim() || ''
    if (hp.length > 0) {
      return NextResponse.json({ ok: false, error: 'honeypot' }, { status: 400 })
    }

    const elapsed = body.antiSpam?.formMs ?? 0
    const startedAt = body.antiSpam?.startedAt ?? 0
    if (startedAt > 0 && elapsed < MIN_FORM_MS) {
      return NextResponse.json({ ok: false, error: 'too_fast' }, { status: 400 })
    }

    // (Опционально) Turnstile/hCaptcha/recaptcha проверка:
    // if (process.env.TURNSTILE_SECRET_KEY) { ...verify... }

    // Дедупликат
    const key = dedupeKey(body)
    const now = Date.now()
    const until = dedupeTtl.get(key)
    if (until && until > now) {
      return NextResponse.json({ ok: false, error: 'duplicate' }, { status: 409 })
    }
    dedupeTtl.set(key, now + DUP_TTL_MS)

    // Нормализация
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

    // Обезличенный лог
    console.log('[ORDER] incoming', {
      ua,
      ip,
      items: body.items.map(i => ({
        id: i.id,
        qty: i.qty,
        lineTotal: i.lineTotal,
        type: (i as any).type
      })),
      customer: {
        firstName: safeCustomer.firstName[0] + '***',
        lastName: safeCustomer.lastName[0] + '***',
        phone: safeCustomer.phone.replace(/\D+/g, '').replace(/^(\d{3})\d+(..)$/, '$1***$2'),
        city: safeCustomer.city,
        branch: safeCustomer.branch
      },
      anti: {
        elapsed,
        hasNonce: !!body.antiSpam?.clientNonce
      }
    })

    // Отправка в Telegram (как и было)
    const tgRes = await sendOrderToTelegram({
      ...(body as OrderPayload),
      note,
      customer: safeCustomer,
      source
    })

    const tgOk = !!tgRes
    if (!tgOk) console.error('[ORDER] TG FAIL')

    return NextResponse.json({ ok: tgOk, telegramOk: tgOk }, { status: tgOk ? 200 : 500 })
  } catch (e: any) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
