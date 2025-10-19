'use client'

import type { Product } from '@/types/product'
import { Chip, Stack } from '@mui/material'
import { badgeLabel, discountPct } from './utils'

export default function ProductBadges({
  badge,
  price,
  oldPrice,
  sx
}: {
  badge?: Product['badge']
  price?: number
  oldPrice?: number
  sx?: any
}) {
  const pct = discountPct(price, oldPrice)

  const color: 'info' | 'success' | 'error' | undefined =
    badge === 'new' ? 'info' : badge === 'hit' ? 'success' : badge === 'sale' ? 'error' : undefined

  if (!badge && !pct) return null

  return (
    <Stack direction="row" spacing={0.75} sx={sx}>
      {badge && (
        <Chip
          size="small"
          color={color}
          label={badgeLabel(badge)}
          sx={{
            borderRadius: 999,
            px: 1,
            height: { xs: 20, sm: 22 },
            fontSize: { xs: 11, sm: 12 },
            fontWeight: 700
          }}
        />
      )}
      {pct && (
        <Chip
          size="small"
          color="error"
          label={pct}
          sx={{
            borderRadius: 999,
            px: 1,
            height: { xs: 20, sm: 22 },
            fontSize: { xs: 11, sm: 12 },
            fontWeight: 700
          }}
        />
      )}
    </Stack>
  )
}
