'use client'

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
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: 'smooth' })
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
						width: '1440px',
						mx: 'auto',
						px: { xs: 2, md: 4 },
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<LogoSection scrollTo={scrollTo} />
					{!isMobile && <NavSection scrollTo={scrollTo} />}
					<CartSection isMobile={isMobile} setDrawerOpen={setDrawerOpen} />
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
