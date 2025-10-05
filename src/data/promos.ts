// src/data/promos.ts
import type { PromoSlide } from "@/types/promo";

export const promos: PromoSlide[] = [
  // 1) Промо-банка горбуши как отдельный товар
  {
    eyebrow: "Знижка тижня",
    title: "Горбуша — стартуй зі смаком",
    subtitle:
      "Соковиті ікринки з чистим післясмаком. Ідеально для тостів, тарталеток і святкових сетів.",
    bullets: ["Свіжа партія щодня", "Виразний смак", "Охолоджена доставка"],
    imageSrc: "/img/gorbush.webp",
    imageAlt: "Ікра горбуші",
    price: 279,
    priceNote: "Вигідний старт",
    priceStyle: "autumn",
    ctaText: "Додати промо-баночку",
    action: {
      kind: "bundle",
      id: "bundle-gorbush-279",
      title: "Ікра горбуші — промо баночка",
      price: 279,
      image: "/img/gorbush.webp",
      note: "Промо: перша баночка",
      openCart: true,
    },
    tags: ["Гарячий попит"],
  },

  // 2) Сет 2+1 — одна позиція-сет
  {
    eyebrow: "Акція 2+1",
    title: "Більше ікри — більше радості",
    subtitle:
      "Влаштуй щедру подачу: більше смаку, більше приводів сказати «вау».",
    bullets: ["Ідеально для вечірки", "Щедра порція", "Готово одним кліком"],
    imageSrc: "/img/gorbush.webp", // ← поставь реальную картинку набора (3 банки в кадрі)
    imageAlt: "Набір 3 банки (2+1)",
    ctaText: "Взяти сет 2+1",
    price: 1098, // цена сета целиком
    priceNote: "За 3 банки",
    priceStyle: "autumn",
    action: {
      kind: "bundle",
      id: "bundle-2plus1",
      title: "Набір 2+1 (3 банки)",
      price: 1098,
      image: "/img/gorbush.webp",
      note: "Фіксована ціна за сет",
      openCart: true,
    },
    tags: ["Party-ready"],
  },

  // 3) Сет 5 — одна позиція-сет
  {
    eyebrow: "Набір вигоди",
    title: "П’ятірка для свята",
    subtitle:
      "Закрий питання частувань одним кліком: вистачить і на тости, і на роли.",
    bullets: ["На велику компанію", "До ігристого", "Максимальна вигода"],
    imageSrc: "/img/gorbush.webp", // ← картинка набора на 5 банок
    imageAlt: "Набір із 5 банок",
    price: 1500,
    priceNote: "За 5 банок",
    priceStyle: "autumnRibbon",
    ctaText: "Взяти набір 5",
    action: {
      kind: "bundle",
      id: "bundle-5",
      title: "Набір із 5 банок",
      price: 1500,
      image: "/img/gorbush.webp",
      note: "Фікс-ціна за 5 банок",
      openCart: true,
    },
    tags: ["Максимальна вигода"],
  },
];
