'use client'
import { Stack, TextField } from '@mui/material'

type Props = {
  firstName: string
  lastName: string
  phone: string
  setFirst: (v: string) => void
  setLast: (v: string) => void
  setPhone: (v: string) => void
  disabled?: boolean
  phoneOk: (v: string) => boolean
  touchForm: () => void
}
export default function ContactFields({
  firstName,
  lastName,
  phone,
  setFirst,
  setLast,
  setPhone,
  disabled,
  phoneOk,
  touchForm
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField
        label="Ім’я"
        value={firstName}
        onChange={e => {
          touchForm()
          setFirst(e.target.value)
        }}
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ autoComplete: 'given-name', name: 'firstName' }}
        disabled={disabled}
      />
      <TextField
        label="Прізвище"
        value={lastName}
        onChange={e => {
          touchForm()
          setLast(e.target.value)
        }}
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ autoComplete: 'family-name', name: 'lastName' }}
        disabled={disabled}
      />
      <TextField
        label="Телефон"
        value={phone}
        onChange={e => {
          touchForm()
          setPhone(e.target.value)
        }}
        inputMode="tel"
        placeholder="+380"
        fullWidth
        size="small"
        required
        error={!!phone && !phoneOk(phone)}
        helperText={!!phone && !phoneOk(phone) ? 'Перевірте формат телефону' : ' '}
        FormHelperTextProps={{ sx: { m: 0 } }}
        InputLabelProps={{ shrink: true }}
        inputProps={{ autoComplete: 'tel', enterKeyHint: 'next', name: 'phone' }}
        disabled={disabled}
      />
    </Stack>
  )
}
