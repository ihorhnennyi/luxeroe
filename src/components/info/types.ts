import type { DeliveryItem } from '@/data/deliveryPayment'
import type { SxProps } from '@mui/material'

export type AccentPalette = {
  amber: string // #F2C14E
  pumpkin: string // #E08E45
  russet: string // #B75C36
}

export type DeliveryPaymentSectionProps = {
  title?: string
  subtitle?: string
  items?: DeliveryItem[]
  accent?: Partial<AccentPalette>
  containerSx?: SxProps
}

export type DeliveryPaymentItemCardProps = {
  item: DeliveryItem
  accent: AccentPalette
  sx?: SxProps
}
