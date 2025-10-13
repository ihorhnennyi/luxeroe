// src/components/cart/AddToCartAlertHost.tsx
'use client'

import { fbqTrack } from '@/lib/fb' // ⬅️ fbq утилита
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import AddToCartAlert, { type AlertItem } from './AddToCartAlert'

export default function AddToCartAlertHost() {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<AlertItem | null>(null)
  const router = useRouter()

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

  return (
    <AddToCartAlert
      open={open}
      item={item}
      onClose={() => setOpen(false)}
      onContinue={() => setOpen(false)}
      onCheckout={() => {
        setOpen(false)

        // ⬇️ fbq: InitiateCheckout — фиксируем начало оформления из алерта
        const qty = Math.max(1, item?.qty ?? 1)
        const unit = item?.promoFirstPrice ?? item?.price ?? 0
        fbqTrack('InitiateCheckout', {
          num_items: qty,
          value: unit * qty,
          currency: 'UAH',
          contents: item ? [{ id: item.id, quantity: qty, item_price: unit }] : undefined,
          content_type: 'product'
        })

        router.push('/cart')
      }}
    />
  )
}
