"use client";

import type { ButtonProps } from "@mui/material";
import { Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

type AnimMode = "pulse" | "sheen" | "none";

type Props = {
  href?: string;
  anim?: AnimMode;
  forceButton?: boolean;
} & ButtonProps;

const reducedMotionSx = {
  animation: "none !important",
  "&::before, &::after": { animation: "none !important" },
} as const;

export default function AnimatedCta({
  href,
  children,
  anim = "pulse",
  forceButton = false,
  ...btn
}: Props) {
  const baseSx = {
    position: "relative",
    overflow: "visible",
    fontWeight: 900,
    letterSpacing: { xs: 0.2, sm: 0.3 },
    color: "#fff",
    fontSize: { xs: 14, sm: 15, md: 16 },
    px: { xs: 2.25, sm: 3 },
    py: { xs: 1, sm: 1.25 },
    borderRadius: 2,
    minHeight: { xs: 38, sm: 44 },
    textTransform: "none",
    background:
      "linear-gradient(180deg, #F2C14E 0%, #E08E45 55%, #B75C36 100%)",
    boxShadow: (t: any) =>
      `0 10px 22px ${alpha("#B75C36", 0.28)}, 0 2px 0 ${alpha(
        t.palette.common.black,
        0.08
      )} inset`,
    "&:hover": {
      background:
        "linear-gradient(180deg, #EFB547 0%, #DB7F3F 55%, #A6512F 100%)",
      boxShadow: (t: any) =>
        `0 12px 26px ${alpha("#B75C36", 0.33)}, 0 2px 0 ${alpha(
          t.palette.common.black,
          0.08
        )} inset`,
    },

    // ====== анимации ======
    ...(anim === "pulse"
      ? {
          "@keyframes btnBreath": {
            "0%, 100%": { transform: "translateZ(0) scale(1)" },
            "50%": { transform: "translateZ(0) scale(1.012)" }, // мягче
          },
          animation: {
            xs: "btnBreath 2.6s ease-in-out infinite",
            sm: "btnBreath 2.2s ease-in-out infinite",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: { xs: -4, sm: -6 },
            borderRadius: 999,
            border: {
              xs: "1px solid rgba(242,193,78,.5)",
              sm: "2px solid rgba(242,193,78,.55)",
            },
            pointerEvents: "none",
            "@keyframes pulseRing": {
              "0%": { transform: "scale(0.9)", opacity: 0.5 },
              "70%": { transform: "scale(1.15)", opacity: 0 },
              "100%": { transform: "scale(1.15)", opacity: 0 },
            },
            animation: "pulseRing 2s ease-out infinite",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            left: "50%",
            top: "100%",
            width: { xs: "60%", sm: "70%" },
            height: { xs: 14, sm: 18 },
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(50% 60% at 50% 50%, rgba(242,193,78,.38) 0%, rgba(242,193,78,0) 70%)",
            filter: "blur(6px)",
            pointerEvents: "none",
            "@keyframes glow": {
              "0%,100%": { opacity: 0.5 },
              "50%": { opacity: 0.25 },
            },
            animation: "glow 2.2s ease-in-out infinite",
          },
          "@media (prefers-reduced-motion: reduce)": reducedMotionSx,
        }
      : anim === "sheen"
      ? {
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: -120,
            width: 90,
            height: "100%",
            transform: "skewX(-20deg)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
            pointerEvents: "none",
          },
          "@keyframes sheen": {
            "0%": { left: -120 },
            "100%": { left: "130%" },
          },
          animation: "none",
          "&:hover::after": { animation: "sheen .9s ease" },
          "@media (prefers-reduced-motion: reduce)": reducedMotionSx,
        }
      : {}),
  } as const;

  if (!href || forceButton) {
    return (
      <Button type="button" disableElevation {...btn} sx={baseSx}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      component={Link as any}
      href={href}
      disableElevation
      {...btn}
      sx={baseSx}
    >
      {children}
    </Button>
  );
}
