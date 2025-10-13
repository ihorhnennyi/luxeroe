// src/components/products/ProductCard.tsx
'use client'

import { emitCartAdded } from '@/lib/cartEvents'
import { fbqTrack } from '@/lib/fb' // ⬅️ fbq утилита
import { useCart } from '@/store/cart'
import type { Product } from '@/types/product'
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import AddToCartButton from './AddToCartButton'
import SpecLine from './SpecLine'

/* ---------- безопасное форматирование валюты ---------- */
function SafeCurrency({ value }: { value: number }) {
  const [txt, setTxt] = useState<string>('')
  useEffect(() => {
    try {
      setTxt(
        new Intl.NumberFormat('uk-UA', {
          style: 'currency',
          currency: 'UAH',
          maximumFractionDigits: 0
        }).format(value)
      )
    } catch {
      setTxt(`${Math.round(value)} ₴`)
    }
  }, [value])
  return <span suppressHydrationWarning>{txt || `${Math.round(value)} ₴`}</span>
}

/* ---------- утилиты ---------- */
function discountPct(price?: number, oldPrice?: number) {
  if (!price || !oldPrice || oldPrice <= price) return null
  const pct = Math.round((1 - price / oldPrice) * 100)
  return pct > 0 ? `-${pct}%` : null
}

/* ---------- компонент ---------- */
export default function ProductCard({ product }: { product: Product }) {
  const add = useCart(s => s.addItem)
  const [variant, setVariant] = useState<string | undefined>(product.weightOptions?.[0])
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

  /* ---------- fbq: ViewContent при маунте карточки ---------- */
  useEffect(() => {
    fbqTrack('ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.title,
      value: product.price,
      currency: 'UAH'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // один раз на карточку

  const handleAdd = () => {
    // 1) добавляем в корзину
    add({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      variant,
      qty: 1
    })

    // 2) эмитим событие для глобального алерта
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
      num_items: 1
    })
  }

  return (
    <Card
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
        <Box
          component="img"
          src={product.image || '/placeholder.jpg'}
          alt={product.title}
          loading="lazy"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget
            if (!img.src.includes('placeholder.jpg')) img.src = '/placeholder.jpg'
          }}
          sx={{
            display: 'block',
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            transition: 'transform .35s ease',
            backgroundColor: '#f5f5f5',
            '@media (hover:hover)': {
              '&:hover': { transform: 'scale(1.03)' }
            }
          }}
        />

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
                label={
                  product.badge === 'hit' ? 'Хіт' : product.badge === 'sale' ? 'Знижка' : 'Новинка'
                }
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
        {/* Название (просто текст, без ссылки) */}
        <Typography
          variant="subtitle1"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 800,
            lineHeight: 1.25,
            mb: 0.75,
            fontSize: { xs: 14.5, sm: 15.5 },
            cursor: 'default'
          }}
        >
          {product.title}
        </Typography>

        {/* Цена */}
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 20 } }}>
            <SafeCurrency value={product.price} />
          </Typography>
          {product.oldPrice && product.oldPrice > product.price && (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{
                textDecoration: 'line-through',
                fontSize: { xs: 12.5, sm: 13.5 }
              }}
            >
              <SafeCurrency value={product.oldPrice} />
            </Typography>
          )}
        </Stack>

        {/* Варианты веса */}
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

        {/* Спеки */}
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
          <AddToCartButton disabled={product.inStock === false} onClick={handleAdd} />
        </Box>
      </CardContent>
    </Card>
  )
}
