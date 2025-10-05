// src/types/promo.ts
export type PriceStyle =
  | "ticket"
  | "chip"
  | "corner"
  | "autumn"
  | "autumnRibbon";

export interface PromoSlide {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  imageSrc: string;
  imageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  price?: number;
  priceNote?: string;
  priceStyle?: PriceStyle;
  countdownTo?: string;
  tags?: string[];

  // действия CTA
  action?:
    | {
        kind: "add"; // обычные товары (если понадобится)
        items: Array<{ id: string; qty?: number }>;
        openCart?: boolean;
      }
    | {
        kind: "bundle"; // единый товар-сет
        id: string; // id позиции в корзине
        title: string; // заголовок позиции
        price: number; // цена всего набора
        image?: string; // картинка набора
        note?: string; // подпись (опционально)
        openCart?: boolean;
        // items?: Array<{ id: string; qty: number }>; // ← Больше НЕ нужно (оставляем опц.)
      };
}
