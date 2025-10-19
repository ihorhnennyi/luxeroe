'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import AddToCartAlert, { type AlertItem } from './AddToCartAlert'
import { CART_ITEM_ADDED_EVENT } from './constants'

export default function AddToCartAlertHost() {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<AlertItem | null>(null)

  const pushingRef = useRef(false)
  const router = useRouter()

  const onItemAdded = useCallback((e: Event) => {
    const ce = e as CustomEvent<AlertItem | undefined>
    if (!ce?.detail) return
    setItem(ce.detail)
    setOpen(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener(CART_ITEM_ADDED_EVENT, onItemAdded as EventListener, { passive: true })
    return () => window.removeEventListener(CART_ITEM_ADDED_EVENT, onItemAdded as EventListener)
  }, [onItemAdded])

  const handleCheckout = useCallback(() => {
    if (pushingRef.current) return
    pushingRef.current = true
    setOpen(false)
    // Навигация после закрытия диалога
    setTimeout(() => {
      router.push('/cart')
      pushingRef.current = false
    }, 0)
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
