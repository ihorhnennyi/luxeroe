'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import { products } from '@/data/products'
import { emitCartAdded } from '@/lib/cartEvents'
import { useCart } from '@/store/cart'
import type { PromoSlide } from '@/types/promo'
import { Box, Chip, Container, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PriceBadge from './PriceBadge'

function LeafDot({ top, left, size = 10 }: { top: number; left: number | string; size?: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: '50% 40% 60% 50% / 50% 50% 40% 60%',
        background: 'linear-gradient(140deg,#E9B15E 0%,#D87D3D 60%,#B75C36 100%)',
        boxShadow: '0 6px 12px rgba(183,92,54,.25)',
        transform: 'rotate(-12deg)',
        display: { xs: 'none', md: 'block' }
      }}
    />
  )
}

type Props = PromoSlide & { onAction?: () => void; imagePriority?: boolean }

const GORBUSH_ID = '1'
const GORBUSH_PRICE = 500
const GORBUSH_PROMO_FIRST = 279

export default function HeroPromo({
  eyebrow,
  title,
  subtitle,
  bullets,
  imageSrc,
  imageAlt,
  ctaText = 'Перейти до каталогу',
  ctaHref = '#catalog',
  onAction,
  price,
  priceNote = 'Ціна за банку',
  countdownTo,
  imagePriority = false,
  tags,
  action
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [leftMs, setLeftMs] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const guardRef = useRef(false)

  const addItem = useCart(s => s.addItem)
  const openCart = useCart(s => s.open)

  useEffect(() => setMounted(true), [])

  const handleCta = useCallback(
    (e: React.MouseEvent) => {
      if (action) e.preventDefault()
      if (busy || guardRef.current) return
      guardRef.current = true
      setBusy(true)

      const done = () => {
        setBusy(false)
        guardRef.current = false
      }

      if (onAction) {
        onAction()
        done()
        return
      }
      if (!action) {
        done()
        return
      }

      try {
        if (action.kind === 'add') {
          action.items?.forEach(({ id, qty = 1 }) => {
            const p = products.find(x => x.id === id)
            if (!p) return

            if (p.id === GORBUSH_ID) {
              addItem({
                id: p.id,
                title: `${p.title} — промо баночка`,
                image: p.image,
                variant: p.weightOptions?.[0],
                price: GORBUSH_PRICE,
                promoFirstPrice: GORBUSH_PROMO_FIRST,
                priceAfterFirst: GORBUSH_PRICE,
                qty,
                type: 'single'
              } as any)

              emitCartAdded({
                id: p.id,
                title: `${p.title} — промо баночка`,
                image: p.image,
                variant: p.weightOptions?.[0],
                qty,
                price: GORBUSH_PRICE,
                promoFirstPrice: GORBUSH_PROMO_FIRST
              })
            } else {
              addItem({
                id: p.id,
                title: p.title,
                image: p.image,
                variant: p.weightOptions?.[0],
                price: p.price,
                qty,
                type: 'single'
              } as any)

              emitCartAdded({
                id: p.id,
                title: p.title,
                image: p.image,
                variant: p.weightOptions?.[0],
                qty,
                price: p.price
              })
            }
          })

          if (action.openCart !== false) openCart()
        }

        if (action.kind === 'bundle') {
          if (!action.id || typeof action.price !== 'number' || !action.title) {
            done()
            return
          }

          addItem({
            id: action.id,
            title: action.title,
            price: action.price,
            image: action.image ?? imageSrc,
            qty: 1,
            type: 'bundle',
            lockQty: true,
            maxQty: 1
          } as any)

          emitCartAdded({
            id: action.id,
            title: action.title,
            image: action.image ?? imageSrc,
            qty: 1,
            price: action.price
          })

          if (action.openCart !== false) openCart()
        }
      } finally {
        setTimeout(done, 180)
      }
    },
    [action, onAction, addItem, openCart, busy, imageSrc]
  )

  // Таймер — только на клиенте
  useEffect(() => {
    if (!mounted || !countdownTo) return
    const t = new Date(countdownTo).getTime()
    const tick = () => setLeftMs(Math.max(0, t - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [mounted, countdownTo])

  const leftStr = useMemo(() => {
    if (leftMs == null) return null
    const s = Math.floor(leftMs / 1000)
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    return `${d}д ${h}г ${m}хв ${ss}с`
  }, [leftMs])

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 5, md: 11 },
        background: 'transparent'
      }}
    >
      <LeafDot top={32} left={18} />
      <LeafDot top={90} left={64} size={12} />
      <LeafDot top={-4} left={'calc(100% - 60px)'} size={11} />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          alignItems="center"
          spacing={{ xs: 3.5, md: 6 }}
        >
          {/* Левый столбец */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            {eyebrow && (
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 2,
                  color: '#0F5A57',
                  fontWeight: 900,
                  display: 'inline-block',
                  mb: { xs: 0.5, md: 0 }
                }}
              >
                {eyebrow}
              </Typography>
            )}

            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: { xs: '-.3px', md: '-.6px' },
                mb: 1,
                color: 'text.primary',
                textShadow: '0 1px 0 rgba(255,255,255,.6)',
                fontSize: { xs: 28, sm: 34, md: 48 },
                lineHeight: { xs: 1.15, md: 1.1 }
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                color="text.secondary"
                sx={{
                  mb: { xs: 2, md: 2.5 },
                  maxWidth: 560,
                  mx: { xs: 'auto', md: 'initial' },
                  fontSize: { xs: 14.5, sm: 15.5, md: 16 }
                }}
              >
                {subtitle}
              </Typography>
            )}

            {!!bullets?.length && (
              <Stack
                component="ul"
                spacing={1}
                sx={{
                  listStyle: 'none',
                  pl: 0,
                  mb: { xs: 2.25, md: 3 },
                  mx: { xs: 'auto', md: 'initial' },
                  maxWidth: 560
                }}
              >
                {bullets.map((b, i) => (
                  <Box
                    key={i}
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: 14, md: 15 }
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50% 40% 60% 50% / 50% 50% 40% 60%',
                        background: 'linear-gradient(145deg,#E9B15E 0%,#D87D3D 90%)',
                        boxShadow: '0 3px 6px rgba(183,92,54,.25)',
                        mr: 1,
                        flexShrink: 0
                      }}
                    />
                    {b}
                  </Box>
                ))}
              </Stack>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <AnimatedCta
                href={action ? undefined : ctaHref}
                onClick={handleCta}
                forceButton={!!action}
                anim="pulse"
                disabled={busy}
                aria-busy={busy ? 'true' : undefined}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {ctaText}
              </AnimatedCta>

              {mounted && leftStr && (
                <Chip
                  color="warning"
                  variant="outlined"
                  label={<span suppressHydrationWarning>{`До кінця акції: ${leftStr}`}</span>}
                  sx={{
                    fontWeight: 700,
                    borderColor: alpha('#B75C36', 0.35),
                    maxWidth: { xs: '100%', sm: 320 },
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
              )}
            </Stack>

            {!!tags?.length && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: 1.25,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                {tags.map((t, i) => (
                  <Chip
                    key={i}
                    size="small"
                    label={t}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Правый столбец */}
          <Box sx={{ flex: 1, position: 'relative', width: '100%' }}>
            <Box
              sx={{
                position: 'relative',
                mx: 'auto',
                width: { xs: 300, sm: 400, md: 520 },
                aspectRatio: '1/1',
                borderRadius: 3,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: t => `0 16px 50px ${alpha(t.palette.common.black, 0.12)}`
              }}
            >
              <Image
                src={imageSrc || '/placeholder.jpg'}
                alt={imageAlt ?? title}
                fill
                priority={imagePriority}
                sizes="(max-width: 900px) 90vw, 520px"
                style={{ objectFit: 'cover' }}
              />
              {typeof price === 'number' && <PriceBadge price={price} note={priceNote} />}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
