export type PricedItem = {
  price: number
  qty: number
  promoFirstPrice?: number | null
  priceAfterFirst?: number | null
}

const normQty = (q: number) => (Number.isFinite(q) ? Math.max(0, Math.floor(q)) : 0)

const money = (n: number) => (Number.isFinite(n) ? n : 0)

export function unitPriceFor(it: PricedItem): number {
  const qty = normQty(it.qty)
  const base = money(it.price)
  if (it.promoFirstPrice == null) return base

  const after = money(it.priceAfterFirst ?? base)
  return qty <= 1 ? money(it.promoFirstPrice) : after
}

export function lineTotalFor(it: PricedItem): number {
  const qty = normQty(it.qty)
  const base = money(it.price)
  if (qty === 0) return 0

  if (it.promoFirstPrice == null) return base * qty

  const first = money(it.promoFirstPrice)
  const restPrice = money(it.priceAfterFirst ?? base)
  const restQty = Math.max(0, qty - 1)
  return first + restQty * restPrice
}

export function avgUnitPriceFor(it: PricedItem): number {
  const qty = normQty(it.qty)
  return qty ? lineTotalFor(it) / qty : 0
}
