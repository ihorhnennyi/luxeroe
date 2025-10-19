import { type ThemeOptions } from '@mui/material/styles'

export const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ].join(','),
  fontWeightBold: 900,
  h2: { fontWeight: 900, letterSpacing: -0.6 / 16 },
  h3: { fontWeight: 900, letterSpacing: -0.6 / 16 },
  h4: { fontWeight: 900, letterSpacing: -0.4 / 16 },
  button: { textTransform: 'none', fontWeight: 800 }
}
