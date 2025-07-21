import { NavItem } from '@/types/navItem'
import { Typography } from '@mui/material'

interface Props extends NavItem {
	scrollTo: (id: string) => void
	fontSize?: string
}

const NavLink = ({ id, label, scrollTo, fontSize = '1rem' }: Props) => (
	<Typography
		onClick={() => scrollTo(id)}
		sx={{
			cursor: 'pointer',
			color: '#AAAAAA',
			fontWeight: 'bold',
			fontSize,
			transition: 'color 0.2s ease',
			'&:hover': { color: '#fff' },
		}}
	>
		{label}
	</Typography>
)

export default NavLink
