import type { Metadata } from "next"
import { NotFoundClient } from "@/components/pages/NotFoundClient"

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "This page doesn't exist on thomasaugot.dev. Head back home or browse the work.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundClient />
}
