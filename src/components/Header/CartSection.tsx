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
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
		<Badge badgeContent={3} color='error'>
			<ShoppingCartIcon
				sx={{ color: '#AAAAAA', fontSize: '25px', cursor: 'pointer' }}
			/>
		</Badge>
		{isMobile && (
			<IconButton onClick={() => setDrawerOpen(true)}>
				<MenuIcon sx={{ color: '#AAAAAA' }} />
			</IconButton>
		)}
	</Box>
)

export default CartSection
