// src/components/Footer.tsx
"use client";

import InstagramIcon from "@mui/icons-material/Instagram";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const pine = "#0F5A57";
  const russet = "#B75C36";

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        pt: { xs: 6, md: 8 },
        pb: 3,
        color: "#3B2A1E",
        background: "transparent",
        borderTop: `1px solid ${alpha(russet, 0.12)}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 6 }}
          alignItems={{ xs: "center", md: "center" }}
          justifyContent="space-between"
          textAlign={{ xs: "center", md: "left" }}
        >
          {/* Бренд */}
          <Stack
            spacing={1.5}
            sx={{ minWidth: 0, alignItems: { xs: "center", md: "flex-start" } }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ position: "relative", width: 40, height: 40 }}>
                <Image
                  src="/logo.svg"
                  alt="IKRA.store"
                  fill
                  sizes="40px"
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, letterSpacing: 0.2, color: pine }}
              >
                LuxeRoe
              </Typography>
            </Stack>
            <Typography
              sx={{
                color: alpha("#3B2A1E", 0.8),
                maxWidth: 520,
              }}
            >
              Преміальна ікра та морські делікатеси з доставкою по Україні.
            </Typography>
          </Stack>

          {/* Контакти + соцсети */}
          <Stack
            spacing={1.25}
            alignItems={{ xs: "center", md: "flex-end" }}
            textAlign={{ xs: "center", md: "right" }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 900, color: pine }}
            >
              Контакти
            </Typography>
            <Typography
              component="a"
              href="tel:+380939858552"
              sx={{
                color: alpha("#3B2A1E", 0.95),
                textDecoration: "none",
                "&:hover": { color: pine },
              }}
            >
              +38 (093) 985-85-52
            </Typography>
            <Typography
              component="a"
              href="mailto:luxeroe.shop@gmail.com"
              sx={{
                color: alpha("#3B2A1E", 0.95),
                textDecoration: "none",
                "&:hover": { color: pine },
              }}
            >
             luxeroe.shop@gmail.com
            </Typography>
            <Typography sx={{ color: alpha("#3B2A1E", 0.75) }}>
              Пн–Нд: 9:00 – 21:00
            </Typography>

            <Stack direction="row" spacing={1.2} sx={{ mt: 0.5 }}>
              {[
                {
                  icon: <InstagramIcon />,
                  href: "https://www.instagram.com/luxe.roe/",
                },
              ].map((s, i) => (
                <IconButton
                  key={i}
                  component={Link}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="social"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    color: pine,
                    border: `1px solid ${alpha(russet, 0.25)}`,
                    backgroundColor: alpha("#F2C14E", 0.1),
                    "&:hover": { backgroundColor: alpha("#F2C14E", 0.2) },
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: alpha(russet, 0.16) }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          textAlign="center"
          sx={{ color: alpha("#3B2A1E", 0.7) }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} LuxeRoe — усі права захищені
          </Typography>
          <Typography variant="body2">Зроблено з ❤️</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
