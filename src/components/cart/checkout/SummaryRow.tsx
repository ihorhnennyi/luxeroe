'use client'
import { Stack, Typography } from '@mui/material'

export default function SummaryRow({ subtotal }: { subtotal: number }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
      <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15 } }}>
        Разом
      </Typography>
      <Typography fontWeight={900} sx={{ fontSize: { xs: 18, sm: 20 } }}>
        {subtotal.toLocaleString('uk-UA')} ₴
      </Typography>
    </Stack>
  )
}
