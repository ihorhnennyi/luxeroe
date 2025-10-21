'use client'

import CartCheckout from '@/components/cart/CartCheckout'
import CartItems from '@/components/cart/CartItems'
import { useCart } from '@/store/cart'
import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const { items } = useCart()
  const [ordered, setOrdered] = useState(false)

  const isEmpty = items.length === 0

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'baseline' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 2.5 }
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: 22, sm: 28 } }}>
          Ваше замовлення
        </Typography>

        <Button
          component={Link}
          href="/"
          variant="text"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, px: 0 }}
        >
          Продовжити покупки
        </Button>
      </Box>

      {/* Якщо кошик порожній І НЕ було оформлення — показуємо заглушку */}
      {isEmpty && !ordered ? (
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 0.5 }}>
            Кошик порожній
          </Typography>
          <Typography color="text.secondary">Додайте товар із каталогу.</Typography>
          <Button component={Link} href="/" sx={{ mt: 2 }} variant="contained">
            На головну
          </Button>
        </Box>
      ) : (
        <>
          {/* Список товарів показуємо тільки якщо вони є */}
          {!isEmpty && <CartItems />}

          {/* ВАЖЛИВО: CartCheckout завжди змонтований, навіть коли items очистяться.
              Він всередині покаже екран успіху. */}
          <CartCheckout onSuccess={() => setOrdered(true)} />
        </>
      )}
    </Container>
  )
}
