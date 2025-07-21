'use client'

import { scrollToElement } from '@/utils/scrollTo'
import { AppBar, Box, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import CartSection from './CartSection'
import LogoSection from './LogoSection'
import MobileDrawer from './MobileDrawer'
import NavSection from './NavSection'

const Header = () => {
	const isMobile = useMediaQuery('(max-width:1200px)')
	const [drawerOpen, setDrawerOpen] = useState(false)

	const scrollTo = (id: string) => {
		scrollToElement(id)
		setDrawerOpen(false)
	}

	return (
		<>
			<AppBar
				position='fixed'
				sx={{ backgroundColor: '#1A1918', py: 2, borderBottom: 1 }}
			>
				<Box
					sx={{
						width: '100%',
						maxWidth: '1440px',
						mx: 'auto',
						px: { xs: 2, sm: 3, md: 4 },
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					{isMobile ? (
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								width: '100%',
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<LogoSection scrollTo={scrollTo} />
							</Box>
							<Box sx={{ ml: 'auto' }}>
								<CartSection isMobile setDrawerOpen={setDrawerOpen} />
							</Box>
						</Box>
					) : (
						<>
							<LogoSection scrollTo={scrollTo} />
							<NavSection scrollTo={scrollTo} />
							<CartSection isMobile={false} setDrawerOpen={setDrawerOpen} />
						</>
					)}
				</Box>
			</AppBar>

			<MobileDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				scrollTo={scrollTo}
			/>
		</>
	)
}

export default Header
