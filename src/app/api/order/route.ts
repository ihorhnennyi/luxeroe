// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from '@/lib/telegram'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderPayload

    // ---- валидация входа ----
    const c = body?.customer
    const phone = (c?.phone ?? '').trim()
    const valid =
      !!c?.firstName?.trim() &&
      !!c?.lastName?.trim() &&
      /^\+?\d[\d\s-]{8,}$/.test(phone) &&
      !!c?.city?.trim() &&
      !!c?.branch?.trim() &&
      Array.isArray(body?.items) &&
      body.items.length > 0

    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 })
    }

    // ---- нормализация ----
    const safeCustomer = {
      firstName: c.firstName.trim(),
      lastName: c.lastName.trim(),
      phone,
      city: c.city.trim(),
      branch: c.branch.trim()
    }

    const source =
      body.source || (process.env.SITE_URL ? `${process.env.SITE_URL}/cart` : undefined)

    // обезличенный лог
    console.log('[ORDER] incoming', {
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
      }
    })

    // ---- отправка только в Telegram ----
    const tgRes = await sendOrderToTelegram({ ...body, customer: safeCustomer, source })
    const tgOk = !!tgRes

    if (!tgOk) console.error('[ORDER] TG FAIL')

    return NextResponse.json({
      ok: tgOk,
      telegramOk: tgOk
    })
  } catch (e: any) {
    console.error('Order error:', e)
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
