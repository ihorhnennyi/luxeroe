// src/components/FacebookPixelTracker.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function FacebookPixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

    window.fbq('track', 'PageView')
  }, [pathname, searchParams])

  return null
}
