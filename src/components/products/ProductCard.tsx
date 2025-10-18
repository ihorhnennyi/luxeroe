// src/components/products/ProductCard.tsx
'use client'

import SafeCurrency from '@/components/common/SafeCurrency'
import { emitCartAdded } from '@/lib/cartEvents'
import { fbqTrack } from '@/lib/fb'
import { useCart } from '@/store/cart'
import type { Product } from '@/types/product'
import AddToCartButton from './AddToCartButton'
import SpecLine from './SpecLine'

import { Box, Card, CardContent, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

/* ---------- helpers ---------- */
function discountPct(price?: number, oldPrice?: number) {
  if (!price || !oldPrice || oldPrice <= price) return null
  const pct = Math.round((1 - price / oldPrice) * 100)
  return pct > 0 ? `-${pct}%` : null
}

function badgeLabel(b?: Product['badge']) {
  switch (b) {
    case 'hit':
      return 'Хіт'
    case 'sale':
      return 'Знижка'
    case 'new':
      return 'Новинка'
    default:
      return null
  }
}

/* ---------- component ---------- */
export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)

  const [variant, setVariant] = useState<string | undefined>(product.weightOptions?.[0])
  const [imgSrc, setImgSrc] = useState<string>(product.image || '/placeholder.jpg')
  const [adding, setAdding] = useState(false)
  const addLockRef = useRef(false)

  const pct = discountPct(product.price, product.oldPrice)

  const badgeColor = useMemo(() => {
    switch (product.badge) {
      case 'new':
        return 'info'
      case 'hit':
        return 'success'
      case 'sale':
        return 'error'
      default:
        return undefined
    }
  }, [product.badge])

  /* ---------- fbq: ViewContent при первом появлении карточки в вьюпорте ---------- */
  const rootRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  useEffect(() => {
    if (viewedRef.current) return
    if (!rootRef.current || typeof window === 'undefined') return

    if (!('IntersectionObserver' in window)) {
      // fallback — отправим один раз на маунте
      viewedRef.current = true
      fbqTrack('ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        content_name: product.title,
        value: product.price,
        currency: 'UAH'
      })
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return
        viewedRef.current = true
        obs.disconnect()
        fbqTrack('ViewContent', {
          content_ids: [product.id],
          content_type: 'product',
          content_name: product.title,
          value: product.price,
          currency: 'UAH'
        })
      },
      { threshold: 0.2 }
    )

    obs.observe(rootRef.current)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  /* ---------- add to cart ---------- */
  const handleAdd = () => {
    if (addLockRef.current || product.inStock === false) return
    addLockRef.current = true
    setAdding(true)

    try {
      // 1) добавляем в стор
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        variant,
        qty: 1
      })

      // 2) эмитим глобальный алерт
      emitCartAdded({
        id: product.id,
        title: product.title,
        image: product.image,
        variant,
        qty: 1,
        price: product.price
      })

      // 3) fbq: AddToCart
      fbqTrack('AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        content_name: product.title,
        value: product.price,
        currency: 'UAH',
        num_items: 1,
        contents: [{ id: product.id, quantity: 1, item_price: product.price }]
      })
    } finally {
      // небольшой троттлинг клика, чтобы избежать двойного добавления
      setTimeout(() => {
        addLockRef.current = false
        setAdding(false)
      }, 180)
    }
  }

  return (
    <Card
      ref={rootRef}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'transform .18s ease, box-shadow .18s ease',
        background: 'linear-gradient(180deg, rgba(255,248,238,.6) 0%, rgba(255,255,255,1) 40%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: t => `0 8px 26px ${alpha(t.palette.common.black, 0.08)}`
        }
      }}
    >
      {/* Фото */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', bgColor: '#f5f5f5' }}>
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 600px) 100vw, 33vw"
            priority={false}
            style={{ objectFit: 'cover' }}
            onError={() => setImgSrc('/placeholder.jpg')}
          />
        </Box>

        {(product.badge || pct) && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              left: { xs: 8, sm: 12 },
              zIndex: 2
            }}
          >
            {product.badge && (
              <Chip
                size="small"
                label={badgeLabel(product.badge)}
                color={badgeColor as any}
                sx={{
                  borderRadius: 999,
                  px: 1,
                  height: { xs: 20, sm: 22 },
                  fontSize: { xs: 11, sm: 12 },
                  fontWeight: 700
                }}
              />
            )}
            {pct && (
              <Chip
                size="small"
                label={pct}
                color="error"
                sx={{
                  borderRadius: 999,
                  px: 1,
                  height: { xs: 20, sm: 22 },
                  fontSize: { xs: 11, sm: 12 },
                  fontWeight: 700
                }}
              />
            )}
          </Stack>
        )}
      </Box>

      <Divider />

      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        {/* Назва */}
        <Typography
          variant="subtitle1"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'inherit',
            fontWeight: 800,
            lineHeight: 1.25,
            mb: 0.75,
            fontSize: { xs: 14.5, sm: 15.5 },
            cursor: 'default'
          }}
          title={product.title}
        >
          {product.title}
        </Typography>

        {/* Ціна */}
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 20 } }}>
            <SafeCurrency value={product.price} />
          </Typography>
          {product.oldPrice && product.oldPrice > product.price && (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ textDecoration: 'line-through', fontSize: { xs: 12.5, sm: 13.5 } }}
            >
              <SafeCurrency value={product.oldPrice} />
            </Typography>
          )}
        </Stack>

        {/* Варіанти ваги */}
        {product.weightOptions?.length ? (
          <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap' }}>
            {product.weightOptions.map(w => (
              <Chip
                key={w}
                label={w}
                size="small"
                variant={variant === w ? 'filled' : 'outlined'}
                color={variant === w ? 'primary' : 'default'}
                onClick={() => setVariant(w)}
                sx={{
                  borderRadius: 1,
                  height: { xs: 24, sm: 26 },
                  fontSize: { xs: 12, sm: 12.5 }
                }}
              />
            ))}
          </Stack>
        ) : null}

        {/* Характеристики */}
        {product.description && (
          <Stack spacing={0.5} sx={{ mb: 1.25 }}>
            <SpecLine
              label="Консистенція:"
              value={product.description?.consistency}
              color="error.main"
            />
            <SpecLine
              label="Розмір ікринок:"
              value={product.description?.size}
              color="warning.main"
            />
            <SpecLine label="Колір:" value={product.description?.color} />
            <SpecLine label="Тара:" value={product.description?.container} color="warning.main" />
            <SpecLine
              label="Температура зберігання:"
              value={product.description?.storage}
              color="error.main"
            />
            <SpecLine
              label="Термін придатності:"
              value={product.description?.shelfLife}
              color="error.main"
            />
          </Stack>
        )}

        {/* CTA */}
        <Box sx={{ mt: 'auto' }}>
          {product.inStock === false ? (
            <Tooltip title="Тимчасово немає в наявності">
              <span>
                <AddToCartButton disabled onClick={handleAdd} />
              </span>
            </Tooltip>
          ) : (
            <AddToCartButton disabled={adding} onClick={handleAdd}>
              {adding ? 'Додаємо…' : 'В кошик'}
            </AddToCartButton>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
