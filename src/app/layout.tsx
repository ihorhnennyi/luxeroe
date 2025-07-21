import ClientLayout from './ClientLayout'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='uk'>
			<body>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	)
}
