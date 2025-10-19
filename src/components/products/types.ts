import type { ReactNode } from 'react'

export type SpecLineProps = {
  label: string
  value?: ReactNode
  color?: string
}

export type PromoProductData = {
  title: string
  image: string
  banner?: string
  attrs: Array<{ label: string; value: ReactNode; color?: string }>
  netWeight?: string
  price?: number
  oldPrice?: number
  cta?: string
}
