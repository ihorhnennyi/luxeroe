// src/components/hero/PriceBadge.tsx
"use client";

import YardRoundedIcon from "@mui/icons-material/YardRounded";
import { Box, Stack, Typography } from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import * as React from "react";

const fmtUAH = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
      }).format(n)
    : "";

export default function PriceBadge({
  price,
  note = "Ціна за банку",
  Icon = YardRoundedIcon,
}: {
  price: number;
  note?: string;
  Icon?: React.ComponentType<SvgIconProps>;
}) {
  // ✅ гидрационно-безопасная строка цены
  const [label, setLabel] = React.useState<string>("");

  React.useEffect(() => {
    setLabel(fmtUAH(price));
  }, [price]);

  const aria = `${note}: ${label || `${price} ₴`}`;

  return (
    <Box
      aria-label={aria}
      sx={{
        position: "absolute",
        right: 12,
        bottom: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2.1,
        py: 1.05,
        borderRadius: 10,
        color: "#fff",
        background:
          "linear-gradient(135deg, #F2C14E 0%, #E08E45 50%, #B75C36 100%)",
        boxShadow: "0 10px 22px rgba(183,92,54,.28)",
        border: "1px solid rgba(255,255,255,.20)",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translate(-100%,-50%)",
          borderTop: "14px solid transparent",
          borderBottom: "14px solid transparent",
          borderRight: "14px solid #B75C36",
          filter: "brightness(0.9)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: -7,
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,.9)",
          boxShadow: "0 0 0 2px rgba(183,92,54,.65)",
        },
      }}
    >
      <Icon sx={{ fontSize: 18, opacity: 0.95 }} />
      <Stack sx={{ lineHeight: 1 }}>
        <Typography
          variant="caption"
          sx={{ opacity: 0.95, letterSpacing: 0.2, mb: 0.25 }}
        >
          {note}
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1.05 }}
          suppressHydrationWarning
        >
          {label || `${price} ₴`}
        </Typography>
      </Stack>
    </Box>
  );
}
