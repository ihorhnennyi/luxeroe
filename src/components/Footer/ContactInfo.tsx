import { Box, Link, Typography } from '@mui/material'

const ContactInfo = ({ isMobile }: { isMobile: boolean }) => (
	<Box
		sx={{
			display: 'flex',
			flexDirection: 'column',
			gap: 1,
			color: '#fff',
			alignItems: isMobile ? 'center' : 'flex-start',
		}}
	>
		<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
			Контакти
		</Typography>
		<Link href='tel:+380501112233' underline='hover' sx={{ color: '#ccc' }}>
			+38 (050) 111-22-33
		</Link>
		<Link
			href='mailto:support@luxeroe.com'
			underline='hover'
			sx={{ color: '#ccc' }}
		>
			support@luxeroe.com
		</Link>
		<Typography variant='body2' sx={{ color: '#999' }}>
			Пн–Пт: 09:00 – 18:00
		</Typography>
	</Box>
)

export default ContactInfo
