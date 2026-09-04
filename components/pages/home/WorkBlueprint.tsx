"use client"

/**
 * "Blueprint → production" overlay for a work card.
 * Lime wireframe strokes draw themselves in (GSAP DrawSVG), a build status
 * label ticks build → deploy → live, then the real mockup fades in over it.
 * All motion lives in initWorkReveal (utils/animations/scrollReveals.ts).
 */

const STROKE = "fill-none stroke-primary [vector-effect:non-scaling-stroke]"

function WebWire() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* browser frame */}
      <rect data-wire x="44" y="38" width="312" height="234" rx="4" className={STROKE} strokeWidth="1.5" />
      <line data-wire x1="44" y1="60" x2="356" y2="60" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="56" cy="49" r="2.5" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="65" cy="49" r="2.5" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="74" cy="49" r="2.5" className={STROKE} strokeWidth="1" />
      <rect data-wire x="120" y="44" width="160" height="10" rx="2" className={STROKE} strokeWidth="1" />
      {/* nav */}
      <line data-wire x1="60" y1="76" x2="100" y2="76" className={STROKE} strokeWidth="1.5" />
      <line data-wire x1="250" y1="76" x2="280" y2="76" className={STROKE} strokeWidth="1" />
      <line data-wire x1="290" y1="76" x2="316" y2="76" className={STROKE} strokeWidth="1" />
      <line data-wire x1="326" y1="76" x2="340" y2="76" className={STROKE} strokeWidth="1" />
      {/* hero */}
      <rect data-wire x="60" y="92" width="280" height="90" rx="3" className={STROKE} strokeWidth="1.5" />
      <line data-wire x1="76" y1="120" x2="220" y2="120" className={STROKE} strokeWidth="2" />
      <line data-wire x1="76" y1="134" x2="180" y2="134" className={STROKE} strokeWidth="2" />
      <rect data-wire x="76" y="150" width="48" height="14" rx="7" className={STROKE} strokeWidth="1" />
      {/* cards */}
      <rect data-wire x="60" y="196" width="86" height="60" rx="3" className={STROKE} strokeWidth="1" />
      <rect data-wire x="157" y="196" width="86" height="60" rx="3" className={STROKE} strokeWidth="1" />
      <rect data-wire x="254" y="196" width="86" height="60" rx="3" className={STROKE} strokeWidth="1" />
      <line data-wire x1="70" y1="240" x2="120" y2="240" className={STROKE} strokeWidth="1" />
      <line data-wire x1="167" y1="240" x2="217" y2="240" className={STROKE} strokeWidth="1" />
      <line data-wire x1="264" y1="240" x2="314" y2="240" className={STROKE} strokeWidth="1" />
      {/* phone overlay */}
      <rect data-wire x="300" y="150" width="60" height="120" rx="8" className={STROKE} strokeWidth="1.5" />
      <line data-wire x1="318" y1="160" x2="342" y2="160" className={STROKE} strokeWidth="1" />
      <rect data-wire x="308" y="172" width="44" height="40" rx="2" className={STROKE} strokeWidth="1" />
      <line data-wire x1="308" y1="224" x2="352" y2="224" className={STROKE} strokeWidth="1" />
      <line data-wire x1="308" y1="234" x2="340" y2="234" className={STROKE} strokeWidth="1" />
    </svg>
  )
}

function MobileWire() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* two phones */}
      <rect data-wire x="112" y="34" width="112" height="232" rx="14" className={STROKE} strokeWidth="1.5" />
      <rect data-wire x="192" y="52" width="100" height="210" rx="12" className={STROKE} strokeWidth="1" opacity="0.6" />
      <line data-wire x1="150" y1="44" x2="186" y2="44" className={STROKE} strokeWidth="1" />
      {/* header */}
      <line data-wire x1="126" y1="66" x2="176" y2="66" className={STROKE} strokeWidth="2" />
      <circle data-wire cx="204" cy="66" r="5" className={STROKE} strokeWidth="1" />
      {/* hero block */}
      <rect data-wire x="126" y="80" width="84" height="56" rx="3" className={STROKE} strokeWidth="1" />
      {/* list rows */}
      <rect data-wire x="126" y="148" width="84" height="22" rx="3" className={STROKE} strokeWidth="1" />
      <rect data-wire x="126" y="178" width="84" height="22" rx="3" className={STROKE} strokeWidth="1" />
      <rect data-wire x="126" y="208" width="84" height="22" rx="3" className={STROKE} strokeWidth="1" />
      <line data-wire x1="134" y1="159" x2="180" y2="159" className={STROKE} strokeWidth="1" />
      <line data-wire x1="134" y1="189" x2="172" y2="189" className={STROKE} strokeWidth="1" />
      <line data-wire x1="134" y1="219" x2="176" y2="219" className={STROKE} strokeWidth="1" />
      {/* tab bar */}
      <line data-wire x1="112" y1="244" x2="224" y2="244" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="140" cy="255" r="3" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="168" cy="255" r="3" className={STROKE} strokeWidth="1" />
      <circle data-wire cx="196" cy="255" r="3" className={STROKE} strokeWidth="1" />
    </svg>
  )
}

export function WorkBlueprint({ kind }: { kind: "web" | "mobile" }) {
  return (
    <div data-anim="work-blueprint" className="pointer-events-none absolute inset-0 z-[5]">
      {/* faint lime grid */}
      <div
        data-anim="work-grid"
        className="absolute inset-0 opacity-0 [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--color-primary)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-primary)_10%,transparent)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div data-anim="work-wire" className="absolute inset-0">
        {kind === "mobile" ? <MobileWire /> : <WebWire />}
      </div>
      {/* build status */}
      <div className="absolute top-4 left-4 font-mono text-caption tracking-[0.12em] uppercase text-text-subtle">
        <span data-status="build" className="absolute left-0 top-0 whitespace-nowrap opacity-0">▸ build</span>
        <span data-status="deploy" className="absolute left-0 top-0 whitespace-nowrap opacity-0">▸ deploy</span>
        <span data-status="live" className="absolute left-0 top-0 whitespace-nowrap opacity-0 text-primary">● live</span>
      </div>
    </div>
  )
}
