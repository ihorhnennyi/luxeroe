import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import logo from '../../../public/img/ui/LuxeRoe_gradient_purple_1080.svg'

const LogoSection = ({ scrollTo }: { scrollTo: (id: string) => void }) => (
	<Box
		sx={{
			display: 'flex',
			alignItems: 'center',
			gap: 1,
			minWidth: 180,
			flexShrink: 0,
			cursor: 'pointer',
		}}
		onClick={() => scrollTo('sale-section')}
	>
		<Image src={logo} alt='Logo' height={40} style={{ minWidth: 40 }} />

		<Typography
			variant='h6'
			sx={{
				fontWeight: 'bold',
				backgroundImage: 'linear-gradient(35deg, #f03, #08f)',
				WebkitBackgroundClip: 'text',
				WebkitTextFillColor: 'transparent',
			}}
		>
			LuxeRoe
		</Typography>
	</Box>
)

export default LogoSection
