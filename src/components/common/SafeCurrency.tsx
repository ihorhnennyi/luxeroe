// src/components/common/SafeCurrency.tsx
"use client";
import { useEffect, useState } from "react";

export default function SafeCurrency({ value }: { value: number }) {
  const [txt, setTxt] = useState<string>("");

  useEffect(() => {
    try {
      setTxt(
        new Intl.NumberFormat("uk-UA", {
          style: "currency",
          currency: "UAH",
          maximumFractionDigits: 0,
        }).format(value)
      );
    } catch {
      setTxt(`${Math.round(value)} ₴`);
    }
  }, [value]);

  return (
    <span suppressHydrationWarning>{txt || `${Math.round(value)} ₴`}</span>
  );
}
