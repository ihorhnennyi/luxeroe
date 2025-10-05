// src/app/cart/page.tsx
"use client";

import CartCheckout from "@/components/cart/CartCheckout";
import CartItems from "@/components/cart/CartItems";
import { useCart } from "@/store/cart";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items } = useCart();
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (!ordered) return;
    const id = setTimeout(() => router.replace("/"), 1500);
    return () => clearTimeout(id);
  }, [ordered, router]);

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "baseline" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
          justifyContent: "space-between",
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontSize: { xs: 22, sm: 28 } }}
        >
          Ваше замовлення
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="text"
          sx={{ alignSelf: { xs: "flex-start", sm: "center" }, px: 0 }}
        >
          Продовжити покупки
        </Button>
      </Box>

      {ordered ? (
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Alert severity="success" sx={{ mb: 1.5, justifyContent: "center" }}>
            Дякуємо! Замовлення надіслано.
          </Alert>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Зараз ви будете перенаправлені на головну…
          </Typography>
          <Button component={Link} href="/" variant="contained">
            На головну
          </Button>
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            textAlign: "center",
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 0.5 }}>
            Кошик порожній
          </Typography>
          <Typography color="text.secondary">
            Додайте товар із каталогу.
          </Typography>
        </Box>
      ) : (
        <>
          <CartItems />
          <CartCheckout onSuccess={() => setOrdered(true)} />
        </>
      )}
    </Container>
  );
}
