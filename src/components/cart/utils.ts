// Набор утилит для корзины (валюта и т.п.)
const UAH_FMT =
  typeof Intl !== 'undefined'
    ? new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        maximumFractionDigits: 0
      })
    : null

export function formatUAH(n: number) {
  try {
    return UAH_FMT ? UAH_FMT.format(n) : `${Math.round(n)} ₴`
  } catch {
    return `${Math.round(n)} ₴`
  }
}
