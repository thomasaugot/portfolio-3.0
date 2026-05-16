import { ImageResponse } from "next/og"
import { getPost } from "@/lib/blog"
import type { Locale } from "@/lib/seo"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Blog post by Thomas Augot"

interface Props { params: { locale: string; slug: string } }

export default async function OgImage({ params }: Props) {
  const { locale, slug } = params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const post = getPost(slug, safe)
  const title = post?.title ?? "Blog post"
  const tag   = post?.tags?.[0] ?? "Notes"
  const date  = post ? new Date(post.date).toISOString().slice(0, 10) : ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0b0b0a",
          color: "#f4f1e8",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 14, height: 14, background: "#d4ff3a" }} />
          <span style={{ fontSize: 18, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a3a097" }}>
            helloimtom.dev / blog
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 22, color: "#d4ff3a", letterSpacing: "0.04em" }}>{tag}</span>
          <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: "#f4f1e8" }}>{title}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#6b685f" }}>
          <span>Thomas Augot — full-stack developer</span>
          <span>{date}</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
