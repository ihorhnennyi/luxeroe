'use client'

import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
})

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Header />
			{children}
			<Footer />
		</ThemeProvider>
	)
}
