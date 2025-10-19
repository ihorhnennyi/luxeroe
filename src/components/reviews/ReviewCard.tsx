'use client'

import { Box, Typography, alpha } from '@mui/material'
import * as React from 'react'
import type { ReviewItem } from './types'

type Props = {
  item: ReviewItem
  amberHex: string
}

export default function ReviewCard({ item, amberHex }: Props) {
  const [src, setSrc] = React.useState(item.src)

  const onError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (!img.src.includes('placeholder.jpg')) {
      setSrc('/placeholder.jpg')
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#111',
        border: {
          xs: `2px solid ${alpha(amberHex, 0.8)}`,
          md: `3px solid ${alpha(amberHex, 0.9)}`
        },
        boxShadow: {
          xs: '0 10px 24px rgba(183,92,54,.16)',
          md: '0 18px 42px rgba(183,92,54,.18)'
        },
        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
        maxWidth: { xs: '100%', sm: 360 },
        aspectRatio: '9 / 16'
      }}
      aria-label={item.author ? `Відгук: ${item.author}` : 'Відгук'}
      role="figure"
    >
      <Box
        component="img"
        src={src}
        alt={item.author ? `Відгук ${item.author}` : 'Відгук'}
        loading="lazy"
        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
        onError={onError}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {(item.author || item.note) && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            p: { xs: 0.75, sm: 1 },
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 60%)',
            color: '#fff'
          }}
        >
          {item.author && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 800,
                fontSize: { xs: 11.5, sm: 12 }
              }}
            >
              {item.author}
            </Typography>
          )}
          {item.note && (
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: 11.5, sm: 12 } }}>
              {item.note}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}
