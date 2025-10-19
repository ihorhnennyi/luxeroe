export type AddAction = {
  readonly kind: 'add'
  readonly items: ReadonlyArray<{ id: string; qty?: number }>
  readonly openCart?: boolean
}

export type BundleAction = {
  readonly kind: 'bundle'
  readonly id: string
  readonly title: string
  readonly price: number
  readonly image?: string
  readonly note?: string
  readonly openCart?: boolean
}

export type PromoSlide = {
  readonly eyebrow?: string
  readonly title: string
  readonly subtitle?: string
  readonly bullets?: ReadonlyArray<string>
  readonly imageSrc: string
  readonly imageAlt?: string
  readonly ctaText?: string
  readonly ctaHref?: string
  readonly price?: number
  readonly priceNote?: string
  readonly countdownTo?: string | Date
  readonly tags?: ReadonlyArray<string>
  readonly action?: AddAction | BundleAction
}
