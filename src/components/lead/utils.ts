export function normalizePhone(raw: string) {
  const s = raw.replace(/[^\d+]/g, '')

  if (s.startsWith('+')) return s
  if (s.startsWith('380')) return `+${s}`
  if (s.startsWith('80')) return `+3${s}`
  return s
}

export function isValidName(name: string) {
  return name.trim().length > 0
}

export function isValidPhone(phone: string) {
  const p = normalizePhone(phone)

  return /^\+\d{9,14}$/.test(p)
}

export async function postLead(url: string, payload: { name: string; phone: string }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`Lead request failed: ${res.status}`)
}
