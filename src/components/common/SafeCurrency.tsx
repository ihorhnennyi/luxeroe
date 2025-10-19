'use client'
import * as React from 'react'

type Props = {
  value?: number | null
  locale?: string
  currency?: string
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  as?: React.ElementType
} & React.ComponentPropsWithoutRef<'span'>

export default function SafeCurrency({
  value,
  locale = 'uk-UA',
  currency = 'UAH',
  maximumFractionDigits = 0,
  minimumFractionDigits,
  as: Tag = 'span',
  ...rest
}: Props) {
  const [txt, setTxt] = React.useState<string>('')

  React.useEffect(() => {
    const n = Number(value)
    if (!Number.isFinite(n)) {
      setTxt('—')
      return
    }
    try {
      const fmt = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits,
        ...(minimumFractionDigits != null ? { minimumFractionDigits } : {})
      })
      setTxt(fmt.format(n))
    } catch {
      setTxt(`${Math.round(n)} ₴`)
    }
  }, [value, locale, currency, maximumFractionDigits, minimumFractionDigits])

  const fallback = Number.isFinite(Number(value)) ? `${Math.round(Number(value))} ₴` : '—'

  return (
    <Tag suppressHydrationWarning {...rest}>
      {txt || fallback}
    </Tag>
  )
}
