'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import { Box, Container, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import InstagramEmbed from './InstagramEmbed'

type Props = {
  username: string
  profileUrl: string
  posts?: string[]
}

export default function InstagramSection({ username, profileUrl, posts = [] }: Props) {
  const amber = '#F2C14E'
  const pumpkin = '#E08E45'

  // берём строго первые 2 поста
  const top = useMemo(() => posts.slice(0, 2), [posts])

  return (
    <Box component="section" sx={{ py: { xs: 7, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="flex-start"
        >
          {/* Левый блок — шире и читаемый */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '1.2 1 0' },
              pr: { md: 1 },
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { md: 600 }
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2, fontWeight: 900, color: '#0E4F45' }}
            >
              Будь на звʼязку
            </Typography>

            <Typography
              component="h2"
              variant="h3"
              sx={{ fontWeight: 1000, letterSpacing: -0.6, mb: 1 }}
            >
              Підписуйся на Instagram
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 600, mx: { xs: 'auto', md: 'initial' } }}
            >
              Живі пости (без скринів): акції, рецепти та ідеї подачі — усе в нашому профілі.
            </Typography>

            <Stack component="ul" spacing={1.1} sx={{ listStyle: 'none', p: 0, mb: 3 }}>
              {[
                '−10% на замовлення за підписку',
                'Рецепти, подача та ідеї страв',
                'Щотижневі акції та знижки',
                'Розіграші та подарунки'
              ].map(t => (
                <Stack key={t} direction="row" alignItems="center" spacing={1} component="li">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50% 40% 60% 50% / 50% 50% 40% 60%',
                      background: `linear-gradient(145deg, ${amber} 0%, ${pumpkin} 90%)`,
                      boxShadow: '0 3px 6px rgba(183,92,54,.25)',
                      flexShrink: 0
                    }}
                  />
                  <Typography>{t}</Typography>
                </Stack>
              ))}
            </Stack>

            <AnimatedCta href={profileUrl} anim="pulse" sx={{ mt: 1 }}>
              Перейти в Instagram @{username}
            </AnimatedCta>
          </Box>

          {/* Правый блок — ровно 2 карточки */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 0' },
              width: '100%',
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(340px, 1fr))',
                md: 'repeat(2, minmax(380px, 1fr))'
              },
              justifyContent: 'center',
              alignItems: 'start'
            }}
          >
            {top.map((u, idx) => (
              <Box
                key={u}
                sx={{
                  display: { xs: idx === 0 ? 'block' : 'none', sm: 'block' },
                  border: 'none',
                  overflow: 'visible',
                  boxShadow: '0 12px 28px rgba(0,0,0,.10)',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 18px 38px rgba(0,0,0,.14)'
                  }
                }}
              >
                <InstagramEmbed url={u} aspectRatio={4 / 5} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
