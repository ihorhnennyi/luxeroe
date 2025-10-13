// src/components/cart/AddToCartAlertHost.tsx
'use client'

import { fbqTrack } from '@/lib/fb' // безопасный fbq
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import AddToCartAlert, { type AlertItem } from './AddToCartAlert'

export default function AddToCartAlertHost() {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<AlertItem | null>(null)
  const router = useRouter()
  const pushingRef = useRef(false) // защита от повторного пуша

  const onEvent = useCallback((e: Event) => {
    const ce = e as CustomEvent<AlertItem>
    if (!ce.detail) return
    setItem(ce.detail)
    setOpen(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('cart:item_added', onEvent as EventListener)
    return () => window.removeEventListener('cart:item_added', onEvent as EventListener)
  }, [onEvent])

  const handleCheckout = useCallback(() => {
    if (pushingRef.current) return
    pushingRef.current = true

    setOpen(false)

    // fbq: InitiateCheckout — но без риска сломать UX
    const qty = Math.max(1, item?.qty ?? 1)
    const unit = item?.promoFirstPrice ?? item?.price ?? 0

    try {
      fbqTrack('InitiateCheckout', {
        num_items: qty,
        value: unit * qty,
        currency: 'UAH',
        contents: item ? [{ id: item.id, quantity: qty, item_price: unit }] : undefined,
        content_type: 'product'
      })
    } finally {
      // Даем диалогу закрыться и *в любом случае* идем на корзину
      setTimeout(() => {
        router.push('/cart')
        // отпускаем флаг после навигации
        pushingRef.current = false
      }, 0)
    }
  }, [item, router])

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
