'use client'

import InstagramIcon from '@mui/icons-material/Instagram'
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const PINE = '#0F5A57'
  const RUSSET = '#B75C36'
  const TEXT = '#3B2A1E'

  const PHONE = '+38 (093) 985-85-52'
  const PHONE_TEL = `tel:${PHONE.replace(/[^\d+]/g, '')}`
  const EMAIL = 'luxeroe.shop@gmail.com'
  const IG_URL = 'https://www.instagram.com/luxe.roe/'

  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        pt: { xs: 6, md: 8 },
        pb: 3,
        color: TEXT,
        borderTop: `1px solid ${alpha(RUSSET, 0.12)}`
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 6 }}
          alignItems={{ xs: 'center', md: 'center' }}
          justifyContent="space-between"
          textAlign={{ xs: 'center', md: 'left' }}
        >
          <Stack spacing={1.5} sx={{ minWidth: 0, alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                <Image
                  src="/logo.svg"
                  alt="LuxeRoe"
                  fill
                  sizes="40px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2, color: PINE }}>
                LuxeRoe
              </Typography>
            </Stack>

            <Typography sx={{ color: alpha(TEXT, 0.8), maxWidth: 520 }}>
              Преміальна ікра та морські делікатеси з доставкою по Україні.
            </Typography>
          </Stack>

          <Stack
            spacing={1.25}
            alignItems={{ xs: 'center', md: 'flex-end' }}
            textAlign={{ xs: 'center', md: 'right' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: PINE }}>
              Контакти
            </Typography>

            <address style={{ fontStyle: 'normal' }}>
              <MuiLink
                href={PHONE_TEL}
                underline="none"
                sx={{ color: alpha(TEXT, 0.95), '&:hover': { color: PINE } }}
              >
                {PHONE}
              </MuiLink>
              <br />
              <MuiLink
                href={`mailto:${EMAIL}`}
                underline="none"
                sx={{ color: alpha(TEXT, 0.95), '&:hover': { color: PINE } }}
              >
                {EMAIL}
              </MuiLink>
            </address>

            <Typography sx={{ color: alpha(TEXT, 0.75) }}>Пн–Нд: 9:00 – 21:00</Typography>

            <Stack direction="row" spacing={1.2} sx={{ mt: 0.5 }}>
              <IconButton
                component={Link}
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Відкрити Instagram LuxeRoe"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: PINE,
                  border: `1px solid ${alpha(RUSSET, 0.25)}`,
                  backgroundColor: alpha('#F2C14E', 0.1),
                  '&:hover': { backgroundColor: alpha('#F2C14E', 0.2) }
                }}
              >
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: alpha(RUSSET, 0.16) }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'center' }}
          textAlign="center"
          sx={{ color: alpha(TEXT, 0.7) }}
        >
          <Typography variant="body2">© {year} LuxeRoe — усі права захищені</Typography>
          <Typography variant="body2">Зроблено з ❤️</Typography>
        </Stack>
      </Container>
    </Box>
  )
}
