import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.method === 'POST' && req.nextUrl.pathname === '/api/order') {
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
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/order']
}
