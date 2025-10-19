'use client'

import { Chip, Stack } from '@mui/material'

export default function WeightChips({
  options,
  value,
  onChange
}: {
  options?: ReadonlyArray<string>
  value?: string
  onChange?: (v: string) => void
}) {
  if (!options?.length) return null

  return (
    <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap' }}>
      {options.map(w => (
        <Chip
          key={w}
          label={w}
          size="small"
          variant={value === w ? 'filled' : 'outlined'}
          color={value === w ? 'primary' : 'default'}
          onClick={() => onChange?.(w)}
          sx={{
            borderRadius: 1,
            height: { xs: 24, sm: 26 },
            fontSize: { xs: 12, sm: 12.5 }
          }}
        />
      ))}
    </Stack>
  )
}
