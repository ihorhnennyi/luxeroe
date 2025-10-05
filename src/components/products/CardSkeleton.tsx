// src/components/products/CardSkeleton.tsx
"use client";

import { Box, Skeleton, Stack } from "@mui/material";

export default function CardSkeleton() {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ position: "relative", pt: { xs: "70%", sm: "68%" } }}>
        <Skeleton
          variant="rectangular"
          sx={{ position: "absolute", inset: 0 }}
        />
      </Box>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1 }}>
        <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={18} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Skeleton width={52} height={26} />
          <Skeleton width={52} height={26} />
          <Skeleton width={52} height={26} />
        </Stack>
        <Skeleton variant="rectangular" height={40} />
      </Box>
    </Box>
  );
}
