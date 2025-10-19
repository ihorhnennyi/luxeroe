import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { components } from './components'
import { brand, radii } from './tokens'
import { typography } from './typography'

let theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: brand.pine },
    secondary: { main: '#C27B1E' },
    warning: { main: brand.amber },
    error: { main: brand.russet },
    background: {
      default: brand.cream,
      paper: '#fff'
    }
  },
  shape: { borderRadius: radii.card },
  typography,
  components
})
theme = responsiveFontSizes(theme)

export { theme }
