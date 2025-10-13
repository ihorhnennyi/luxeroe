declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export function fbqTrack(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params || {})
  }
}
