export type CartAddedPayload = Readonly<{
  id: string
  title: string
  image?: string
  variant?: string
  qty?: number
  price: number
  promoFirstPrice?: number
}>

export function emitCartAdded(payload: CartAddedPayload) {
  if (typeof window === 'undefined') return
  try {
    const event = new CustomEvent<CartAddedPayload>('cart:item_added', { detail: payload })
    window.dispatchEvent(event)
  } catch (e) {
    console.warn('[emitCartAdded] failed to dispatch', e)
  }
}
