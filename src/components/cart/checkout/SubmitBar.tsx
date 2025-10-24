'use client'
import { Button, Stack } from '@mui/material'
import Link from 'next/link'

export default function SubmitBar({
  canSubmit,
  disabled,
  onSubmit,
  cta
}: {
  canSubmit: boolean
  disabled: boolean
  onSubmit: () => void
  cta: string
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="space-between"
      sx={{ pt: 0.5 }}
    >
      <Button
        component={Link as any}
        href="/"
        sx={{ order: { xs: 2, sm: 1 }, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        disabled={disabled}
      >
        Продовжити покупки
      </Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={!canSubmit}
        sx={{
          order: { xs: 1, sm: 2 },
          fontWeight: 900,
          borderRadius: 2,
          py: { xs: 1, sm: 1.1 },
          background: 'linear-gradient(180deg, #F2C14E 0%, #E08E45 55%, #B75C36 100%)',
          '&:hover': {
            background: 'linear-gradient(180deg, #EFB547 0%, #DB7F3F 55%, #A6512F 100%)'
          }
        }}
        fullWidth
        aria-busy={disabled ? 'true' : undefined}
      >
        {cta}
      </Button>
    </Stack>
  )
}
