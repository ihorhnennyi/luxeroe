export type ReviewItem = {
  src: string
  author?: string
  note?: string
}

export type ReviewsGridBreakpoints = {
  xs?: number
  sm?: number
  md?: number
}

export type ReviewsSectionProps = {
  items: ReviewItem[]
  ctaHref?: string
  ctaLabel?: string
  hideBackground?: boolean
  title?: string
  subtitle?: string
  maxItems?: number
  grid?: ReviewsGridBreakpoints
  amberHex?: string
  sx?: import('@mui/material').SxProps
}
