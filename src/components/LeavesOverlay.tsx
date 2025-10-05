"use client";
import { useEffect, useState } from "react";

export default function LeavesOverlay({
  enabled = true,
  count = 18,
}: {
  enabled?: boolean;
  count?: number;
}) {
  const [leaves, setLeaves] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    // генерируем листья только на клиенте
    setLeaves(Array.from({ length: count }, (_, i) => i));
  }, [enabled, count]);

  if (!enabled) return null;

  return (
    <div className="leaves" aria-hidden>
      {leaves.map((i) => {
        const left = Math.random() * 100;
        const delay = (Math.random() * 5).toFixed(2) + "s";
        const dur = (8 + Math.random() * 7).toFixed(2) + "s";
        const rot = Math.round(Math.random() * 360) + "deg";
        const style: React.CSSProperties = {
          left: left + "vw",
          // @ts-expect-error custom CSS vars
          "--delay": delay,
          "--dur": dur,
          "--rot": rot,
        };
        return <span key={i} className="leaf" style={style} />;
      })}
    </div>
  );
}
