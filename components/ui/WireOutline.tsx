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
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] h-full w-full ${className}`}
    >
      {/* Sized in px by initWireOutlines so the stroke length is measured correctly */}
      <rect data-wire x="1" y="1" width="0" height="0" className="fill-none stroke-primary" strokeWidth="2" />
    </svg>
  )
}
