'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import { orderSteps, type StepItem } from '@/data/orderSteps'
import { Box, Container, Stack, Typography } from '@mui/material'
import { BRAND } from './constants'
import LeafBadge from './LeafBadge'
import StepCard from './StepCard'

export default function OrderStepsSection({
  title = 'Як замовити',
  subtitle = 'Просто три кроки — і свіжа ікра вже прямує до вас.',
  steps = orderSteps,
  ctaText = 'Перейти до каталогу',
  ctaHref = '#catalog'
}: {
  title?: string
  subtitle?: string
  steps?: StepItem[]
  ctaText?: string
  ctaHref?: string
}) {
  const amber = BRAND.amber
  const pumpkin = BRAND.pumpkin

  return (
    <Box component="section" sx={{ py: { xs: 5, md: 10 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.2} sx={{ textAlign: 'center', mb: { xs: 3.5, md: 6 } }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.6,
              color: BRAND.textBrown,
              textShadow: '0 1px 0 rgba(255,255,255,.6)',
              fontSize: { xs: 24, sm: 28, md: 36 },
              lineHeight: { xs: 1.2, md: 1.15 }
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: 14, sm: 15.5 }, mx: 'auto', maxWidth: 720 }}
          >
            {subtitle}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            mx: { xs: 0, sm: 6 },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: { xs: 24, sm: '50%' },
              transform: { xs: 'none', sm: 'translateX(-50%)' },
              top: 0,
              bottom: 0,
              width: { xs: 3, sm: 4 },
              borderRadius: 3,
              background: `linear-gradient(180deg, ${amber}, ${pumpkin})`,
              opacity: 0.6
            }
          }}
        >
          <Box
            component="ol"
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              display: 'grid',
              rowGap: { xs: 3.5, md: 6 }
            }}
          >
            {steps.map((s, i) => {
              const leftSide = i % 2 === 0
              const num = (s.num ?? i + 1).toString()
              const key = (s as any).id ?? `${i}-${s.title}`

              return (
                <Box
                  key={key}
                  component="li"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '48px 1fr', sm: '1fr 60px 1fr' },
                    alignItems: 'center',
                    gap: { xs: 2, sm: 3 }
                  }}
                  aria-label={`Крок ${num}`}
                >
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      justifySelf: 'end',
                      visibility: leftSide ? 'visible' : 'hidden',
                      maxWidth: 560
                    }}
                  >
                    {leftSide && <StepCard title={s.title} text={s.text} ring={amber} num={num} />}
                  </Box>

                  <Box sx={{ justifySelf: { xs: 'start', sm: 'center' } }}>
                    <LeafBadge num={num} aria-label={`Крок ${num}`} />
                  </Box>

                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      justifySelf: 'start',
                      visibility: !leftSide ? 'visible' : 'hidden',
                      maxWidth: 560
                    }}
                  >
                    {!leftSide && <StepCard title={s.title} text={s.text} ring={amber} num={num} />}
                  </Box>

                  {/* мобильная карточка */}
                  <Box sx={{ gridColumn: '1 / span 2', display: { xs: 'block', sm: 'none' } }}>
                    <StepCard title={s.title} text={s.text} ring={amber} num={num} />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        <Stack alignItems="center" sx={{ mt: { xs: 4.5, md: 7 } }}>
          <AnimatedCta href={ctaHref} anim="pulse">
            {ctaText}
          </AnimatedCta>
        </Stack>
      </Container>
    </Box>
  )
}
