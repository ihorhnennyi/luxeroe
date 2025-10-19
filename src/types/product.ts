export type Product = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly image?: string
  readonly price: number
  readonly oldPrice?: number
  readonly badge?: 'new' | 'hit' | 'sale'
  readonly inStock?: boolean
  readonly weightOptions?: ReadonlyArray<string>
  readonly description?: {
    readonly consistency?: string
    readonly size?: string
    readonly color?: string
    readonly container?: string
    readonly storage?: string
    readonly shelfLife?: string
  }
}
