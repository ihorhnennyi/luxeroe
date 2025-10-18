// src/components/cart/AddToCartAlertHost.tsx
'use client'

import { fbqTrack } from '@/lib/fb'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import AddToCartAlert, { type AlertItem } from './AddToCartAlert'

const EVENT_NAME = 'cart:item_added'

export default function AddToCartAlertHost() {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<AlertItem | null>(null)

  const itemRef = useRef<AlertItem | null>(null) // всегда актуальный айтем
  const pushingRef = useRef(false) // защита от повторных переходов
  const mountedRef = useRef(false) // не трекаем до маунта
  const router = useRouter()

  // единый обработчик CustomEvent
  const onItemAdded = useCallback((e: Event) => {
    const ce = e as CustomEvent<AlertItem | undefined>
    const detail = ce?.detail
    if (!detail) return
    itemRef.current = detail
    setItem(detail)
    setOpen(true)
  }, [])

  // подписка/отписка на глобальное событие
  useEffect(() => {
    mountedRef.current = true
    if (typeof window === 'undefined') return

    window.addEventListener(EVENT_NAME, onItemAdded as EventListener, { passive: true })

    return () => {
      mountedRef.current = false

      window.removeEventListener(EVENT_NAME, onItemAdded as EventListener)
    }
  }, [onItemAdded])

  // переход в корзину + fbq InitiateCheckout
  const handleCheckout = useCallback(() => {
    if (pushingRef.current) return
    pushingRef.current = true
    setOpen(false)

    const it = itemRef.current
    const qty = Math.max(1, it?.qty ?? 1)
    const unit = it?.promoFirstPrice ?? it?.price ?? 0

    try {
      // безопасная отправка: fbqTrack сам проглотит ошибки/отсутствие fbq
      fbqTrack('InitiateCheckout', {
        num_items: qty,
        value: unit * qty,
        currency: 'UAH',
        contents: it ? [{ id: it.id, quantity: qty, item_price: unit }] : undefined,
        content_type: it ? 'product' : undefined
      })
    } finally {
      // даём модалке закрыться и делаем навигацию
      setTimeout(() => {
        router.push('/cart')
        pushingRef.current = false
      }, 0)
    }
  }, [router])

  return (
    <AddToCartAlert
      open={open}
      item={item}
      onClose={() => setOpen(false)}
      onContinue={() => setOpen(false)}
      onCheckout={handleCheckout}
    />
  )
}
