declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export function fbqTrack(event: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params || {})
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[fbqTrack] suppressed error:', err)
    }
  }
}
