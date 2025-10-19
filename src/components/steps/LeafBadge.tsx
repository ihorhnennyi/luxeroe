'use client'

import { Box, Typography, alpha } from '@mui/material'
import { BRAND } from './constants'

export default function LeafBadge({
  num,
  'aria-label': ariaLabel
}: {
  num: string
  'aria-label'?: string
}) {
  const amber = BRAND.amber
  const pumpkin = BRAND.pumpkin
  const russet = BRAND.russet

  return (
    <Box
      role="img"
      aria-label={ariaLabel ?? `Крок ${num}`}
      sx={{
        position: 'relative',
        width: { xs: 44, sm: 56 },
        height: { xs: 44, sm: 56 },
        filter: {
          xs: 'drop-shadow(0 6px 14px rgba(183,92,54,.22))',
          sm: 'drop-shadow(0 8px 18px rgba(183,92,54,.25))'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '45% 55% 45% 55% / 55% 45% 55% 45%',
          transform: 'rotate(-18deg)',
          background: `linear-gradient(135deg, ${amber} 0%, ${pumpkin} 60%, ${russet} 100%)`,
          border: `2px solid ${alpha(russet, 0.45)}`
        }}
      />
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: '#3b2a1e',
          fontWeight: 1000,
          fontSize: { xs: 16, sm: 18 }
        }}
      >
        {num}
      </Typography>
    </Box>
  )
}
