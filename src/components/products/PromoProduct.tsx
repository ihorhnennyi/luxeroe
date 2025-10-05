// src/components/products/PromoProduct.tsx
"use client";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export type PromoProductData = {
  title: string;
  image: string;
  banner?: string;
  attrs: Array<{ label: string; value: string; color?: string }>;
  netWeight?: string;
  price?: number;
  oldPrice?: number;
  cta?: string;
};

const fmtUAH = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
      }).format(n)
    : "";

export default function PromoProduct({
  data,
  onOrder,
}: {
  data: PromoProductData;
  onOrder?: () => void;
}) {
  const { title, image, banner, attrs, netWeight, price, oldPrice, cta } = data;

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, md: 3 },
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(255,180,0,0.06) 0%, rgba(255,255,255,1) 40%)",
      }}
    >
      {banner && (
        <Box
          sx={{
            position: "absolute",
            left: { xs: 12, md: 24 },
            right: { xs: 12, md: 24 },
            top: -12,
            textAlign: "center",
            bgcolor: "error.main",
            color: "#fff",
            borderRadius: 2,
            px: { xs: 1.5, md: 2 },
            py: { xs: 0.6, md: 0.75 },
            fontWeight: 800,
            fontSize: { xs: 12, md: 14 },
            boxShadow: (t) => `0 6px 16px ${alpha(t.palette.error.main, 0.3)}`,
          }}
        >
          {banner}
        </Box>
      )}

      <Stack spacing={2}>
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box
            component="img"
            src={image || "/placeholder.jpg"}
            alt={title}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const img = e.currentTarget;
              if (!img.src.includes("placeholder.jpg"))
                img.src = "/placeholder.jpg";
            }}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: { xs: 420, md: 520 },
              objectFit: "cover",
              backgroundColor: "action.hover",
            }}
          />
        </Box>

        <Box sx={{ px: { xs: 0, md: 1 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: 0.6,
              textAlign: "center",
              mb: { xs: 1.5, md: 2 },
              textTransform: "uppercase",
              color: "error.dark",
              fontSize: { xs: 20, sm: 24, md: 28 },
            }}
          >
            {title}
          </Typography>

          <Stack spacing={1.1} sx={{ mb: 2 }}>
            {attrs.map((a, i) => (
              <Typography
                key={i}
                fontSize={{ xs: 14.5, md: 16 }}
                lineHeight={1.5}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: a.color ?? "warning.main",
                    mr: 0.5,
                  }}
                >
                  {a.label}
                </Box>
                <Box component="span" sx={{ color: "text.primary" }}>
                  {a.value}
                </Box>
              </Typography>
            ))}
          </Stack>

          {netWeight && (
            <>
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ fontWeight: 800, my: 1, fontSize: { xs: 16, md: 18 } }}
              >
                Маса нетто: {netWeight}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
            </>
          )}

          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {typeof oldPrice === "number" && (
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: 14, md: 15 } }}
              >
                Звичайна ціна:{" "}
                <Box component="span" sx={{ textDecoration: "line-through" }}>
                  {fmtUAH(oldPrice)}
                </Box>
              </Typography>
            )}
            {typeof price === "number" && (
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 22, md: 28 },
                  color: "error.main",
                }}
              >
                Ціна до кінця тижня: {fmtUAH(price)}
              </Typography>
            )}
          </Stack>

          <Button
            fullWidth
            size="large"
            onClick={onOrder}
            startIcon={
              <ShoppingCartIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            }
            sx={{
              mt: 1,
              py: { xs: 1.1, md: 1.4 },
              borderRadius: 999,
              fontWeight: 900,
              letterSpacing: 0.6,
              color: "#fff",
              background:
                "linear-gradient(180deg, #FFA94D 0%, #FF922B 55%, #FF7A00 100%)",
              boxShadow: (t) =>
                `0 8px 22px ${alpha(t.palette.warning.main, 0.35)}`,
              "&:hover": {
                background:
                  "linear-gradient(180deg, #FF9F40 0%, #FF8A1F 55%, #FF6A00 100%)",
              },
            }}
          >
            {cta ?? "Замовити"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
