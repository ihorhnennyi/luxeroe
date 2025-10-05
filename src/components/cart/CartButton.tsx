// src/components/cart/CartButton.tsx
"use client";

import { useCart } from "@/store/cart";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Badge, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

export default function CartButton({ color = "#0E4F45" }: { color?: string }) {
  const count = useCart((s) => s.items.reduce((n, it) => n + it.qty, 0));

  return (
    <IconButton
      aria-label="Кошик"
      component={Link}
      href="/cart"
      sx={{
        color,
        "&:hover": { color: alpha("#B75C36", 0.95) },
        width: { xs: 44, sm: 40 },
        height: { xs: 44, sm: 40 },
      }}
    >
      <Badge
        color="error"
        badgeContent={count || null}
        overlap="circular"
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontWeight: 800,
            fontSize: { xs: 10, sm: 9 },
            minWidth: { xs: 18, sm: 16 },
            height: { xs: 18, sm: 16 },
          },
        }}
      >
        <ShoppingCartOutlinedIcon sx={{ fontSize: { xs: 24, sm: 22 } }} />
      </Badge>
    </IconButton>
  );
}
