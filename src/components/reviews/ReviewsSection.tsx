'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import { Box, Container, Stack, Typography, useTheme } from '@mui/material'
import ReviewCard from './ReviewCard'
import type { ReviewsSectionProps } from './types'

export default function ReviewsSection({
  items,
  ctaHref = 'https://www.instagram.com/luxe.roe/',
  ctaLabel = 'Більше відгуків в Instagram',
  hideBackground = false,
  title = 'Відгуки клієнтів',
  subtitle = 'Справжні сторіс та рекомендації — дякуємо за довіру!',
  maxItems = 9,
  grid = { xs: 1, sm: 2, md: 3 },
  amberHex,
  sx
}: ReviewsSectionProps) {
  const theme = useTheme()
  const amber = amberHex ?? theme.palette.warning.main ?? '#F2C14E'

  const slice = items.slice(0, Math.max(0, maxItems))

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 8 },
        background: hideBackground ? 'none' : 'transparent',
        ...sx
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={1} sx={{ textAlign: 'center', mb: { xs: 2.5, md: 4 } }}>
          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.4,
              color: theme.palette.mode === 'dark' ? theme.palette.warning.light : '#7A3E1B',
              textShadow: '0 1px 0 rgba(255,255,255,.6)',
              fontSize: { xs: 22, sm: 26, md: 32 },
              lineHeight: { xs: 1.2, md: 1.15 }
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

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, md: 3 },
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}
          data-grid={`${grid.xs ?? 1}/${grid.sm ?? 2}/${grid.md ?? 3}`}
        >
          {slice.map((it, idx) => (
            <ReviewCard key={`${it.src}-${idx}`} item={it} amberHex={amber} />
          ))}
        </Box>

        {ctaHref && (
          <Stack alignItems="center" sx={{ mt: { xs: 3, md: 4 } }}>
            <AnimatedCta href={ctaHref} rel="noopener noreferrer">
              {ctaLabel}
            </AnimatedCta>
          </Stack>
        )}
      </Container>
    </Box>
  )
}
