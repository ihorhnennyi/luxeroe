'use client'

import { useCart } from '@/store/cart'
import { lineTotalFor, unitPriceFor } from '@/utils/cartPricing'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Avatar, Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'

export default function CartItems() {
  const { items, inc, dec, remove } = useCart()

  return (
    <Box>
      {items.map((it, idx) => {
        const unitPrice = unitPriceFor(it)
        const lineTotal = lineTotalFor(it)

        return (
          <Box
            key={`${it.id}-${it.variant ?? ''}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 2 },
              px: { xs: 0.5, sm: 1 },
              borderBottom:
                idx < items.length - 1 ? t => `1px solid ${alpha(t.palette.divider, 0.5)}` : 'none',
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: t => alpha(t.palette.primary.main, 0.02) }
            }}
          >
            {/* изображение */}
            <Avatar
              variant="rounded"
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: 3,
                flexShrink: 0,
                boxShadow: t => `0 3px 10px ${alpha(t.palette.common.black, 0.1)}`
              }}
            >
              <Image
                src={it.image || '/placeholder.jpg'}
                alt={it.title}
                width={72}
                height={72}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            </Avatar>

            {/* контент */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  mb: 0.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={it.title}
              >
                {it.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.9 }}>
                {it.variant ?? '—'} • {unitPrice.toLocaleString('uk-UA')} ₴
              </Typography>

              {/* количество */}
              {!it.lockQty ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => dec(it.id, it.variant)}
                    sx={{
                      minWidth: { xs: 36, sm: 32 },
                      height: { xs: 32, sm: 28 },
                      px: 0,
                      fontWeight: 700,
                      lineHeight: 1,
                      borderRadius: 2
                    }}
                    aria-label="Зменшити кількість"
                  >
                    −
                  </Button>

                  <Typography
                    sx={{
                      minWidth: 48,
                      textAlign: 'center',
                      fontWeight: 700,
                      border: t => `1px solid ${alpha(t.palette.text.primary, 0.2)}`,
                      borderRadius: '20px',
                      py: 0.4,
                      fontSize: '0.9rem',
                      color: 'primary.main'
                    }}
                    aria-live="polite"
                  >
                    {it.qty} шт
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => inc(it.id, it.variant)}
                    sx={{
                      minWidth: { xs: 36, sm: 32 },
                      height: { xs: 32, sm: 28 },
                      px: 0,
                      fontWeight: 700,
                      lineHeight: 1,
                      borderRadius: 2
                    }}
                    aria-label="Збільшити кількість"
                  >
                    +
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  Кількість: {it.qty}
                </Typography>
              )}
            </Box>

            {/* правая часть */}
            <Stack
              alignItems="flex-end"
              justifyContent="space-between"
              sx={{ minWidth: { xs: 84, sm: 88 } }}
              spacing={0.5}
            >
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>
                {lineTotal.toLocaleString('uk-UA')} ₴
              </Typography>

              <IconButton
                size="small"
                onClick={() => remove(it.id, it.variant)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: t => alpha(t.palette.error.main, 0.06)
                  }
                }}
                aria-label="Видалити"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        )
      })}
    </Box>
  )
}
