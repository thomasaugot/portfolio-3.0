export type Theme = "dark" | "light"

/**
 * Change this to "light" or "dark" to switch the whole app's color scheme.
 * Applied to <html data-theme="..."> in app/layout.tsx.
 * Light/dark palettes live in styles/theme.css.
 */
export const THEME: Theme = "dark"

export const appConfig = {
  siteUrl:     process.env.NEXT_PUBLIC_SITE_URL ?? "https://thomasaugot.dev",
  environment: process.env.NODE_ENV,
  email:       "thomas.augot@gmail.com",
  calLink:     "https://calendly.com/thomas_augot",
  linkedin:    "https://www.linkedin.com/in/thomas-augot/",
  github:      "https://github.com/thomasaugot",
  twitter:     "https://x.com/thomasaugot",
  instagram:   "https://instagram.com/thomasaugot",
  medium:      "https://medium.com/@thomasaugot",
} as const
