import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import logo from '../../../public/img/ui/LuxeRoe_gradient_purple_1080.svg'

interface LogoBlockProps {
	scrollTo?: (id: string) => void
	description?: string
	anchorId?: string
	isMobile?: boolean
	showText?: boolean
}

const LogoBlock = ({
	scrollTo,
	description,
	anchorId = 'sale-section',
	isMobile = false,
	showText = true,
}: LogoBlockProps) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: description ? 'column' : 'row',
				alignItems: 'center',
				gap: 1,
				minWidth: 180,
				cursor: scrollTo ? 'pointer' : 'default',
				flexShrink: 0,
				textAlign: 'center',
			}}
			onClick={() => scrollTo?.(anchorId)}
		>
			<Image
				src={logo}
				alt='Logo'
				height={isMobile ? 80 : 40}
				style={{ minWidth: 40 }}
			/>

			{showText && (
				<Typography
					variant='h6'
					sx={{
						fontWeight: 'bold',
						backgroundImage: 'linear-gradient(35deg, #f03, #08f)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						fontSize: isMobile ? '1.25rem' : '1.5rem',
					}}
				>
					LuxeRoe
				</Typography>
			)}

			{description && (
				<Typography
					sx={{
						fontSize: isMobile ? '16px' : '18px',
						color: '#ddd',
						mt: 1,
						maxWidth: 300,
					}}
				>
					{description}
				</Typography>
			)}
		</Box>
	)
}

export default LogoBlock
