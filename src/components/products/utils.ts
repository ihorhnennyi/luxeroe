import type { Product } from '@/types/product'

export function discountPct(price?: number, oldPrice?: number) {
  if (!price || !oldPrice || oldPrice <= price) return null
  const pct = Math.round((1 - price / oldPrice) * 100)
  return pct > 0 ? `-${pct}%` : null
}

export function badgeLabel(b?: Product['badge']) {
  switch (b) {
    case 'hit':
      return 'Хіт'
    case 'sale':
      return 'Знижка'
    case 'new':
      return 'Новинка'
    default:
      return null
  }
}
