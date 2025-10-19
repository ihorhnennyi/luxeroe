'use client'

import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { DeliveryPaymentItemCardProps } from './types'
import { styles } from './utils'

export default function DeliveryPaymentItemCard({
  item,
  accent,
  sx
}: DeliveryPaymentItemCardProps) {
  const { title, text, Icon } = item

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        bgcolor: '#fff',
        border: `1px solid ${alpha(accent.russet, 0.12)}`,
        boxShadow: styles.shadowCard,
        p: { xs: 2, sm: 2.5, md: 3 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: { xs: 4, sm: 6 },
          background: styles.sideStripe(accent)
        },
        ...sx
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.75, sm: 2.25 }} alignItems="center">
        <Box
          aria-hidden
          sx={{
            width: { xs: 48, sm: 58, md: 66 },
            height: { xs: 48, sm: 58, md: 66 },
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(180deg,#FFFDFC 0%, #FFE9C7 100%)',
            border: `1px solid ${styles.ring(accent)(0.25)}`,
            color: '#A4512E',
            flexShrink: 0,
            boxShadow: styles.shadowIcon
          }}
        >
          {Icon ? <Icon sx={{ fontSize: { xs: 26, sm: 28, md: 32 } }} /> : null}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#7A3E1B',
              mb: 0.4,
              fontSize: { xs: 16, sm: 18 }
            }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15.5 } }}>
            {text}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
