// src/data/promos.ts
import type { PromoSlide } from '@/types/promo'

export const promos: PromoSlide[] = [
  // 1) Промо-банка горбуші як окремий товар
  {
    eyebrow: 'Знижка тижня',
    title: 'Горбуша — стартуй зі смаком',
    subtitle:
      'Соковиті ікринки з чистим післясмаком. Ідеально для тостів, тарталеток і домашніх сетів.',
    bullets: ['Свіжа партія', 'Чистий смак', 'Охолоджена доставка'],
    imageSrc: '/promo/gorbush.png',
    imageAlt: 'Ікра горбуші',
    price: 279,
    priceNote: 'Вигідний старт',
    priceStyle: 'autumn',
    ctaText: 'Замовити промо-баночку',
    action: {
      kind: 'bundle',
      id: '12',
      title: 'Ікра горбуші — промо баночка',
      price: 279,
      image: '/promo/gorbush.png',
      note: 'Промо: перша баночка',
      openCart: true
    },
    tags: ['Гарячий попит']
  },

  // 2) Сет 2+1 — одна позиція-сет
  {
    eyebrow: 'Акція 2+1',
    title: 'Більше ікри — більше радості',
    subtitle:
      'Щедра подача без зайвих клопотів: три банки одним кліком — для гостей, ролів і свят.',
    bullets: ['Вигідний сет', 'Швидке замовлення', 'Готово до подачі'],
    imageSrc: '/promo/3.jpg',
    imageAlt: 'Набір 3 банки (2+1)',
    ctaText: 'Замовити сет 2+1',
    price: 1098,
    priceNote: 'За 3 банки',
    priceStyle: 'autumn',
    action: {
      kind: 'bundle',
      id: '13',
      title: 'Набір 2+1 (3 банки)',
      price: 1098,
      image: '/promo/3.jpg',
      note: 'Фіксована ціна за сет',
      openCart: true
    },
    tags: ['Party-ready']
  },

  // 3) Набір із 5 банок
  {
    eyebrow: 'Набір вигоди',
    title: 'П’ятірка для справжнього свята',
    subtitle: 'Максимум смаку для великої компанії: вистачить на тости, канапки й святкові роли.',
    bullets: ['Більше — дешевше', 'На 6–10 гостей', 'Супер для фуршету'],
    imageSrc: '/promo/5.jpg',
    imageAlt: 'Набір із 5 банок',
    price: 1500,
    priceNote: 'За 5 банок',
    priceStyle: 'autumnRibbon',
    ctaText: 'Замовити набір 5',
    action: {
      kind: 'bundle',
      id: '14',
      title: 'Набір із 5 банок',
      price: 1500,
      image: '/promo/5.jpg',
      note: 'Фікс-ціна за 5 банок',
      openCart: true
    },
    tags: ['Максимальна вигода']
  }
]
