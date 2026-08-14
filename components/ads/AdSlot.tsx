"use client";

import { useEffect } from "react";

interface AdSlotProps {
  slotId: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  slotId,
  className = "",
}: AdSlotProps) {
  const enabled =
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED ===
    "true";

  const publisherId =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (!enabled || !publisherId) {
      return;
    }

    try {
      (
        window.adsbygoogle ||
        (window.adsbygoogle = [])
      ).push({});
    } catch (error) {
      console.error(
        "AdSense initialization failed:",
        error
      );
    }
  }, [enabled, publisherId]);

  if (!enabled || !publisherId) {
    return null;
  }

  return (
    <div
      className={`w-full flex flex-col items-center justify-center py-5 ${className}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
        Advertisement
      </span>

      <ins
        className="adsbygoogle block w-full"
        style={{
          display: "block",
          minHeight: "90px",
        }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}