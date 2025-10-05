"use client";

import LeavesOverlay from "@/components/LeavesOverlay";
import { useEffect, useState } from "react";

export default function LeavesClient({ autumn = true }: { autumn?: boolean }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!autumn) {
      setEnabled(false);
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isSmall = window.matchMedia("(max-width: 599.98px)").matches;
    setEnabled(!reduced && !isSmall);
  }, [autumn]);

  return <LeavesOverlay enabled={enabled} />;
}
