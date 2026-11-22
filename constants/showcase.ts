/** The Halden recording played by the home showcase: 160 scroll positions captured from the site. */
export const SHOWCASE_FRAME_COUNT = 160

export const SHOWCASE_FRAMES = Array.from(
  { length: SHOWCASE_FRAME_COUNT },
  (_, i) => `/assets/videos/halden-scroll/${String(i + 1).padStart(4, "0")}.webp`,
)

export const SHOWCASE_LIVE_URL = "https://halden-opal.vercel.app"
export const SHOWCASE_DOMAIN = "halden-opal.vercel.app"
export const SHOWCASE_CASE_STUDY_SLUG = "halden"
export const SHOWCASE_TAGS = ["GSAP", "Three.js", "WebGL", "Canvas", "Gemini"]
