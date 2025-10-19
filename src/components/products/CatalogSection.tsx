'use client'

import ProductGrid from '@/components/products/ProductGrid'
import type { Product } from '@/types/product'
import { Box, Stack, Typography } from '@mui/material'

function LeafDot({
  top,
  left,
  right,
  size = 12
}: {
  top: number
  left?: number
  right?: number
  size?: number
}) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top,
        left,
        right,
        width: size,
        height: size,
        borderRadius: '50% 40% 60% 50% / 50% 50% 40% 60%',
        background: 'linear-gradient(140deg, #E9B15E 0%, #D87D3D 60%, #B75C36 100%)',
        boxShadow: '0 6px 12px rgba(183,92,54,.25)',
        transform: 'rotate(-12deg)',
        opacity: 0.9,
        display: { xs: 'none', md: 'block' }
      }}
    />
  )
}

export default function CatalogSection({
  items,
  title = 'Каталог',
  subtitle = 'Найкращі позиції сезону — свіжість і контроль якості.'
}: {
  items: Product[]
  title?: string
  subtitle?: string
}) {
  return (
    <Box sx={{ position: 'relative' }}>
      <LeafDot top={-6} left={-6} />
      <LeafDot top={20} left={28} size={10} />
      <LeafDot top={-12} right={-8} size={14} />

      <Stack spacing={0.8} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography
          component="h2"
          variant="h4"
          sx={{
            fontWeight: 900,
            letterSpacing: -0.4,
            fontSize: { xs: 22, sm: 26, md: 32 }
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15.5 } }}>
            {subtitle}
          </Typography>
        )}
      </Stack>

      <ProductGrid items={items} />
    </Box>
  )
}
