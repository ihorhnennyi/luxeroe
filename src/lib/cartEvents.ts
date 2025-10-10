export type CartAddedPayload = {
  id: string
  title: string
  image?: string
  variant?: string
  qty?: number
  price: number
  promoFirstPrice?: number
}

export function emitCartAdded(payload: CartAddedPayload) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('cart:item_added', { detail: payload }))
}
