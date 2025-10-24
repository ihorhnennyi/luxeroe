'use client'
import { TextField } from '@mui/material'

export default function HoneypotField({
  hpCompany,
  setHpCompany
}: {
  hpCompany: string
  setHpCompany: (v: string) => void
}) {
  return (
    <TextField
      label="Компанія"
      value={hpCompany}
      onChange={e => setHpCompany(e.target.value)}
      inputProps={{ name: 'company', autoComplete: 'off', tabIndex: -1, 'aria-hidden': 'true' }}
      sx={{
        position: 'absolute',
        left: -99999,
        top: 'auto',
        width: 1,
        height: 1,
        p: 0,
        m: 0,
        opacity: 0,
        pointerEvents: 'none',
        visibility: 'hidden'
      }}
    />
  )
}
