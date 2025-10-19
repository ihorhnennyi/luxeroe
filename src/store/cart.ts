'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type BundleItem = { id: string; qty: number }

export type CartItem = {
  id: string
  title: string
  price: number
  image?: string | null
  variant?: string
  qty: number

  type?: 'single' | 'bundle'

  promoFirstPrice?: number
  priceAfterFirst?: number

  bundle?: { items: BundleItem[]; note?: string }
  lockQty?: boolean
  maxQty?: number
  promoLimitQty?: number
}

type CartState = {
  items: CartItem[]

  isOpen: boolean

  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  remove: (id: string, variant?: string) => void
  inc: (id: string, variant?: string) => void
  dec: (id: string, variant?: string) => void

  setItemQty: (id: string, variant: string | undefined, qty: number) => void
  clear: () => void

  open: () => void
  close: () => void
  setOpen: (v: boolean) => void
}

const STORAGE_KEY = 'cart-v2'
const MAX_QTY_DEFAULT = 10

const makeKey = (id: string, variant?: string) => `${id}__${variant ?? ''}`
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function computeMaxQty(incoming: Omit<CartItem, 'qty'> & { qty?: number }): number {
  const isBundle = incoming.type === 'bundle'
  let baseMax = incoming.maxQty ?? (isBundle ? 1 : MAX_QTY_DEFAULT)

  if (typeof incoming.promoLimitQty === 'number') {
    baseMax = Math.min(baseMax, Math.max(1, incoming.promoLimitQty))
  }
  return Math.max(1, baseMax)
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: incoming =>
        set(s => {
          const idx = s.items.findIndex(
            it => makeKey(it.id, it.variant) === makeKey(incoming.id, incoming.variant)
          )

          const isBundle = incoming.type === 'bundle'
          const maxQty = computeMaxQty(incoming)
          const addQty = Math.max(1, incoming.qty ?? 1)

          if (idx >= 0) {
            const next = [...s.items]
            const cur = next[idx]

            const effMax = Math.min(cur.maxQty ?? maxQty, maxQty)
            const nextQty = clamp(cur.qty + addQty, 1, effMax)

            next[idx] = {
              ...cur,
              qty: nextQty,
              lockQty:
                cur.lockQty === true
                  ? true
                  : isBundle || (incoming.promoLimitQty != null && effMax === 1),
              maxQty: effMax,
              promoLimitQty: incoming.promoLimitQty ?? cur.promoLimitQty
            }

            return { items: next, isOpen: true }
          }

          return {
            items: [
              {
                ...incoming,
                type: incoming.type ?? 'single',
                qty: clamp(addQty, 1, maxQty),
                lockQty:
                  incoming.lockQty === true
                    ? true
                    : isBundle || (incoming.promoLimitQty != null && maxQty === 1),
                maxQty
              },
              ...s.items
            ],
            isOpen: true
          }
        }),

      remove: (id, variant) =>
        set(s => ({
          items: s.items.filter(it => makeKey(it.id, it.variant) !== makeKey(id, variant))
        })),

      inc: (id, variant) =>
        set(s => ({
          items: s.items.map(it => {
            if (makeKey(it.id, it.variant) !== makeKey(id, variant)) return it
            if (it.lockQty) return it

            const promoCap =
              typeof it.promoLimitQty === 'number' ? Math.max(1, it.promoLimitQty) : MAX_QTY_DEFAULT

            const hardMax = it.maxQty ?? MAX_QTY_DEFAULT
            const max = Math.min(hardMax, promoCap)

            return { ...it, qty: clamp(it.qty + 1, 1, max) }
          })
        })),

      dec: (id, variant) =>
        set(s => ({
          items: s.items
            .map(it => {
              if (makeKey(it.id, it.variant) !== makeKey(id, variant)) return it
              if (it.lockQty) return it
              return { ...it, qty: clamp(it.qty - 1, 1, it.maxQty ?? MAX_QTY_DEFAULT) }
            })
            .filter(it => it.qty > 0)
        })),

      setItemQty: (id, variant, qty) =>
        set(s => ({
          items: s.items.map(it => {
            if (makeKey(it.id, it.variant) !== makeKey(id, variant)) return it
            if (it.lockQty) return it

            const promoCap =
              typeof it.promoLimitQty === 'number' ? Math.max(1, it.promoLimitQty) : MAX_QTY_DEFAULT
            const hardMax = it.maxQty ?? MAX_QTY_DEFAULT
            const max = Math.min(hardMax, promoCap)

            return { ...it, qty: clamp(Math.round(qty || 1), 1, max) }
          })
        })),

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: v => set({ isOpen: v })
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({ items: state.items }),
      migrate: (persisted, from) => {
        if (from < 2 && persisted && Array.isArray((persisted as any).items)) {
          return { items: (persisted as any).items }
        }
        return persisted as any
      }
    }
  )
)
