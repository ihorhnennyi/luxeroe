// src/components/analytics/FbPageView.tsx
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function FbPageView() {
  const pathname = usePathname()
  const search = useSearchParams()?.toString()
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [pathname, search])
  return null
}
