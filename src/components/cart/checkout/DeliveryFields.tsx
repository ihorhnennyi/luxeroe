'use client'
import { Stack, TextField } from '@mui/material'

type Props = {
  city: string
  branch: string
  setCity: (v: string) => void
  setBranch: (v: string) => void
  disabled?: boolean
  touchForm: () => void
}
export default function DeliveryFields({
  city,
  branch,
  setCity,
  setBranch,
  disabled,
  touchForm
}: Props) {
  return (
    <Stack spacing={1}>
      <TextField
        label="Місто"
        value={city}
        onChange={e => {
          touchForm()
          setCity(e.target.value)
        }}
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ autoComplete: 'address-level2', name: 'city' }}
        disabled={disabled}
      />
      <TextField
        label="Відділення Нової пошти"
        value={branch}
        onChange={e => {
          touchForm()
          setBranch(e.target.value)
        }}
        placeholder="Наприклад: Відділення №6"
        fullWidth
        size="small"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ name: 'branch' }}
        disabled={disabled}
      />
    </Stack>
  )
}
