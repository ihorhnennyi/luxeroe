import { navItems } from '@/constants/navItems'
import CloseIcon from '@mui/icons-material/Close'
import InstagramIcon from '@mui/icons-material/Instagram'
import TelegramIcon from '@mui/icons-material/Telegram'
import { Box, Drawer, IconButton, Typography } from '@mui/material'

const MobileDrawer = ({
	open,
	onClose,
	scrollTo,
}: {
	open: boolean
	onClose: () => void
	scrollTo: (id: string) => void
}) => (
	<Drawer anchor='right' open={open} onClose={onClose}>
		<Box sx={{ width: 280, background: '#1A1918', height: '100%', p: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<IconButton onClick={onClose}>
					<CloseIcon sx={{ color: '#fff' }} />
				</IconButton>
			</Box>

			<Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
				{navItems.map(item => (
					<Typography
						key={item.id}
						fontSize='1.1rem'
						color='#AAAAAA'
						sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}
						onClick={() => scrollTo(item.id)}
					>
						{item.label}
					</Typography>
				))}
			</Box>

			<Box
				sx={{
					mt: 'auto',
					display: 'flex',
					gap: 2,
					justifyContent: 'center',
					pt: 4,
				}}
			>
				<IconButton onClick={() => window.open('https://t.me/luxe_roe')}>
					<TelegramIcon sx={{ color: '#fff' }} />
				</IconButton>
				<IconButton
					onClick={() => window.open('https://instagram.com/luxe.roe')}
				>
					<InstagramIcon sx={{ color: '#fff' }} />
				</IconButton>
			</Box>
		</Box>
	</Drawer>
)

export default MobileDrawer
