"use client";

import CartButton from "@/components/cart/CartButton";
import PhoneEnabledOutlinedIcon from "@mui/icons-material/PhoneEnabledOutlined";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  const pine = "#0E4F45";
  const amber = "#F2C14E";
  const russet = "#B75C36";
  const creamTop = "#FFF7EE";
  const cream = "#FFF2E6";

  // На мобильных — фон проще (без радиальных градиентов)
  const mobileBg = `linear-gradient(180deg, ${creamTop} 0%, ${cream} 100%)`;
  const desktopBg = `
    radial-gradient(900px 360px at -10% 0%, ${alpha(
      amber,
      0.18
    )} 0%, transparent 60%),
    radial-gradient(720px 320px at 110% 0%, ${alpha(
      russet,
      0.14
    )} 0%, transparent 60%),
    linear-gradient(180deg, ${creamTop} 0%, ${cream} 100%)
  `;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: 1,
        borderColor: alpha(russet, 0.18),
        background: { xs: mobileBg, sm: desktopBg },
        backdropFilter: "saturate(1.05)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            py: { xs: 0.75, sm: 1.2 },
            gap: { xs: 1.25, sm: 2 },
            justifyContent: "space-between",
          }}
        >
          {/* ЛОГО */}
          <Box
            component={Link}
            href="/"
            aria-label="LuxeRoe — головна"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.25 },
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo.svg"
                alt="LuxeRoe"
                fill
                sizes="(max-width: 600px) 32px, 40px"
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
            <Typography
              variant={upSm ? "h6" : "subtitle1"}
              sx={{
                fontWeight: 1000,
                letterSpacing: 0.2,
                color: pine,
                whiteSpace: "nowrap",
              }}
            >
              LuxeRoe
            </Typography>
          </Box>

          {/* Правый блок */}
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2.5 }}
            alignItems="center"
          >
            {/* Телефон: текст на sm+, иконка на xs */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              <PhoneEnabledOutlinedIcon
                sx={{ color: russet, fontSize: 20, mt: "1px" }}
                aria-hidden
              />
              <Typography
                component="a"
                href="tel:+380939858552"
                sx={{
                  fontWeight: 700,
                  color: pine,
                  textDecoration: "none",
                  fontSize: 16,
                  letterSpacing: 0.2,
                  "&:hover": { color: russet },
                }}
              >
                +38 (093) 985-85-52
              </Typography>
            </Stack>

            <IconButton
              href="tel:+380939858552"
              sx={{ display: { xs: "inline-flex", sm: "none" } }}
              aria-label="Позвонить"
            >
              <PhoneEnabledOutlinedIcon />
            </IconButton>

            {/* Кнопка корзины */}
            <CartButton />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
