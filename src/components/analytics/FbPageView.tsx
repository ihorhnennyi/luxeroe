// src/components/analytics/FbPageView.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function FbPageView() {
  const pathname = usePathname()
  const search = useSearchParams()?.toString()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // пропускаем самый первый рендер (PageView уже отправлен в layout.tsx)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [pathname, search])

  return null
}
