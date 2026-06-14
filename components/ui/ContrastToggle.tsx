"use client";

import { useEffect, useState } from "react";
import { useContrast } from "@/contexts/ContrastContext";

export function ContrastToggle() {
  const { mode, toggle } = useContrast();
  const isHigh = mode === "high";
  const [hide, setHide] = useState(false);

  // High-contrast toggle only applies in dark mode.
  useEffect(() => {
    setHide(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  if (hide) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isHigh}
      aria-label={
        isHigh ? "Disable high contrast mode" : "Enable high contrast mode"
      }
      className={[
        "w-8 h-8 border flex items-center justify-center cursor-pointer shrink-0",
        "transition-[border-color,box-shadow,color] duration-300 keyboard-focus-ring",
        isHigh
          ? "border-primary text-primary shadow-[0_0_16px_rgba(212,255,58,0.18)]"
          : "border-border-2 text-text-muted hover:border-primary hover:text-primary",
      ].join(" ")}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="transition-colors duration-300"
      >
        {/* circle outline */}
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        {/* left half filled — the "contrast" icon */}
        <path d="M9 2a7 7 0 0 0 0 14V2Z" fill="currentColor" />
        {/* vertical divider */}
        <line
          x1="9"
          y1="2"
          x2="9"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}
