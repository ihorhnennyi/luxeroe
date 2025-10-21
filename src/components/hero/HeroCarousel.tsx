'use client'

import type { PromoSlide } from '@/types/promo'
import { useEffect, useRef, useState } from 'react'
import HeroPromo from './HeroPromo'

type Slide = PromoSlide & { onAction?: () => void }

export default function HeroCarousel({
  slides,
  interval = 15000
}: {
  slides: Slide[]
  interval?: number
}) {
  const [i, setI] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || slides.length <= 1) return

    let id: ReturnType<typeof setInterval> | undefined
    const tick = () => setI(p => (p + 1) % slides.length)

    const clear = () => {
      if (id) clearInterval(id)
      id = undefined
    }
    const start = () => {
      clear()
      id = setInterval(() => visibleRef.current && tick(), interval)
    }

    // Пауза при скрытии вкладки
    const onVisibility = () => {
      if (document.hidden) {
        visibleRef.current = false
        clear()
      } else {
        visibleRef.current = true
        start()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Пауза, если сам блок вне вьюпорта
    let obs: IntersectionObserver | undefined
    if (rootRef.current && 'IntersectionObserver' in window) {
      obs = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = !!entry?.isIntersecting
        },
        { threshold: 0.1 }
      )
      obs.observe(rootRef.current)
    }

    start()
    return () => {
      clear()
      document.removeEventListener('visibilitychange', onVisibility)
      obs?.disconnect()
    }
  }, [slides.length, interval])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {slides.map((s, idx) => {
        const active = idx === i
        return (
          <div
            key={idx}
            style={{
              position: active ? 'relative' : 'absolute',
              inset: 0,
              opacity: active ? 1 : 0,
              transition: 'opacity .5s ease',
              pointerEvents: active ? 'auto' : 'none',
              visibility: active ? 'visible' : 'hidden',
              zIndex: active ? 1 : 0
            }}
            aria-hidden={!active}
          >
            <HeroPromo {...s} imagePriority={idx === 0} />
          </div>
        )
      })}
    </div>
  )
}
