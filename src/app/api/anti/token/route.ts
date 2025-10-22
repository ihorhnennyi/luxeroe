// src/app/api/anti/token/route.ts
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const TOKEN_TTL_MS = 2 * 60_000 // токен живёт 2 минуты

function hmac(data: string) {
  const secret = process.env.FORM_SIGN_SECRET
  if (!secret) throw new Error('FORM_SIGN_SECRET is not set')

  return crypto
    .createHmac('sha256', secret) // ← алгоритм указывается здесь
    .update(data)
    .digest('hex') // ← тут только формат вывода (hex)
}

function getIp(req: Request) {
  const xf = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xf || req.headers.get('cf-connecting-ip') || ''
}

export async function GET(req: Request) {
  const now = Date.now()
  const ua = req.headers.get('user-agent') || ''
  const ip = getIp(req)

  const payload = JSON.stringify({
    exp: now + TOKEN_TTL_MS,
    rnd: crypto.randomBytes(8).toString('hex'),
    ua,
    ip
  })

  const signature = hmac(payload)
  return NextResponse.json({
    ok: true,
    formToken: Buffer.from(payload).toString('base64'),
    signature
  })
}
