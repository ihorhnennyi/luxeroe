'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

type Props = {
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

export default function AddToCartButton({ disabled, onClick, children = 'В кошик' }: Props) {
  const handleClick = () => {
    if (disabled) return

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart')
    }

    onClick?.()
  }

  return (
    <AnimatedCta
      fullWidth
      anim={disabled ? 'none' : 'pulse'}
      startIcon={<ShoppingCartIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
      disabled={disabled}
      onClick={handleClick}
      aria-label={disabled ? 'Немає в наявності' : 'Додати в кошик'}
      sx={{
        mt: { xs: 0.75, sm: 1 },
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 800,
        py: { xs: 0.85, sm: 1.05 },
        fontSize: { xs: 14, sm: 15 },
        minHeight: { xs: 38, sm: 44 },
        ...(disabled && {
          background: 'linear-gradient(180deg, #E6E1DA 0%, #D7D2CB 55%, #C9C4BD 100%)',
          color: 'rgba(0,0,0,.45)',
          boxShadow: 'none'
        }),
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none !important',
          '&::before,&::after': { animation: 'none !important' }
        }
      }}
    >
      {disabled ? 'Немає в наявності' : children}
    </AnimatedCta>
  )
}
