'use client'
import { TextField } from '@mui/material'

export default function NotesField({
  note,
  setNote,
  disabled,
  touchForm
}: {
  note: string
  setNote: (v: string) => void
  disabled?: boolean
  touchForm: () => void
}) {
  return (
    <TextField
      label="Коментар до замовлення (необов’язково)"
      value={note}
      onChange={e => {
        touchForm()
        setNote(e.target.value)
      }}
      multiline
      minRows={2}
      InputLabelProps={{ shrink: true }}
      inputProps={{ name: 'note' }}
      disabled={disabled}
    />
  )
}
