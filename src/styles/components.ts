import { Components, Theme } from '@mui/material/styles'

export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 12,
        fontWeight: 900
      }),
      containedPrimary: ({ theme }) => ({
        background: `linear-gradient(180deg, #33B49A 0%, #1F8376 58%, #0F5E5B 100%)`,
        '&:hover': {
          background: `linear-gradient(180deg, #2EAA91 0%, #1B786C 58%, #0C5350 100%)`
        }
      })
    }
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 700, borderRadius: 10 }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 12
      })
    }
  },
  MuiContainer: {
    defaultProps: { maxWidth: 'lg' }
  },
  MuiLink: {
    styleOverrides: { root: { fontWeight: 600 } }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10
      }
    }
  }
}
