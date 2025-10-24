// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

// ───────────────── schema ─────────────────
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
  antiSpam: z.object({ hpCompany: z.string().optional() }).optional()
})

function sanitizeNote(s?: string) {
  if (!s) return undefined
  let t = s.replace(/<[^>]+>/g, '')
  t = t.replace(/https?:\/\/\S+/g, '')
  return t.slice(0, 600) || undefined
}

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 })
    }
    const ct = (req.headers.get('content-type') || '').toLowerCase()
    if (!ct.startsWith('application/json')) {
      return NextResponse.json({ ok: false, error: 'bad_content_type' }, { status: 415 })
    }

    const json = await req.json().catch(() => null)
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 })
    }
    const body = parsed.data

    // единственная анти-бот проверка: если скрытое поле заполнено — отбой
    if ((body.antiSpam?.hpCompany || '').trim()) {
      return NextResponse.json({ ok: false, error: 'honeypot' }, { status: 400 })
    }

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
      customer: {
        fn: safeCustomer.firstName,
        ln: safeCustomer.lastName,
        phone: safeCustomer.phone,
        city: safeCustomer.city,
        branch: safeCustomer.branch
      },
      subtotal: body.subtotal
    })

    const ok = !!(await sendOrderToTelegram({
      ...(json as OrderPayload),
      note,
      customer: safeCustomer,
      source
    }))

    return NextResponse.json({ ok, telegramOk: ok }, { status: ok ? 200 : 500 })
  } catch (e) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
