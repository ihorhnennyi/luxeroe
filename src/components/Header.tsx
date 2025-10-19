// src/components/Header.tsx
'use client'

import CartButton from '@/components/cart/CartButton'
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined'
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  alpha
} from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  const PINE = '#0E4F45'
  const AMBER = '#F2C14E'
  const RUSSET = '#B75C36'
  const CREAM_TOP = '#FFF7EE'
  const CREAM = '#FFF2E6'

  const PHONE = '+380939858552'
  const telHref = `tel:${PHONE.replace(/\s+/g, '')}`

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: 1,
        borderColor: alpha(RUSSET, 0.18),
        // ✅ фон задаём через responsive sx, без useMediaQuery
        background: {
          xs: `linear-gradient(180deg, ${CREAM_TOP} 0%, ${CREAM} 100%)`,
          sm: `
            radial-gradient(900px 360px at -10% 0%, ${alpha(AMBER, 0.18)} 0%, transparent 60%),
            radial-gradient(720px 320px at 110% 0%, ${alpha(RUSSET, 0.14)} 0%, transparent 60%),
            linear-gradient(180deg, ${CREAM_TOP} 0%, ${CREAM} 100%)
          `
        },
        backdropFilter: 'saturate(1.05)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            py: { xs: 0.75, sm: 1.2 },
            gap: { xs: 1.25, sm: 2 },
            justifyContent: 'space-between'
          }}
        >
          {/* Лого */}
          <Box
            component={Link}
            href="/"
            aria-label="LuxeRoe — на головну"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.25 },
              textDecoration: 'none',
              color: 'inherit',
              minWidth: 0
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                flexShrink: 0
              }}
            >
              <Image
                src="/logo.svg"
                alt="LuxeRoe"
                fill
                sizes="(max-width: 600px) 32px, 40px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
            <Typography
              // вместо responsive variant — задаём размер шрифтом
              variant="h6"
              sx={{
                fontWeight: 1000,
                letterSpacing: 0.2,
                color: PINE,
                whiteSpace: 'nowrap',
                fontSize: { xs: 16, sm: 20 },
                lineHeight: 1.1
              }}
            >
              LuxeRoe
            </Typography>
          </Box>

          {/* Правый блок */}
          <Stack direction="row" spacing={{ xs: 1, sm: 2.5 }} alignItems="center">
            {/* Телефон — показываем и как текст (sm+), и как иконку (xs) через CSS.
               HTML одинаковый на SSR/CSR → никаких mismatches. */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <PhoneEnabledOutlinedIcon
                sx={{ color: RUSSET, fontSize: 20, mt: '1px' }}
                aria-hidden
              />
              <Typography
                component="a"
                href={telHref}
                sx={{
                  fontWeight: 700,
                  color: PINE,
                  textDecoration: 'none',
                  fontSize: 16,
                  letterSpacing: 0.2,
                  '&:hover': { color: RUSSET }
                }}
              >
                {PHONE}
              </Typography>
            </Stack>

            <IconButton
              component="a"
              href={telHref}
              sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: PINE }}
              aria-label="Подзвонити"
            >
              <PhoneEnabledOutlinedIcon />
            </IconButton>

            <CartButton />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
