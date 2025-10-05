// src/components/products/SpecLine.tsx
"use client";

import { Box, Typography } from "@mui/material";

export default function SpecLine({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color?: string;
}) {
  if (!value) return null;
  return (
    <Typography fontSize={{ xs: 13.5, sm: 14.5 }} lineHeight={1.5}>
      <Box
        component="span"
        sx={{ fontWeight: 700, color: color ?? "warning.main", mr: 0.5 }}
      >
        {label}
      </Box>
      <Box component="span" sx={{ color: "text.primary" }}>
        {value}
      </Box>
    </Typography>
  );
}
