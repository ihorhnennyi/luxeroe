import Header from '@/components/Header/Header'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='uk'>
			<body>
				<Header />
				{children}
			</body>
		</html>
	)
}
