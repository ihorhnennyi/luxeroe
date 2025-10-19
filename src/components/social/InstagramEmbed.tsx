'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { loadInstagramScript } from './instagramScript'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

type Props = {
  url: string
  aspectRatio?: number
  lazy?: boolean
}

export default function InstagramEmbed({ url, aspectRatio = 4 / 5, lazy = true }: Props) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [canInit, setCanInit] = useState(!lazy)

  useEffect(() => {
    if (!lazy || canInit) return
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setCanInit(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanInit(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [lazy, canInit])

  useEffect(() => {
    if (!canInit) return
    let cancelled = false
    loadInstagramScript()
      .then(() => {
        if (cancelled) return
        requestAnimationFrame(() => {
          try {
            window.instgrm?.Embeds?.process()
            setReady(true)
          } catch {
            setFailed(true)
          }
        })
      })
      .catch(() => setFailed(true))
    return () => {
      cancelled = true
    }
  }, [canInit])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        background: '#fff',
        border: 'none',
        borderRadius: 0
      }}
    >
      {!ready && !failed && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.02), rgba(0,0,0,0.05), rgba(0,0,0,0.02))',
            animation: 'ig-sheen 1.1s linear infinite'
          }}
        />
      )}

      {failed && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            textDecoration: 'none',
            color: '#0E4F45',
            fontWeight: 800,
            fontSize: 16
          }}
        >
          Відкрити в Instagram
        </a>
      )}

      <blockquote
        id={id}
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#fff',
          border: 0,
          margin: 0,
          maxWidth: '540px',
          minWidth: '260px',
          width: '100%',
          height: '100%'
        }}
      />

      <style jsx>{`
        @keyframes ig-sheen {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.instagram-media),
          :global(.instagram-media + div[aria-hidden]) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
