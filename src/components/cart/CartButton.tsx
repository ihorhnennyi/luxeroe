'use client'

import { useCart } from '@/store/cart'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Badge, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartButton({ color = '#0E4F45' }: { color?: string }) {
  const count = useCart(s => s.items.reduce((n, it) => n + it.qty, 0))
  const [mounted, setMounted] = useState(false)

  // показываем количество только после гидрации
  useEffect(() => setMounted(true), [])

  return (
    <IconButton
      aria-label="Кошик"
      component={Link}
      href="/cart"
      sx={{
        color,
        '&:hover': { color: alpha('#B75C36', 0.95) },
        width: { xs: 44, sm: 40 },
        height: { xs: 44, sm: 40 }
      }}
    >
      <Badge
        color="error"
        // до mount не показываем бейдж, чтобы SSR/CSR совпали
        invisible={!mounted || !count}
        badgeContent={
          mounted ? (
            // чтобы React не ругался даже если число появится
            <span suppressHydrationWarning>{count}</span>
          ) : undefined
        }
        overlap="circular"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontWeight: 800,
            fontSize: { xs: 10, sm: 9 },
            minWidth: { xs: 18, sm: 16 },
            height: { xs: 18, sm: 16 }
          }
        }}
      >
        <ShoppingCartOutlinedIcon sx={{ fontSize: { xs: 24, sm: 22 } }} />
      </Badge>
    </IconButton>
  )
}
