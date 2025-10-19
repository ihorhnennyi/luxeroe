'use client'

import { Box, Typography, alpha } from '@mui/material'
import { BRAND } from './constants'

export default function StepCard({
  title,
  text,
  ring = BRAND.amber,
  num
}: {
  title: string
  text: string
  ring?: string
  num: string
}) {
  return (
    <Box
      aria-labelledby={`step-${num}-title`}
      sx={{
        borderRadius: 2,
        p: { xs: 1.75, md: 2.5 },
        bgcolor: '#fff',
        border: `1px solid ${alpha(BRAND.russet, 0.18)}`,
        boxShadow: {
          xs: '0 10px 22px rgba(183,92,54,.10)',
          md: '0 14px 28px rgba(183,92,54,.10)'
        },
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: -3,
          borderRadius: 3,
          border: {
            xs: `1.5px dashed ${alpha(ring, 0.6)}`,
            md: `2px dashed ${alpha(ring, 0.65)}`
          },
          pointerEvents: 'none'
        }
      }}
    >
      <Typography
        id={`step-${num}-title`}
        variant="h6"
        sx={{
          fontWeight: 900,
          mb: 0.5,
          color: BRAND.textBrown,
          letterSpacing: 0.2,
          fontSize: { xs: 16, sm: 18 },
          lineHeight: { xs: 1.25, sm: 1.2 }
        }}
      >
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15.5 } }}>
        {text}
      </Typography>
    </Box>
  )
}
