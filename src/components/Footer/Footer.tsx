import LogoBlock from '@/components/common/LogoBlock'
import { scrollToAnchor } from '@/utils/scrollTo'
import { Box, useMediaQuery } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import ContactInfo from './ContactInfo'
import FeedbackForm from './FeedbackForm'

const Footer = () => {
	const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
	const router = useRouter()

	const handleNavigation = (anchorId: string) => {
		if (window.location.pathname !== '/') {
			router.push('/')
			setTimeout(() => scrollToAnchor(anchorId), 200)
		} else {
			scrollToAnchor(anchorId)
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: isMobile ? 'column' : 'row',
				alignItems: 'center',
				justifyContent: isMobile ? 'center' : 'space-around',
				mt: 5,
				pt: 5,
				pb: 5,
				backgroundColor: '#1E1D1C',
				width: '100%',
				maxWidth: '2560px',
				gap: isMobile ? 4 : 0,
			}}
		>
			<LogoBlock
				scrollTo={handleNavigation}
				description='Червона та чорна ікра - ваш найкращий делікатес до столу! Свіжість та якість продукту від надійного постачальника! Якість та легкий процес замовлення - наші найбільші переваги!'
				isMobile={isMobile}
			/>
			<ContactInfo isMobile={isMobile} />
			<FeedbackForm isMobile={isMobile} />
		</Box>
	)
}

export default Footer
