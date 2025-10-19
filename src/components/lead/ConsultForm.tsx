'use client'

import AnimatedCta from '@/components/hero/AnimatedCta'
import { Box, Stack, TextField } from '@mui/material'
import * as React from 'react'
import type { LeadPayload } from './types'
import { isValidName, isValidPhone, normalizePhone } from './utils'

type Props = {
  sending: boolean
  // возвращаем true / false, чтобы снаружи понять — нужно ли сбрасывать поля
  onSubmit: (payload: LeadPayload) => Promise<boolean>
}

export default function ConsultForm({ sending, onSubmit }: Props) {
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('+380')
  // honeypot
  const [company, setCompany] = React.useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await onSubmit({ name, phone, company })
    if (ok) {
      setName('')
      setPhone('+380')
      setCompany('')
    }
  }

  const nameError = name !== '' && !isValidName(name)
  const phoneError = phone !== '' && !isValidPhone(phone)

  return (
    <Box component="form" onSubmit={handle} noValidate autoComplete="off">
      <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
        <TextField
          label="Ваше ім’я"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          fullWidth
          disabled={sending}
          size="medium"
          error={nameError}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            autoCapitalize: 'words',
            autoCorrect: 'off',
            name: 'name'
          }}
        />

        <TextField
          label="Телефон"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          fullWidth
          size="medium"
          inputMode="tel"
          placeholder="+380 00 000 00 00"
          helperText="У форматі +380…"
          disabled={sending}
          error={phoneError}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            autoComplete: 'tel',
            name: 'phone',
            enterKeyHint: 'send',
            onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
              (e.currentTarget.value = normalizePhone(e.currentTarget.value))
          }}
          FormHelperTextProps={{ sx: { mt: 0.25, fontSize: { xs: 11.5, sm: 12 } } }}
        />

        {/* honeypot — невидимое поле */}
        <TextField
          label="Company"
          value={company}
          onChange={e => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          inputProps={{ 'aria-hidden': true, name: 'company' }}
          sx={{
            position: 'absolute',
            left: '-9999px',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none'
          }}
        />

        <AnimatedCta
          type="submit"
          anim="pulse"
          disabled={sending}
          sx={{
            mt: 0.5,
            borderRadius: 2,
            px: { xs: 2.25, sm: 3 },
            py: { xs: 1, sm: 1.3 },
            width: '100%',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none !important',
              '&::before,&::after': { animation: 'none !important' }
            }
          }}
        >
          Зателефонуйте мені
        </AnimatedCta>
      </Stack>
    </Box>
  )
}
