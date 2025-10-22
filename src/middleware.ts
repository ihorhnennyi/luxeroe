// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const res = NextResponse.next()

  // 1) Ставим lr_sid, если его нет
  let sid = req.cookies.get('lr_sid')?.value
  if (!sid) {
    sid = uuid()
    // ✅ Используем объектную сигнатуру и правильные типы
    res.cookies.set({
      name: 'lr_sid',
      value: sid,
      httpOnly: false, // нужно читать на клиенте для double-submit
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ⬅️ в нижнем регистре
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 год
    })
  }

  // 2) Жёсткие проверки для POST /api/order
  if (req.method === 'POST' && url.pathname === '/api/order') {
    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    if (/curl|wget|python|bot(?!.*bing)|postman|httpclient/.test(ua)) {
      return NextResponse.json({ ok: false, error: 'bot' }, { status: 400 })
    }
    const origin = req.headers.get('origin') || ''
    const referer = req.headers.get('referer') || ''
    const site = (process.env.SITE_URL || '').replace(/\/+$/, '')
    if (site && !(origin.startsWith(site) || referer.startsWith(site))) {
      return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 })
    }
    if (!sid) {
      return NextResponse.json({ ok: false, error: 'no_session' }, { status: 400 })
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
