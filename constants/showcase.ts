/**
 * The Halden recording: 160 scroll positions captured from the site. The home
 * showcase plays only its opening shot (cabin, porthole, down through the
 * clouds to the jet reveal) at close to the original scroll pace, rather than
 * racing through all 160 frames inside one pin.
 */
export const SHOWCASE_FRAME_COUNT = 57

/** Scroll distance of the pin, in % of the viewport height. ~19 frames per screen. */
export const SHOWCASE_PIN_LENGTH = 300

/** Pixel width of each recorded frame. */
export const SHOWCASE_FRAME_WIDTH = 1200

export const SHOWCASE_FRAMES = Array.from(
  { length: SHOWCASE_FRAME_COUNT },
  (_, i) => `/assets/videos/halden-scroll/${String(i + 1).padStart(4, "0")}.webp`,
)

export const SHOWCASE_LIVE_URL = "https://halden-opal.vercel.app"
export const SHOWCASE_DOMAIN = "halden-opal.vercel.app"
export const SHOWCASE_CASE_STUDY_SLUG = "halden"
export const SHOWCASE_TAGS = ["GSAP", "Three.js", "WebGL", "Canvas", "Gemini"]
