import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { __consume, __sessionOk } from '../anti/token/route'

export const runtime = 'nodejs'

// ───────── настройки ─────────
const RATE_LIMIT = { windowMs: 10 * 60_000, maxIp: 2, maxPhone: 2 } // 2 заявки/10мин
const DUP_TTL_MS = 15 * 60_000
const MIN_FORM_MS = 4000
const NOTE_MAX = 600

// in-memory
const ipBuckets = new Map<string, { hits: number; ts: number }>()
const phoneBuckets = new Map<string, { hits: number; ts: number }>()
const dedupeTtl = new Map<string, number>()

// ───────── утилиты ─────────
function getIp(req: Request) {
  const xf = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xf || req.headers.get('cf-connecting-ip') || '0.0.0.0'
}
function rateLimitOkIp(ip: string) {
  const n = Date.now()
  const b = ipBuckets.get(ip)
  if (!b || n - b.ts > RATE_LIMIT.windowMs) {
    ipBuckets.set(ip, { hits: 1, ts: n })
    return true
  }
  b.hits++
  return b.hits <= RATE_LIMIT.maxIp
}
function rateLimitOkPhone(p: string) {
  const n = Date.now()
  const b = phoneBuckets.get(p)
  if (!b || n - b.ts > RATE_LIMIT.windowMs) {
    phoneBuckets.set(p, { hits: 1, ts: n })
    return true
  }
  b.hits++
  return b.hits <= RATE_LIMIT.maxPhone
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
  const s = (ua || '').toLowerCase()
  return /headless|crawler|spider|httpclient|python|curl|wget|postman|bot(?!.*bing)/.test(s)
}
function sameOrigin(req: Request) {
  const ref = req.headers.get('referer') || ''
  const site = (process.env.SITE_URL || '').replace(/\/+$/, '')
  if (!site) return true
  return ref.startsWith(site)
}
function hmac(data: string) {
  const secret = process.env.FORM_SIGN_SECRET
  if (!secret) throw new Error('FORM_SIGN_SECRET is not set')
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

// ───────── схема входа ─────────
const UA_PHONE = z
  .string()
  .trim()
  .transform(v => v.replace(/\s|-/g, '')) // нормализуем
  .pipe(z.string().regex(/^\+380\d{9}$/, 'Невірний формат телефону (+380XXXXXXXXX)'))

const UA_CITY = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[А-Яа-яЇїІіЄєҐґ' \-]+$/u)

const BRANCH = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^(Відділення|Поштомат)\s*№\s*\d+/i)

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
      startedAt: z.number().optional(),
      clientNonce: z.string().optional(),
      formMs: z.number().optional(),
      formToken: z.string().optional(),
      signature: z.string().optional(),
      // Proof-of-Work:
      powNonce: z.number().int().nonnegative().optional(),
      powHash: z.string().optional()
    })
    .optional()
})

function sanitizeNote(s?: string) {
  if (!s) return undefined
  let t = s.replace(/<[^>]+>/g, '')
  t = t.replace(/https?:\/\/\S+/g, '')
  t = t.slice(0, NOTE_MAX)
  return t || undefined
}

