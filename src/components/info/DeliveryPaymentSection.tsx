"use client";

import type { DeliveryItem } from "@/data/deliveryPayment";
import { deliveryPaymentItems } from "@/data/deliveryPayment";
import { Box, Container, Stack, Typography, alpha } from "@mui/material";

export default function DeliveryPaymentSection({
  title = "Доставка та оплата",
  subtitle = "Чітко, швидко і без передоплат — все для вашої зручності.",
  items = deliveryPaymentItems,
}: {
  title?: string;
  subtitle?: string;
  items?: DeliveryItem[];
}) {
  const amber = "#F2C14E";
  const pumpkin = "#E08E45";
  const russet = "#B75C36";

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 9 },
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={1} sx={{ textAlign: "center", mb: { xs: 3.5, md: 6 } }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.6,
              color: "#7A3E1B",
              textShadow: "0 1px 0 rgba(255,255,255,.6)",
              fontSize: { xs: 24, sm: 28, md: 36 },
              lineHeight: { xs: 1.25, md: 1.15 },
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

        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {items.map(({ title, text, Icon }, i) => (
            <Box
              key={i}
              sx={{
                position: "relative",
                borderRadius: 3,
                bgcolor: "#fff",
                border: `1px solid ${alpha(russet, 0.12)}`,
                boxShadow: {
                  xs: "0 10px 24px rgba(183,92,54,.10)",
                  md: "0 20px 40px rgba(183,92,54,.10)",
                },
                p: { xs: 2, sm: 2.5, md: 3 },
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: { xs: 4, sm: 6 },
                  background: `linear-gradient(180deg, ${amber}, ${pumpkin}, ${russet})`,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1.75, sm: 2.25 }}
                alignItems="center"
              >
                <Box
                  aria-hidden
                  sx={{
                    width: { xs: 48, sm: 58, md: 66 },
                    height: { xs: 48, sm: 58, md: 66 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(180deg,#FFFDFC 0%, #FFE9C7 100%)",
                    border: `1px solid ${alpha(russet, 0.25)}`,
                    color: "#A4512E",
                    flexShrink: 0,
                    boxShadow: {
                      xs: "0 4px 10px rgba(183,92,54,.15)",
                      md: "0 6px 14px rgba(183,92,54,.18)",
                    },
                  }}
                >
                  {Icon ? (
                    <Icon sx={{ fontSize: { xs: 26, sm: 28, md: 32 } }} />
                  ) : null}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: "#7A3E1B",
                      mb: 0.4,
                      fontSize: { xs: 16, sm: 18 },
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
              </Stack>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
