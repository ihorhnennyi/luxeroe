"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BundleItem = { id: string; qty: number };

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  variant?: string;
  qty: number;

  type?: "single" | "bundle";

  // (оставляем на будущее; сейчас промо считаем через promoLimitQty)
  promoFirstPrice?: number;
  priceAfterFirst?: number;

  bundle?: { items: BundleItem[]; note?: string };

  /** Блокировка ручного изменения количества (+/-). */
  lockQty?: boolean;

  /** Технический максимум для позиции. */
  maxQty?: number;

  /** Лимит по промо для этой позиции (напр., 1 — не больше 1 шт). */
  promoLimitQty?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (id: string, variant?: string) => void;
  inc: (id: string, variant?: string) => void;
  dec: (id: string, variant?: string) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
};

const MAX_QTY_DEFAULT = 10;

function key(id: string, v?: string) {
  return `${id}__${v ?? ""}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incoming) =>
        set((s) => {
          const k = key(incoming.id, incoming.variant);
          const idx = s.items.findIndex((it) => key(it.id, it.variant) === k);

          const isBundle = incoming.type === "bundle";
          // базовый максимум: бандл = 1, иначе дефолт/переданный maxQty
          let baseMax = incoming.maxQty ?? (isBundle ? 1 : MAX_QTY_DEFAULT);

          // если промо-лимит указан — ужимаем максимум
          if (typeof incoming.promoLimitQty === "number") {
            baseMax = Math.min(baseMax, Math.max(1, incoming.promoLimitQty));
          }

          const maxQty = baseMax;
          const addQty = Math.max(1, incoming.qty ?? 1);

          if (idx >= 0) {
            const next = [...s.items];
            const cur = next[idx];

            const effMax = Math.min(cur.maxQty ?? maxQty, maxQty);
            const nextQty = Math.min(effMax, cur.qty + addQty);

            next[idx] = {
              ...cur,
              qty: nextQty,
              // принудительно блокируем если бандл или промо=1
              lockQty:
                true === cur.lockQty
                  ? true
                  : isBundle ||
                    (incoming.promoLimitQty != null && maxQty === 1),
              maxQty: effMax,
              promoLimitQty: incoming.promoLimitQty ?? cur.promoLimitQty,
            };

            return { items: next, isOpen: true };
          }

          return {
            items: [
              {
                ...incoming,
                qty: Math.min(maxQty, addQty),
                type: incoming.type ?? "single",
                // принудительно блокируем если бандл или промо=1
                lockQty:
                  true === incoming.lockQty
                    ? true
                    : isBundle ||
                      (incoming.promoLimitQty != null && maxQty === 1),
                maxQty,
              },
              ...s.items,
            ],
            isOpen: true,
          };
        }),

      remove: (id, variant) =>
        set((s) => ({
          items: s.items.filter(
            (it) => key(it.id, it.variant) !== key(id, variant)
          ),
        })),

      inc: (id, variant) =>
        set((s) => ({
          items: s.items.map((it) => {
            if (key(it.id, it.variant) !== key(id, variant)) return it;
            if (it.lockQty) return it;
            const promoCap =
              typeof it.promoLimitQty === "number"
                ? Math.max(1, it.promoLimitQty)
                : MAX_QTY_DEFAULT;
            const max = Math.min(it.maxQty ?? MAX_QTY_DEFAULT, promoCap);
            return { ...it, qty: Math.min(max, it.qty + 1) };
          }),
        })),

      dec: (id, variant) =>
        set((s) => ({
          items: s.items
            .map((it) => {
              if (key(it.id, it.variant) !== key(id, variant)) return it;
              if (it.lockQty) return it;
              return { ...it, qty: Math.max(1, it.qty - 1) };
            })
            .filter((it) => it.qty > 0),
        })),

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),
    }),
    { name: "cart-v1" }
  )
);
