export const appConfig = {
  siteUrl:     process.env.NEXT_PUBLIC_SITE_URL ?? "https://thomasaugot.dev",
  environment: process.env.NODE_ENV,
  email:       "thomas.augot@gmail.com",
  calLink:     "https://calendly.com/thomas_augot",
  linkedin:    "https://linkedin.com/in/thomasaugot",
  github:      "https://github.com/thomasaugot",
  twitter:     "https://x.com/thomasaugot",
  instagram:   "https://instagram.com/thomasaugot",
  medium:      "https://medium.com/@thomasaugot",
} as const
