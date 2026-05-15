import type { Metadata } from "next"
import { JetBrains_Mono, Space_Grotesk, Instrument_Serif } from "next/font/google"
import "@/globals.css"

// Inline script: pick saved theme, else system pref, else light. Run before paint to avoid FOUC.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://thomasaugot.dev"),
  title: { default: "Thomas Augot — Full-stack developer for hire", template: "%s | Thomas Augot" },
  description: "Full-stack developer (React, Next.js, Node) for hire. I ship production-ready web & mobile apps from Las Palmas de Gran Canaria.",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website", locale: "en_US",
    url: "https://thomasaugot.dev",
    title: "Thomas Augot — Full-stack developer for hire",
    description: "Full-stack developer for hire. React, Next.js, Node.js. Based in Las Palmas, Gran Canaria.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Thomas Augot — Full-stack developer" }],
    siteName: "Thomas Augot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thomas Augot — Full-stack developer for hire",
    description: "Full-stack developer for hire. React, Next.js, Node.js, React Native.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://thomasaugot.dev" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
