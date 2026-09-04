"use client"

/**
 * Lime outline that draws itself around a card when it scrolls into view,
 * then fades out to leave the normal border (see initWireOutlines).
 * Parent must be `relative`.
 */
export function WireOutline({ className = "" }: { className?: string }) {
  return (
    <svg
      data-anim="wire-outline"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] h-full w-full ${className}`}
    >
      <rect data-wire x="0" y="0" width="100" height="100" className="fill-none stroke-primary [vector-effect:non-scaling-stroke]" strokeWidth="2" />
    </svg>
  )
}
