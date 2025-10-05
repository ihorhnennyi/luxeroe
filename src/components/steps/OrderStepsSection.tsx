// src/components/steps/OrderStepsSection.tsx
"use client";

import AnimatedCta from "@/components/hero/AnimatedCta";
import { orderSteps, type StepItem } from "@/data/orderSteps";
import { Box, Container, Stack, Typography, alpha } from "@mui/material";

export default function OrderStepsSection({
  title = "Як замовити",
  subtitle = "Просто три кроки — і свіжа ікра вже прямує до вас.",
  steps = orderSteps,
  ctaText = "Перейти до каталогу",
  ctaHref = "#catalog",
}: {
  title?: string;
  subtitle?: string;
  steps?: StepItem[];
  ctaText?: string;
  ctaHref?: string;
}) {
  const amber = "#F2C14E";
  const pumpkin = "#E08E45";

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 10 },
        background: "transparent",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack
          spacing={1.2}
          sx={{ textAlign: "center", mb: { xs: 3.5, md: 6 } }}
        >
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.6,
              color: "#7A3E1B",
              textShadow: "0 1px 0 rgba(255,255,255,.6)",
              fontSize: { xs: 24, sm: 28, md: 36 },
              lineHeight: { xs: 1.2, md: 1.15 },
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: 14, sm: 15.5 }, mx: "auto", maxWidth: 720 }}
          >
            {subtitle}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            mx: { xs: 0, sm: 6 },
            "&::before": {
              content: '""',
              position: "absolute",
              left: { xs: 24, sm: "50%" },
              transform: { xs: "none", sm: "translateX(-50%)" },
              top: 0,
              bottom: 0,
              width: { xs: 3, sm: 4 },
              borderRadius: 3,
              background: `linear-gradient(180deg, ${amber}, ${pumpkin})`,
              opacity: 0.6,
            },
          }}
        >
          <Stack spacing={{ xs: 3.5, md: 6 }}>
            {steps.map((s, i) => {
              const leftSide = i % 2 === 0;
              return (
                <Box
                  key={i}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "48px 1fr", sm: "1fr 60px 1fr" },
                    alignItems: "center",
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  {/* левая колонка (desktop) */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "block" },
                      justifySelf: "end",
                      visibility: leftSide ? "visible" : "hidden",
                      maxWidth: 560,
                    }}
                  >
                    {leftSide && (
                      <StepCard title={s.title} text={s.text} ring={amber} />
                    )}
                  </Box>

                  {/* маркер */}
                  <Box sx={{ justifySelf: { xs: "start", sm: "center" } }}>
                    <LeafBadge num={(s.num ?? i + 1).toString()} />
                  </Box>

                  {/* правая колонка (desktop) */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "block" },
                      justifySelf: "start",
                      visibility: !leftSide ? "visible" : "hidden",
                      maxWidth: 560,
                    }}
                  >
                    {!leftSide && (
                      <StepCard title={s.title} text={s.text} ring={amber} />
                    )}
                  </Box>

                  {/* мобильная версия: карточка на всю ширину под маркером */}
                  <Box
                    sx={{
                      gridColumn: "1 / span 2",
                      display: { xs: "block", sm: "none" },
                    }}
                  >
                    <StepCard title={s.title} text={s.text} ring={amber} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Stack alignItems="center" sx={{ mt: { xs: 4.5, md: 7 } }}>
          <AnimatedCta href={ctaHref} anim="pulse">
            {ctaText}
          </AnimatedCta>
        </Stack>
      </Container>
    </Box>
  );
}

/* ===== Листочек с номером ===== */
function LeafBadge({ num }: { num: string }) {
  const amber = "#F2C14E";
  const pumpkin = "#E08E45";
  const russet = "#B75C36";
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: 44, sm: 56 },
        height: { xs: 44, sm: 56 },
        filter: {
          xs: "drop-shadow(0 6px 14px rgba(183,92,54,.22))",
          sm: "drop-shadow(0 8px 18px rgba(183,92,54,.25))",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "45% 55% 45% 55% / 55% 45% 55% 45%",
          transform: "rotate(-18deg)",
          background: `linear-gradient(135deg, ${amber} 0%, ${pumpkin} 60%, ${russet} 100%)`,
          border: `2px solid ${alpha(russet, 0.45)}`,
        }}
      />
      <Typography
        component="span"
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "#3b2a1e",
          fontWeight: 1000,
          fontSize: { xs: 16, sm: 18 },
        }}
      >
        {num}
      </Typography>
    </Box>
  );
}

/* ===== Карточка шага ===== */
function StepCard({
  title,
  text,
  ring,
}: {
  title: string;
  text: string;
  ring: string;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        p: { xs: 1.75, md: 2.5 },
        bgcolor: "#fff",
        border: `1px solid ${alpha("#B75C36", 0.18)}`,
        boxShadow: {
          xs: "0 10px 22px rgba(183,92,54,.10)",
          md: "0 14px 28px rgba(183,92,54,.10)",
        },
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: -3,
          borderRadius: 3,
          border: {
            xs: `1.5px dashed ${alpha(ring, 0.6)}`,
            md: `2px dashed ${alpha(ring, 0.65)}`,
          },
          pointerEvents: "none",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          mb: 0.5,
          color: "#7A3E1B",
          letterSpacing: 0.2,
          fontSize: { xs: 16, sm: 18 },
          lineHeight: { xs: 1.25, sm: 1.2 },
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ fontSize: { xs: 14, sm: 15.5 } }}
      >
        {text}
      </Typography>
    </Box>
  );
}
