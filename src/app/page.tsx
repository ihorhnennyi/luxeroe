import { HeroCarousel } from "@/components/hero";
import DeliveryPaymentSection from "@/components/info/DeliveryPaymentSection";
import ConsultSection from "@/components/lead/ConsultSection";
import CatalogSection from "@/components/products/CatalogSection";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import InstagramSection from "@/components/social/InstagramSection";
import OrderStepsSection from "@/components/steps/OrderStepsSection";
import { products } from "@/data/products";
import { promos } from "@/data/promos";
import { reviews } from "@/data/reviews";
import { Box, Container } from "@mui/material";

export default function HomePage() {
  return (
    <main>
      <HeroCarousel slides={promos} />

      <Box
        id="catalog"
        sx={{
          position: "relative",
          overflow: "clip", // вместо hidden: экономнее и не ломает тени в новых браузерах
          py: { xs: 3, md: 7 },
          background: "transparent",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <CatalogSection
            items={products}
            title="Осінній каталог"
            subtitle="Свіжі партії щотижня. Встигніть забрати акційні позиції."
          />
        </Container>

        <InstagramSection
          username="luxe.roe"
          profileUrl="https://www.instagram.com/luxe.roe/"
          posts={[
            "https://www.instagram.com/reel/DIGzcdkIKdx/?igsh=MXZwdXZmeDc2N3Vubw==",
            "https://www.instagram.com/p/DLb35wQtNhF/?igsh=MW8wcWM1cHNid2ljZw==",
            "https://www.instagram.com/reel/DKtYjZRN23O/?igsh=MTEzcjlvc2ZkaHliMQ==",
          ]}
        />

        <ConsultSection submitUrl="/api/lead" />

        <Box
          id="reviews"
          sx={{
            py: { xs: 4, md: 8 },
            background: "transparent",
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <ReviewsSection
              items={reviews}
              title="Відгуки клієнтів"
              subtitle="Справжні сторіс та рекомендації — дякуємо за довіру!"
            />
          </Container>
        </Box>

        <OrderStepsSection ctaHref="#catalog" />
        <DeliveryPaymentSection />
      </Box>
    </main>
  );
}
