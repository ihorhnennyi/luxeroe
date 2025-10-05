// src/components/social/InstagramSection.tsx
"use client";

import AnimatedCta from "@/components/hero/AnimatedCta";
import { Box, Container, Stack, Typography } from "@mui/material";
import InstagramEmbed from "./InstagramEmbed";

type Props = {
  username: string;
  profileUrl: string;
  posts?: string[];
};

export default function InstagramSection({
  username,
  profileUrl,
  posts = [],
}: Props) {
  const amber = "#F2C14E";
  const pumpkin = "#E08E45";

  // возьмём максимум 3 записи (как и было)
  const top = posts.slice(0, 3);

  return (
    <Box
      component="section"
      sx={{ py: { xs: 6, md: 10 }, background: "transparent" }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
        >
          {/* Левый текстовый блок */}
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2, fontWeight: 900, color: "#0E4F45" }}
            >
              Будь на звʼязку
            </Typography>

            <Typography
              component="h2"
              variant="h3"
              sx={{ fontWeight: 1000, letterSpacing: -0.6, mb: 1 }}
            >
              Підписуйся на Instagram
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 560, mx: { xs: "auto", md: "initial" } }}
            >
              Живі пости (без скринів): акції, рецепти та ідеї подачі — усе в
              нашому профілі.
            </Typography>

            <Stack
              component="ul"
              spacing={1.2}
              sx={{ listStyle: "none", p: 0, mb: 3 }}
            >
              {[
                "−10% на замовлення за підписку",
                "Рецепти, подача та ідеї страв",
                "Щотижневі акції та знижки",
                "Розіграші та подарунки",
              ].map((t) => (
                <Stack
                  key={t}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  component="li"
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50% 40% 60% 50% / 50% 50% 40% 60%",
                      background: `linear-gradient(145deg, ${amber} 0%, ${pumpkin} 90%)`,
                      boxShadow: "0 3px 6px rgba(183,92,54,.25)",
                    }}
                  />
                  <Typography>{t}</Typography>
                </Stack>
              ))}
            </Stack>

            <AnimatedCta
              href={profileUrl}
              anim="pulse"
              rel="noopener noreferrer"
              sx={{ mt: 1 }}
            >
              Перейти в Instagram @{username}
            </AnimatedCta>
          </Box>

          {/* Правый блок с эмбедами */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ flex: 1, width: "100%", justifyContent: "center" }}
          >
            {top.map((u, idx) => (
              <Box
                key={u}
                sx={{
                  // На телефоне оставляем только первый блок
                  display: { xs: idx === 0 ? "block" : "none", sm: "block" },
                  flex: 1,
                  minWidth: { xs: "100%", sm: 260 },
                  maxWidth: { xs: "100%", sm: 360 },
                  bgcolor: "#fff",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <InstagramEmbed url={u} />
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
