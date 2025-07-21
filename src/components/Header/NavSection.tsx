import NavLink from '@/components/Nav/NavLink'
import { navItems } from '@/constants/navItems'
import { Box } from '@mui/material'

const NavSection = ({ scrollTo }: { scrollTo: (id: string) => void }) => (
	<Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexGrow: 1 }}>
		{navItems.map(item => (
			<NavLink key={item.id} {...item} scrollTo={scrollTo} />
		))}
	</Box>
)

export default NavSection
