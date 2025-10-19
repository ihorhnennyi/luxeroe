'use client'

import type { DeliveryItem } from '@/data/deliveryPayment'
import { deliveryPaymentItems } from '@/data/deliveryPayment'
import { Box, Container, Stack, Typography } from '@mui/material'
import DeliveryPaymentItemCard from './DeliveryPaymentItemCard'
import type { DeliveryPaymentSectionProps } from './types'
import { useAccentPalette } from './utils'

export default function DeliveryPaymentSection({
  title = 'Доставка та оплата',
  subtitle = 'Чітко, швидко і без передоплат — все для вашої зручності.',
  items = deliveryPaymentItems,
  accent,
  containerSx
}: DeliveryPaymentSectionProps) {
  const colors = useAccentPalette(accent)

  const makeKey = (it: DeliveryItem, i: number) => `${it.title ?? 'item'}-${i}`

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 9 },
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        ...containerSx
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={1} sx={{ textAlign: 'center', mb: { xs: 3.5, md: 6 } }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.6,
              color: '#7A3E1B',
              textShadow: '0 1px 0 rgba(255,255,255,.6)',
              fontSize: { xs: 24, sm: 28, md: 36 },
              lineHeight: { xs: 1.25, md: 1.15 }
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

        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {items.map((it, i) => (
            <DeliveryPaymentItemCard key={makeKey(it, i)} item={it} accent={colors} />
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
