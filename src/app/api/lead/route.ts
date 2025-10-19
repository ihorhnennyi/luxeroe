// src/app/api/lead/route.ts
import { sendLeadToTelegram } from '@/lib/telegram'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { name, phone } = (await req.json()) ?? {}

    const valid =
      typeof name === 'string' &&
      !!name.trim() &&
      typeof phone === 'string' &&
      /^\+?\d[\d\s-]{8,}$/.test(phone.trim())

    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 })
    }

    await sendLeadToTelegram({ name: name.trim(), phone: phone.trim() })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Lead error:', e)
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
