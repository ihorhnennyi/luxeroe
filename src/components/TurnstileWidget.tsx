'use client'
import { useEffect, useRef } from 'react'

export default function TurnstileWidget({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const w = window as any
    const render = () =>
      w.turnstile?.render(ref.current!, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
        callback: (t: string) => onToken(t),
        'refresh-expired': 'auto'
      })
    if (!w.turnstile) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.onload = render
      document.head.appendChild(s)
    } else render()
  }, [onToken])

  return <div ref={ref} />
}
