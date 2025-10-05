// src/components/reviews/ReviewsSection.tsx
"use client";

import AnimatedCta from "@/components/hero/AnimatedCta";
import { Box, Container, Stack, Typography, alpha } from "@mui/material";

export type ReviewItem = {
  src: string;
  author?: string;
  note?: string;
};

export default function ReviewsSection({
  items,
  ctaHref = "https://www.instagram.com/luxe.roe/",
  hideBackground = false,
  title = "Відгуки клієнтів",
  subtitle = "Справжні сторіс та рекомендації — дякуємо за довіру!",
}: {
  items: ReviewItem[];
  ctaHref?: string;
  hideBackground?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const amber = "#F2C14E";

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 8 },
        background: hideBackground ? "none" : "transparent",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={1} sx={{ textAlign: "center", mb: { xs: 2.5, md: 4 } }}>
          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.4,
              color: "#7A3E1B",
              textShadow: "0 1px 0 rgba(255,255,255,.6)",
              fontSize: { xs: 22, sm: 26, md: 32 },
              lineHeight: { xs: 1.2, md: 1.15 },
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: 14, sm: 15.5 } }}
          >
            {subtitle}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 2, md: 3 },
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          {items.slice(0, 9).map((it, idx) => (
            <Box
              key={idx}
              sx={{
                position: "relative",
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#111",
                border: {
                  xs: `2px solid ${alpha(amber, 0.8)}`,
                  md: `3px solid ${alpha(amber, 0.9)}`,
                },
                boxShadow: {
                  xs: "0 10px 24px rgba(183,92,54,.16)",
                  md: "0 18px 42px rgba(183,92,54,.18)",
                },
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.333% - 16px)",
                },
                maxWidth: { xs: "100%", sm: 360 },
                aspectRatio: "9 / 16",
              }}
            >
              <Box
                component="img"
                src={it.src}
                alt={it.author ? `Відгук ${it.author}` : "Відгук"}
                loading="lazy"
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  const img = e.currentTarget;
                  if (!img.src.includes("placeholder.jpg"))
                    img.src = "/placeholder.jpg";
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {(it.author || it.note) && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: { xs: 0.75, sm: 1 },
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 60%)",
                    color: "#fff",
                  }}
                >
                  {it.author && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: 800,
                        fontSize: { xs: 11.5, sm: 12 },
                      }}
                    >
                      {it.author}
                    </Typography>
                  )}
                  {it.note && (
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, fontSize: { xs: 11.5, sm: 12 } }}
                    >
                      {it.note}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Stack alignItems="center" sx={{ mt: { xs: 3, md: 4 } }}>
          <AnimatedCta href={ctaHref} rel="noopener noreferrer">
            Більше відгуків в Instagram
          </AnimatedCta>
        </Stack>
      </Container>
    </Box>
  );
}
