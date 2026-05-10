"use client";

import { useContrast } from "@/contexts/ContrastContext";

export function ContrastToggle() {
  const { mode, toggle } = useContrast();
  const isHigh = mode === "high";

  return (
    <div className="fixed bottom-8 left-8 z-toast flex items-center gap-3 group">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isHigh}
        aria-label={
          isHigh ? "Disable high contrast mode" : "Enable high contrast mode"
        }
        className={[
          "w-11 h-11 border flex items-center justify-center cursor-pointer",
          "transition-[border-color,box-shadow,color] duration-300 keyboard-focus-ring",
          isHigh
            ? "border-primary text-primary shadow-[0_0_16px_rgba(212,255,58,0.18)]"
            : "border-border-2 text-text-muted hover:border-primary hover:text-primary",
        ].join(" ")}
      >
        <svg
          width="18"
          height="18"
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
      {/* label slides in from left on hover */}
      <p
        aria-hidden="true"
        className="font-mono text-[10px] tracking-[0.18em] text-text-subtle uppercase
          opacity-0 -translate-x-1 pointer-events-none select-none whitespace-nowrap
          group-hover:opacity-100 group-hover:translate-x-0
          transition-[opacity,transform] duration-200"
      >
        {isHigh ? "High contrast: on" : "High contrast"}
      </p>
    </div>
  );
}
