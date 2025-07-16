import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Badge, Box, IconButton } from '@mui/material'

const CartSection = ({
	isMobile,
	setDrawerOpen,
}: {
	isMobile: boolean
	setDrawerOpen: (open: boolean) => void
}) => (
	<Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
		<Box sx={{ mr: 2 }}>
			<Badge badgeContent={3} color='error'>
				<ShoppingCartIcon
					sx={{ color: '#AAAAAA', fontSize: '25px', cursor: 'pointer' }}
				/>
			</Badge>
		</Box>
		{isMobile && (
			<IconButton onClick={() => setDrawerOpen(true)} sx={{ pr: 4 }}>
				<MenuIcon sx={{ color: '#AAAAAA' }} />
			</IconButton>
		)}
	</Box>
)

export default CartSection
