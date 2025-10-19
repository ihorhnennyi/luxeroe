'use client'

import SafeCurrency from '@/components/common/SafeCurrency'
import { emitCartAdded } from '@/lib/cartEvents'
import { useCart } from '@/store/cart'
import type { Product } from '@/types/product'
import AddToCartButton from './AddToCartButton'
import ProductBadges from './ProductBadges'
import SpecLine from './SpecLine'
import WeightChips from './WeightChips'

import { Box, Card, CardContent, Divider, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'
import { useRef, useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)

  const [variant, setVariant] = useState<string | undefined>(product.weightOptions?.[0])
  const [imgSrc, setImgSrc] = useState<string>(product.image || '/placeholder.jpg')
  const [adding, setAdding] = useState(false)
  const addLockRef = useRef(false)

  const handleAdd = () => {
    if (addLockRef.current || product.inStock === false) return
    addLockRef.current = true
    setAdding(true)

    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        variant,
        qty: 1
      })
      emitCartAdded({
        id: product.id,
        title: product.title,
        image: product.image,
        variant,
        qty: 1,
        price: product.price
      })
    } finally {
      setTimeout(() => {
        addLockRef.current = false
        setAdding(false)
      }, 180)
    }
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
      {/* Фото + бейджи */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', bgcolor: '#f5f5f5' }}>
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 600px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
            onError={() => setImgSrc('/placeholder.jpg')}
          />
        </Box>

        <ProductBadges
          badge={product.badge}
          price={product.price}
          oldPrice={product.oldPrice}
          sx={{ position: 'absolute', top: { xs: 8, sm: 12 }, left: { xs: 8, sm: 12 }, zIndex: 2 }}
        />
      </Box>

      <Divider />

      <CardContent
        sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}
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
        <WeightChips options={product.weightOptions} value={variant} onChange={setVariant} />

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
              {adding ? 'Додаємо… ' : 'В кошик'}
            </AddToCartButton>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
