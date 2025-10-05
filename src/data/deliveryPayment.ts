import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ElementType } from "react";

export type DeliveryItem = {
  title: string;
  text: string;
  Icon?: ElementType<SvgIconProps>;
};

export const deliveryPaymentItems: DeliveryItem[] = [
  {
    title: "Оформлення замовлення",
    text: "Виберіть товар у каталозі та залиште заявку на сайті — менеджер одразу зв’яжеться для підтвердження.",
    Icon: ShoppingCartRoundedIcon,
  },
  {
    title: "Доставка по Україні",
    text: "Надсилаємо Новою Поштою протягом 1–2 днів у зручне відділення або поштомат. Надсилаємо трек-номер.",
    Icon: LocalShippingRoundedIcon,
  },
  {
    title: "Оплата при отриманні",
    text: "Передоплату не беремо — оплата тільки після огляду й отримання замовлення.",
    Icon: CreditCardRoundedIcon,
  },
];
