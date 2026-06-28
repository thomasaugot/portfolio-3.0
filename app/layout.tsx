import type { Metadata } from "next"
import { JetBrains_Mono, Space_Grotesk, Instrument_Serif } from "next/font/google"
import "@/globals.css"

// Runs before first paint to apply the saved theme — prevents the light-mode
// flash on hard reload. Default is dark when no preference is stored.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme")==="light"?"light":"dark";var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t;d.style.backgroundColor=t==="light"?"#f2f1ea":"#0b0b0a";}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://helloimtom.dev"),
  title: { default: "Thomas Augot — Full-stack developer for hire", template: "%s | Thomas Augot" },
  description: "Full-stack developer (React, Next.js, Node) for hire. I ship production-ready web & mobile apps from Las Palmas de Gran Canaria.",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website", locale: "en_US",
    url: "https://helloimtom.dev",
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
  alternates: { canonical: "https://helloimtom.dev" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      style={{ colorScheme: "dark", backgroundColor: "#0b0b0a" }}
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} bg-bg text-text font-mono text-base leading-[var(--leading-normal)] overflow-x-hidden antialiased [font-feature-settings:'ss01','ss02','cv01','cv02'] [text-rendering:optimizeLegibility]`}
    >
      <head>
        {/* Runs before any paint: apply saved theme + matching color-scheme so the
            first frame is already the right tone (no white flash on reload). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-svh overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
