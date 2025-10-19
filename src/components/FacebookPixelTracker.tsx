'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function FacebookPixelTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || !('fbq' in window)) return
    // @ts-ignore — объявляем fbq на window динамически
    window.fbq?.('track', 'PageView')
  }, [pathname])

  return null
}
