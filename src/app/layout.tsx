import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Ikra | Premium Caviar Store',
	description: 'High-quality caviar with delivery in Ukraine.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en'>
			<body>{children}</body>
		</html>
	)
}
