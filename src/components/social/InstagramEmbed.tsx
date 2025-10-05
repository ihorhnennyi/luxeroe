// src/components/social/InstagramEmbed.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function InstagramEmbed({ url }: { url: string }) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const src = "https://www.instagram.com/embed.js";
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );

    const process = () => {
      // Дадим кадр браузеру, чтобы блок успел смонтироваться
      requestAnimationFrame(() => {
        window.instgrm?.Embeds?.process();
        setReady(true);
      });
    };

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = process;
      document.body.appendChild(script);
    } else {
      process();
    }
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        /* базовая высота → меньше на телефоне */
        minHeight: 360,
        /* на sm+ можно выше через контейнер-родителя */
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid rgba(0,0,0,.06)",
      }}
    >
      {/* плейсхолдер до инициализации скрипта */}
      {!ready && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.02), rgba(0,0,0,0.05), rgba(0,0,0,0.02))",
            animation: "ig-sheen 1.1s linear infinite",
          }}
        />
      )}

      <blockquote
        id={id}
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: "#fff",
          border: 0,
          margin: 0,
          maxWidth: "540px",
          minWidth: "260px",
          width: "100%",
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
          .instagram-media + div[aria-hidden] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
