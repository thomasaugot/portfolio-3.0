import { gsap, ScrollTrigger } from "@/lib/gsap"
import { FrameSequence } from "@/lib/frame-sequence"
import { SHOWCASE_FRAMES, SHOWCASE_FRAME_COUNT, SHOWCASE_FRAME_WIDTH, SHOWCASE_PIN_LENGTH } from "@/constants/showcase"

const pad = (n: number) => String(n).padStart(3, "0")

/** Navbar height (72px) plus breathing room. */
const NAV_CLEARANCE = 88

/**
 * Home showcase: the section is pinned and the reader's scroll drives a
 * recording of the Halden site being scrolled.
 *
 * GSAP pins instead of CSS sticky because the root layout sets
 * overflow-x-hidden on both <html> and <body>, which turns <body> into the
 * scroll container and makes position: sticky inert. The pins are regular
 * fixed pins: PageShell keeps will-change off <main> outside transitions,
 * so nothing above them creates a containing block.
 *
 * Wide screens pin the whole row (copy beside the browser). Narrow screens,
 * where the row stacks taller than the viewport, pin only the browser.
 */
export function initShowcaseScrub(): (() => void) | void {
  const row = document.querySelector<HTMLElement>("[data-showcase='row']")
  const stage = document.querySelector<HTMLElement>("[data-showcase='stage']")
  const canvas = document.querySelector<HTMLCanvasElement>("[data-showcase='canvas']")
  const readout = document.querySelector<HTMLElement>("[data-showcase='frame']")
  if (!row || !stage || !canvas) return

  const seq = new FrameSequence(canvas, SHOWCASE_FRAMES, SHOWCASE_FRAME_WIDTH)
  seq.onFrame = (i) => {
    if (readout) readout.textContent = `${pad(i + 1)} / ${pad(SHOWCASE_FRAME_COUNT)}`
  }

  // frames start downloading two screens before the section arrives
  const preload = ScrollTrigger.create({
    trigger: row,
    start: "top 300%",
    once: true,
    onEnter: () => seq.load(),
  })

  const mm = gsap.matchMedia()
  mm.add("(min-width: 901px)", () => {
    ScrollTrigger.create({
      trigger: row,
      pin: true,
      anticipatePin: 1,
      // Centre the row in the space under the fixed navbar. When the row is
      // taller than that space (long French copy on a short laptop screen),
      // centring pushed its top under the navbar, so pin it just below instead.
      start: () => {
        const room = window.innerHeight - NAV_CLEARANCE
        return row.offsetHeight > room
          ? `top top+=${NAV_CLEARANCE}`
          : `center ${NAV_CLEARANCE + room / 2}px`
      },
      invalidateOnRefresh: true,
      end: `+=${SHOWCASE_PIN_LENGTH}%`,
      scrub: true,
      onUpdate: (self) => seq.seek(self.progress),
    })
  })
  mm.add("(max-width: 900px)", () => {
    ScrollTrigger.create({
      trigger: stage,
      pin: true,
      anticipatePin: 1,
      // centred in the space under the navbar, like the desktop row
      start: () => `center ${NAV_CLEARANCE + (window.innerHeight - NAV_CLEARANCE) / 2}px`,
      invalidateOnRefresh: true,
      end: `+=${SHOWCASE_PIN_LENGTH}%`,
      scrub: true,
      onUpdate: (self) => seq.seek(self.progress),
    })
  })

  return () => {
    preload.kill()
    mm.revert()
    seq.dispose()
  }
}
