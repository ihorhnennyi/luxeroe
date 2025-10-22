// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

/* ───────────────── settings ───────────────── */
const NOTE_MAX = 600
const MIN_FORM_MS = 3500 // min time to fill form (ms)
const RATE_WINDOW_MS = 10 * 60_000 // 10 minutes
const RATE_MAX_IP = 5 // max orders per IP per window
const RATE_MAX_PHONE = 3 // max orders per phone per window
const RATE_MAX_FP = 3 // max orders per fingerprint (ip+ua+sid) per window
const DUP_TTL_MS = 15 * 60_000 // dedup hold time
const MAX_BODY_BYTES = 64 * 1024 // 64KB payload cap

/* ───────────────── in-memory stores (move to Redis in prod) ───────────────── */
const ipBuckets = new Map<string, { hits: number; ts: number }>()
const phoneBuckets = new Map<string, { hits: number; ts: number }>()
const fpBuckets = new Map<string, { hits: number; ts: number }>() // NEW
const dedupe = new Map<string, number>()
const bannedIp = new Set<string>([])
const bannedPhone = new Set<string>([])

// periodic cleanup
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of ipBuckets) if (now - v.ts > RATE_WINDOW_MS * 3) ipBuckets.delete(k)
  for (const [k, v] of phoneBuckets) if (now - v.ts > RATE_WINDOW_MS * 3) phoneBuckets.delete(k)
  for (const [k, v] of fpBuckets) if (now - v.ts > RATE_WINDOW_MS * 3) fpBuckets.delete(k)
  for (const [k, until] of dedupe) if (until < now) dedupe.delete(k)
}, 15 * 60_000).unref()

/* ───────────────── utils ───────────────── */
function getIp(req: Request) {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || '0.0.0.0'
  return '0.0.0.0'
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
function rateOkComposite(key: string, max: number) {
  // NEW
  const now = Date.now()
  const b = fpBuckets.get(key)
  if (!b || now - b.ts > RATE_WINDOW_MS) {
    fpBuckets.set(key, { hits: 1, ts: now })
    return true
  }
  b.hits++
  return b.hits <= max
}
function looksLikeBotUA(ua: string) {
  const s = (ua || '').toLowerCase()
  const bad =
    /httpclient|python|curl|wget|postman|headless|crawler|spider|httrack|go-http|java|libwww|scrapy|axios\/?\d|node-fetch|php|perl|ruby|powershell|masscan|sqlmap|nikto|python-requests|bot(?!.*bing)/.test(
      s
    )
  if (bad) return true
  return false
}
function sameOrigin(req: Request) {
  const site = (process.env.SITE_URL || '').replace(/\/+$/, '')
  if (!site) return true
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
function getCookie(req: Request, name: string) {
  // NEW
  const m = (req.headers.get('cookie') || '').match(
    new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]+)')
  )
  return m?.[1] || ''
}
function getSidFromCookie(req: Request) {
  // NEW
  return getCookie(req, 'lr_sid')
}
function getNonceFromCookie(req: Request) {
  // NEW
  return getCookie(req, 'lr_nonce')
}
function fpKey(ip: string, ua: string, sid: string) {
  // NEW
  const u = (ua || '').toLowerCase().slice(0, 80)
  return `${ip}|${u}|${sid || 'no-sid'}`
}
async function verifyTurnstile(token?: string, ip?: string) {
  if (!token || !process.env.CF_TURNSTILE_SECRET) return true
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body:
      `secret=${encodeURIComponent(process.env.CF_TURNSTILE_SECRET)}` +
      `&response=${encodeURIComponent(token)}` +
      (ip ? `&remoteip=${encodeURIComponent(ip)}` : '')
  }).catch(() => null)
  if (!res) return false
  const data = (await res.json().catch(() => ({}))) as any
  return !!data.success
}

/* ───────────────── schema ───────────────── */
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
      formMs: z.number().optional(),
      cfToken: z.string().optional(),
      nonce: z.string().min(10).max(128).optional() // NEW
    })
    .optional()
})

/* ───────────────── handler ───────────────── */
export async function POST(req: Request) {
  try {
    // pre-checks
    if (req.method !== 'POST') {
      return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 })
    }
    const ct = (req.headers.get('content-type') || '').toLowerCase()
    if (!ct.startsWith('application/json')) {
      return NextResponse.json({ ok: false, error: 'bad_content_type' }, { status: 415 })
    }
    const len = Number(req.headers.get('content-length') || '0')
    if (len > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
    }

    // 0) базовые отказы до парсинга
    const ua = req.headers.get('user-agent') || ''
    if (looksLikeBotUA(ua)) {
      return NextResponse.json({ ok: false, error: 'bot_ua' }, { status: 400 })
    }
    if (!sameOrigin(req)) {
      return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 })
    }

    // 1) rate-limit по IP (+ бан-лист)
    const ip = getIp(req)
    if (bannedIp.has(ip)) {
      return NextResponse.json({ ok: false, error: 'ip_banned' }, { status: 403 })
    }
    if (!rateOk(ipBuckets, ip, RATE_MAX_IP)) {
      return NextResponse.json({ ok: false, error: 'rate_ip' }, { status: 429 })
    }

    // 2) JSON + валидация
    const json = await req.json().catch(() => null)
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
    }
    const body = parsed.data

    // 2.1) композитный rate-limit: IP + UA + lr_sid
    const sid = getSidFromCookie(req)
    const fp = fpKey(ip, ua, sid)
    if (!rateOkComposite(fp, RATE_MAX_FP)) {
      return NextResponse.json({ ok: false, error: 'rate_fp' }, { status: 429 })
    }

    // 3) антиспам: honeypot + «человеческое» время + (опция) Turnstile + nonce
    if ((body.antiSpam?.hpCompany || '').trim()) {
      return NextResponse.json({ ok: false, error: 'honeypot' }, { status: 400 })
    }
    const formMs = Number(body.antiSpam?.formMs || 0)
    if (formMs > 0 && formMs < MIN_FORM_MS) {
      return NextResponse.json({ ok: false, error: 'too_fast' }, { status: 400 })
    }
    if (process.env.CF_TURNSTILE_SECRET) {
      const pass = await verifyTurnstile(body.antiSpam?.cfToken, ip)
      if (!pass) return NextResponse.json({ ok: false, error: 'captcha' }, { status: 400 })
    }

    // double-submit cookie: lr_nonce (cookie) must equal antiSpam.nonce
    const cookieNonce = getNonceFromCookie(req)
    const bodyNonce = body.antiSpam?.nonce || ''
    if (!cookieNonce || !bodyNonce || cookieNonce !== bodyNonce) {
      return NextResponse.json({ ok: false, error: 'nonce' }, { status: 400 })
    }

    // 4) rate-limit по телефону (+ бан-лист)
    const normPhone = body.customer.phone.replace(/\D/g, '')
    if (bannedPhone.has(normPhone)) {
      return NextResponse.json({ ok: false, error: 'phone_banned' }, { status: 403 })
    }
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

    // Сжигаем одноразовый nonce (чтобы нельзя было переиспользовать)
    const headers = new Headers()
    headers.append('Set-Cookie', 'lr_nonce=; Max-Age=0; Path=/; SameSite=Lax; Secure')

    return new NextResponse(JSON.stringify({ ok, telegramOk: ok }), {
      status: ok ? 200 : 500,
      headers
    })
  } catch (e) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
