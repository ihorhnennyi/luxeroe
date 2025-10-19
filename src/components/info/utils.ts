import { alpha, useTheme } from '@mui/material'
import type { AccentPalette } from './types'

export function useAccentPalette(overrides?: Partial<AccentPalette>): AccentPalette {
  const theme = useTheme()

  const amber = overrides?.amber ?? theme.palette.warning?.main ?? '#F2C14E'
  const pumpkin = overrides?.pumpkin ?? theme.palette.warning?.dark ?? '#E08E45'
  const russet = overrides?.russet ?? theme.palette.secondary?.dark ?? '#B75C36'
  return { amber, pumpkin, russet }
}

export const styles = {
  sideStripe: (accent: AccentPalette) =>
    `linear-gradient(180deg, ${accent.amber}, ${accent.pumpkin}, ${accent.russet})`,
  ring:
    (accent: AccentPalette) =>
    (opacity = 0.25) =>
      alpha(accent.russet, opacity),
  shadowCard: {
    xs: '0 10px 24px rgba(183,92,54,.10)',
    md: '0 20px 40px rgba(183,92,54,.10)'
  } as const,
  shadowIcon: {
    xs: '0 4px 10px rgba(183,92,54,.15)',
    md: '0 6px 14px rgba(183,92,54,.18)'
  } as const
}
