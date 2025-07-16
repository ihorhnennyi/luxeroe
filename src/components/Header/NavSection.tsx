import { navItems } from '@/constants/navItems'
import { Box, Typography } from '@mui/material'

const NavSection = ({ scrollTo }: { scrollTo: (id: string) => void }) => (
	<Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexGrow: 1 }}>
		{navItems.map(item => (
			<Typography
				key={item.id}
				sx={{
					cursor: 'pointer',
					color: '#AAAAAA',
					fontWeight: 'bold',
					'&:hover': { color: '#fff' },
				}}
				onClick={() => scrollTo(item.id)}
			>
				{item.label}
			</Typography>
		))}
	</Box>
)

export default NavSection
