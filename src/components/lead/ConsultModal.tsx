'use client'

import { Box, Typography } from '@mui/material'
import type { ModalState } from './types'

export default function ConsultModal({
  modal,
  onClose
}: {
  modal: ModalState
  onClose: () => void
}) {
  if (!modal) return null

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'grid',
        placeItems: 'center',
        backdropFilter: 'blur(6px)',
        background: 'rgba(0,0,0,.25)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        sx={{
          mx: 2,
          my: { xs: 4, md: 6 },
          maxWidth: 520,
          width: '100%',
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: '#fff',
          textAlign: 'center',
          boxShadow: '0 30px 70px rgba(0,0,0,.25)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.75, fontSize: { xs: 16, sm: 18 } }}>
          {modal.type === 'ok' ? 'Дякуємо за заявку!' : 'Перевірте ім’я та телефон'}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 13.5, sm: 14.5 } }}>
          {modal.text}
        </Typography>
        <Typography
          sx={{
            mt: 1.25,
            fontSize: 12,
            opacity: 0.7,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Вікно закриється автоматично або натисніть будь-де.
        </Typography>
      </Box>
    </Box>
  )
}
