/**
 * The Cinder recording, the build only: two patties under the cheese, the bun
 * landing, then the burger stacked with every layer labelled, stopping just
 * before the menu slides in (13s to 19.4s of the live-site recording, 8 frames
 * per second). Played slowly rather than racing through the whole site.
 */
export const SHOWCASE_FRAME_COUNT = 51

/** Scroll distance of the pin, in % of the viewport height. ~11 frames per screen. */
export const SHOWCASE_PIN_LENGTH = 450

/** Pixel width of each recorded frame. */
export const SHOWCASE_FRAME_WIDTH = 1280

export const SHOWCASE_FRAMES = Array.from(
  { length: SHOWCASE_FRAME_COUNT },
  (_, i) => `/assets/videos/cinder-burger/${String(i + 1).padStart(4, "0")}.webp`,
)

export const SHOWCASE_LIVE_URL = "https://cinder-rouge.vercel.app"
export const SHOWCASE_DOMAIN = "cinder-rouge.vercel.app"
export const SHOWCASE_CASE_STUDY_SLUG = "cinder"
export const SHOWCASE_TAGS = ["GSAP ScrollTrigger", "Lenis", "Canvas", "React 19", "Gemini"]
