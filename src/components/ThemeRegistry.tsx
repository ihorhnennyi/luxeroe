'use client'

import { theme } from '@/styles/index'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useServerInsertedHTML } from 'next/navigation'
import * as React from 'react'

const muiCache = createCache({ key: 'mui', prepend: true })
muiCache.compat = true

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => (
    <style data-emotion={`mui ${Object.keys(muiCache.inserted).join(' ')}`}>
      {Object.values(muiCache.inserted).join(' ')}
    </style>
  ))

  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