// ───────── обработчик ─────────
export async function POST(req: Request) {
  try {
    const ua = req.headers.get('user-agent') || ''
    if (looksLikeBotUA(ua))
      return NextResponse.json({ ok: false, error: 'bot_ua' }, { status: 400 })
    if (!sameOrigin(req))
      return NextResponse.json({ ok: false, error: 'bad_referer' }, { status: 403 })

    const ip = getIp(req)
    if (!rateLimitOkIp(ip))
      return NextResponse.json({ ok: false, error: 'rate_limited_ip' }, { status: 429 })

    const json = await req.json().catch(() => null)
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success)
      return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
    const body = parsed.data

    // 1) form-token + cookie-сессия + одноразовость + привязка UA/IP
    const ft = body.antiSpam?.formToken || ''
    const sig = body.antiSpam?.signature || ''
    const sid = (req.headers.get('cookie') || '').match(/(?:^|;)\s*form_sid=([^;]+)/)?.[1] || ''
    if (!ft || !sig || !sid)
      return NextResponse.json({ ok: false, error: 'no_token' }, { status: 403 })

    let token: { sid: string; exp: number; ua: string; ip: string; diff: number }
    let payloadStr = ''
    try {
      payloadStr = Buffer.from(ft, 'base64').toString('utf8')
      if (hmac(payloadStr) !== sig)
        return NextResponse.json({ ok: false, error: 'bad_token' }, { status: 403 })
      token = JSON.parse(payloadStr)
    } catch {
      return NextResponse.json({ ok: false, error: 'bad_token' }, { status: 403 })
    }

    if (Date.now() > token.exp)
      return NextResponse.json({ ok: false, error: 'token_expired' }, { status: 403 })
    if (token.sid !== sid || !__sessionOk(sid))
      return NextResponse.json({ ok: false, error: 'no_session' }, { status: 403 })
    if (token.ua !== ua || token.ip !== ip)
      return NextResponse.json({ ok: false, error: 'token_mismatch' }, { status: 403 })
    if (!__consume(sig))
      return NextResponse.json({ ok: false, error: 'token_used' }, { status: 409 })

    // 2) Proof-of-Work
    const powNonce = body.antiSpam?.powNonce
    const powHash = body.antiSpam?.powHash
    if (typeof powNonce !== 'number' || typeof powHash !== 'string')
      return NextResponse.json({ ok: false, error: 'pow_missing' }, { status: 403 })
    const expected = crypto
      .createHash('sha256')
      .update(`${payloadStr}:${powNonce}`, 'utf8')
      .digest('hex')
    const prefix = '0'.repeat(Math.max(1, token.diff || 5))
    if (expected !== powHash || !powHash.startsWith(prefix))
      return NextResponse.json({ ok: false, error: 'pow_bad' }, { status: 403 })

    // 3) honeypot + «человеческое время»
    const hp = (body.antiSpam?.hpCompany || '').trim()
    if (hp) return NextResponse.json({ ok: false, error: 'honeypot' }, { status: 400 })
    const elapsed = body.antiSpam?.formMs ?? 0
    const startedAt = body.antiSpam?.startedAt ?? 0
    if (startedAt > 0 && elapsed < MIN_FORM_MS)
      return NextResponse.json({ ok: false, error: 'too_fast' }, { status: 400 })

    // 4) лимит по телефону (и базовая проверка префикса)
    const normPhone = body.customer.phone.replace(/\D/g, '')
    const uaPrefixes = new Set([
      '039',
      '050',
      '063',
      '066',
      '067',
      '068',
      '073',
      '091',
      '092',
      '093',
      '094',
      '095',
      '096',
      '097',
      '098',
      '099'
    ])
    if (!uaPrefixes.has(normPhone.slice(3, 6)))
      return NextResponse.json({ ok: false, error: 'bad_phone_prefix' }, { status: 400 })
    if (!rateLimitOkPhone(normPhone))
      return NextResponse.json({ ok: false, error: 'rate_limited_phone' }, { status: 429 })

    // 5) дедуп на 15 минут
    const key = dedupeKey(body)
    const now = Date.now()
    const until = dedupeTtl.get(key)
    if (until && until > now)
      return NextResponse.json({ ok: false, error: 'duplicate' }, { status: 409 })
    dedupeTtl.set(key, now + DUP_TTL_MS)

    // нормализация
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
      }
    })

    const tgRes = await sendOrderToTelegram({
      ...(json as OrderPayload),
      note,
      customer: safeCustomer,
      source
    })
    const ok = !!tgRes
    if (!ok) console.error('[ORDER] TG FAIL')
    return NextResponse.json({ ok, telegramOk: ok }, { status: ok ? 200 : 500 })
  } catch (e: any) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
