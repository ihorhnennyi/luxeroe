'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Box, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Image from 'next/image'
import { formatUAH } from './utils'

export type AlertItem = {
  id: string
  title: string
  image?: string
  variant?: string
  qty?: number
  price: number
  promoFirstPrice?: number
}

export default function AddToCartAlert({
  open,
  item,
  onClose,
  onContinue,
  onCheckout
}: {
  open: boolean
  item?: AlertItem | null
  onClose: () => void
  onContinue?: () => void
  onCheckout?: () => void
}) {
  const theme = useTheme()

  // Закрываем только по кнопке «Х», клик по подложке/ESC игнорируем
  const handleDialogClose = (_e: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="cart-added-title"
      fullWidth
      maxWidth="xs"
      disableEscapeKeyDown
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(5px)',
            backgroundColor: alpha(theme.palette.common.black, 0.35)
          }
        }
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
          boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.26)}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,1) 40%)'
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 2.25 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
          <CheckCircleRoundedIcon
            sx={{ color: '#2DAF92', fontSize: 26, flexShrink: 0 }}
            aria-hidden
          />
          <Typography
            id="cart-added-title"
            variant="subtitle1"
            sx={{ fontWeight: 900, color: 'text.primary', flex: 1 }}
          >
            Додано до кошика
          </Typography>
          <IconButton aria-label="Закрити" onClick={onClose} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Товар */}
        {item && (
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              mb: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(180deg, ${alpha('#F6FFF9', 0.7)} 0%, #FFFFFF 60%)`
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 56,
                height: 56,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                flexShrink: 0
              }}
            >
              <Image
                fill
                alt={item.title}
                src={item.image || '/placeholder.jpg'}
                style={{ objectFit: 'cover' }}
                sizes="56px"
                priority={false}
              />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 15,
                  lineHeight: 1.25,
                  color: 'text.primary',
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  mb: 0.25
                }}
              >
                {item.title}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="baseline">
                {item.variant && (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {item.variant}
                  </Typography>
                )}
                {typeof item.qty === 'number' && item.qty > 1 && (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    × {item.qty}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                {item.promoFirstPrice ? (
                  <>
                    <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#2DAF92' }}>
                      {formatUAH(item.promoFirstPrice)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: 'text.disabled',
                        textDecoration: 'line-through'
                      }}
                    >
                      {formatUAH(item.price)}
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                    {formatUAH(item.price)}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}

        {/* Кнопки: full width, колонкой */}
        <Stack direction="column" spacing={1}>
          <AnimatedCta
            forceButton
            anim="none"
            onClick={onContinue}
            sx={{
              width: '100%',
              borderRadius: 2,
              background: '#fff',
              color: '#0F5E5B',
              boxShadow: 'none',
              border: '2px solid rgba(47,164,140,.45)',
              py: { xs: 1, sm: 1.1 },
              fontWeight: 900,
              '&::after,&::before': { display: 'none' },
              '&:hover': {
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FFFD 100%)',
                boxShadow: 'none'
              }
            }}
          >
            Продовжити покупки
          </AnimatedCta>

          <AnimatedCta
            forceButton
            anim="sheen"
            onClick={onCheckout}
            sx={{
              width: '100%',
              borderRadius: 2,
              py: { xs: 1, sm: 1.1 },
              fontWeight: 900,
              '&::before': { display: 'none' }
            }}
          >
            Оформити замовлення
          </AnimatedCta>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
