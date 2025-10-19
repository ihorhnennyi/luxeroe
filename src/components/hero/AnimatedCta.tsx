'use client'

import type { ButtonProps, SxProps, Theme } from '@mui/material'
import { Button } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Link from 'next/link'
import { forwardRef } from 'react'

type AnimMode = 'pulse' | 'sheen' | 'none'
type GreenTone = 'pine' | 'emerald' | 'teal'

type Props = {
  href?: string
  anim?: AnimMode
  forceButton?: boolean
  greenTone?: GreenTone
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target']
  rel?: string
  prefetch?: boolean
} & ButtonProps

const schemes = {
  pine: {
    grad: 'linear-gradient(180deg, #33B49A 0%, #1F8376 58%, #0F5E5B 100%)',
    gradHover: 'linear-gradient(180deg, #2EAA91 0%, #1B786C 58%, #0C5350 100%)',
    shadow: (t: Theme) =>
      `0 10px 22px ${alpha('#0C5350', 0.26)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    shadowHover: (t: Theme) =>
      `0 12px 26px ${alpha('#0C5350', 0.32)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    ring: { xs: '1px solid rgba(51,180,154,.45)', sm: '2px solid rgba(51,180,154,.5)' },
    glow: 'radial-gradient(50% 60% at 50% 50%, rgba(51,180,154,.28) 0%, rgba(51,180,154,0) 70%)'
  },
  emerald: {
    grad: 'linear-gradient(180deg, #38C48E 0%, #179B77 58%, #0F6E58 100%)',
    gradHover: 'linear-gradient(180deg, #33B985 0%, #158E6D 58%, #0C614E 100%)',
    shadow: (t: Theme) =>
      `0 10px 22px ${alpha('#0C614E', 0.26)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    shadowHover: (t: Theme) =>
      `0 12px 26px ${alpha('#0C614E', 0.32)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    ring: { xs: '1px solid rgba(56,196,142,.42)', sm: '2px solid rgba(56,196,142,.48)' },
    glow: 'radial-gradient(50% 60% at 50% 50%, rgba(56,196,142,.26) 0%, rgba(56,196,142,0) 70%)'
  },
  teal: {
    grad: 'linear-gradient(180deg, #37B3C4 0%, #1C8AA0 58%, #0F5E73 100%)',
    gradHover: 'linear-gradient(180deg, #32A9BA 0%, #177E93 58%, #0C5467 100%)',
    shadow: (t: Theme) =>
      `0 10px 22px ${alpha('#0C5467', 0.26)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    shadowHover: (t: Theme) =>
      `0 12px 26px ${alpha('#0C5467', 0.32)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.22)}`,
    ring: { xs: '1px solid rgba(55,179,196,.42)', sm: '2px solid rgba(55,179,196,.48)' },
    glow: 'radial-gradient(50% 60% at 50% 50%, rgba(55,179,196,.24) 0%, rgba(55,179,196,0) 70%)'
  }
} as const

const AnimatedCta = forwardRef<HTMLButtonElement, Props>(function AnimatedCta(
  {
    href,
    children,
    anim = 'pulse',
    forceButton = false,
    greenTone = 'pine',
    target,
    rel,
    prefetch = false,
    ...btn
  },
  ref
) {
  const cs = schemes[greenTone]

  const baseSx: SxProps<Theme> = {
    position: 'relative',
    overflow: 'visible',
    fontWeight: 900,
    letterSpacing: { xs: 0.2, sm: 0.3 },
    color: '#fff',
    fontSize: { xs: 14, sm: 15, md: 16 },
    px: { xs: 2.25, sm: 3 },
    py: { xs: 1, sm: 1.25 },
    borderRadius: 999,
    minHeight: { xs: 38, sm: 44 },
    textTransform: 'none',
    background: cs.grad,
    boxShadow: t => cs.shadow(t),
    '&:hover': { background: cs.gradHover, boxShadow: t => cs.shadowHover(t) },

    // keyframes вынесены на корень — стабильнее
    '@keyframes ring': {
      '0%': { transform: 'scale(0.96)', opacity: 0.5 },
      '70%': { transform: 'scale(1.12)', opacity: 0 },
      '100%': { transform: 'scale(1.12)', opacity: 0 }
    },
    '@keyframes sheen': { '0%': { left: -120 }, '100%': { left: '130%' } },

    ...(anim === 'pulse'
      ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: { xs: -4, sm: -6 },
            borderRadius: 999,
            border: cs.ring,
            pointerEvents: 'none',
            animation: 'ring 2s ease-out infinite'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: { xs: '60%', sm: '70%' },
            height: { xs: 12, sm: 16 },
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: cs.glow,
            filter: 'blur(5px)',
            pointerEvents: 'none'
          }
        }
      : anim === 'sheen'
      ? {
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -120,
            width: 90,
            height: '100%',
            transform: 'skewX(-20deg)',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)',
            pointerEvents: 'none'
          },
          '&:hover::after': { animation: 'sheen .9s ease' }
        }
      : {})
  }

  // Кнопка без ссылки
  if (!href || forceButton) {
    return (
      <Button ref={ref} disableElevation {...btn} sx={baseSx}>
        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      </Button>
    )
  }

  // Кнопка-ссылка (Next Link)
  return (
    <Button
      ref={ref}
      component={Link as any}
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      prefetch={prefetch}
      disableElevation
      {...btn}
      sx={baseSx}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Button>
  )
})

export default AnimatedCta
