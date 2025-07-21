import NavLink from '@/components/Nav/NavLink'
import { navItems } from '@/constants/navItems'
import { socialLinks } from '@/constants/socials'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer, IconButton } from '@mui/material'

interface Props {
	open: boolean
	onClose: () => void
	scrollTo: (id: string) => void
}

const MobileDrawer = ({ open, onClose, scrollTo }: Props) => (
	<Drawer anchor='right' open={open} onClose={onClose}>
		<Box
			sx={{
				width: 280,
				backgroundColor: '#1A1918',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Header (Close Button) */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
				<IconButton onClick={onClose}>
					<CloseIcon sx={{ color: '#fff' }} />
				</IconButton>
			</Box>

			{/* Navigation */}
			<Box
				sx={{
					flexGrow: 1,
					overflowY: 'auto',
					px: 3,
					pb: 2,
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}
			>
				{navItems.map(item => (
					<NavLink
						key={item.id}
						{...item}
						scrollTo={(id: string) => {
							scrollTo(id)
							onClose()
						}}
						fontSize='1.1rem'
					/>
				))}
			</Box>

			{/* Footer (Social Links) */}
			<Box
				sx={{
					p: 2,
					borderTop: '1px solid #333',
					display: 'flex',
					justifyContent: 'center',
					gap: 2,
				}}
			>
				{socialLinks.map(({ icon: Icon, url }, idx) => (
					<IconButton
						key={idx}
						onClick={() => window.open(url, '_blank')}
						sx={{ color: '#fff' }}
					>
						<Icon />
					</IconButton>
				))}
			</Box>
		</Box>
	</Drawer>
)

export default MobileDrawer
