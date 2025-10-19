// src/lib/fb.ts
/** Безопасный вызов fbq — не падает на SSR и когда пиксель ещё не подгрузился */
export function fbqTrack(event: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const fbq = (window as any).fbq as undefined | ((...a: any[]) => void)
  if (!fbq) return
  if (params) fbq('track', event, params)
  else fbq('track', event)
}
