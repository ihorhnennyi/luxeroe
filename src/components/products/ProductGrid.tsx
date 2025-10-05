// src/components/products/ProductGrid.tsx
"use client";

import type { Product } from "@/types/product";
import { Box, Typography } from "@mui/material";
import CardSkeleton from "./CardSkeleton";
import ProductCard from "./ProductCard";

type Props = {
  items: Product[];
  loading?: boolean;
  skeletonCount?: number;
  minColWidth?: number;
};

export default function ProductGrid({
  items,
  loading = false,
  skeletonCount = 8,
  minColWidth = 280,
}: Props) {
  if (!loading && items.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Поки немає товарів
        </Typography>
        <Typography color="text.secondary">
          Змініть фільтри або зазирніть пізніше.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: `repeat(auto-fit, minmax(clamp(220px, 24vw, ${minColWidth}px), 1fr))`,
        },
        gap: { xs: 2, md: 3 },
        alignItems: "stretch",
      }}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <CardSkeleton key={`sk-${i}`} />
          ))
        : items.map((p) => <ProductCard key={p.id} product={p} />)}
    </Box>
  );
}
