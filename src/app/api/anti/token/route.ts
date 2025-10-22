import crypto from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const TOKEN_TTL_MS = 2 * 60_000 // 2 минуты

// in-memory; для прод-кластера вынести в Redis
const sessions = new Map<string, number>() // sid -> exp
const issued = new Set<string>() // одноразовые подписи (sig)

function hmac(data: string) {
  const secret = process.env.FORM_SIGN_SECRET
  if (!secret) throw new Error('FORM_SIGN_SECRET is not set')
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}
function getIp(req: Request) {
  const xf = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return xf || req.headers.get('cf-connecting-ip') || ''
}
function makeSid() {
  return crypto.randomBytes(16).toString('hex')
}
function chooseDifficulty(ip: string) {
  // можно повышать при частых запросах/IP; базово 5 нулей
  return 3
}

export async function GET(req: Request) {
  const now = Date.now()
  const ua = req.headers.get('user-agent') || ''
  const ip = getIp(req)

  const cookieSid = (req.headers.get('cookie') || '').match(/(?:^|;)\s*form_sid=([^;]+)/)?.[1]
  const sid = cookieSid || makeSid()
  sessions.set(sid, now + TOKEN_TTL_MS)

  const payload = JSON.stringify({
    sid,
    exp: now + TOKEN_TTL_MS,
    rnd: crypto.randomBytes(8).toString('hex'),
    ua,
    ip,
    diff: chooseDifficulty(ip) // сложность PoW
  })
  const signature = hmac(payload)
  issued.add(signature)

  const res = NextResponse.json({
    ok: true,
    formToken: Buffer.from(payload).toString('base64'),
    signature
  })
  res.headers.append(
    'Set-Cookie',
    `form_sid=${sid}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${Math.floor(
      TOKEN_TTL_MS / 1000
    )}`
  )
  return res
}

// вспомогалки для /api/order
export function __sessionOk(sid: string) {
  const e = sessions.get(sid)
  return !!e && Date.now() < e
}
export function __consume(sig: string) {
  return issued.delete(sig) // одноразовый
}
