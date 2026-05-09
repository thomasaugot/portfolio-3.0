import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0b0a",
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {/* outer border square */}
        <div style={{ position: "absolute", left: 7, top: 7, width: 18, height: 18, border: "1px solid #d4ff3a" }} />
        {/* inner filled square */}
        <div style={{ position: "absolute", left: 12, top: 12, width: 8, height: 8, background: "#d4ff3a" }} />
      </div>
    ),
    { ...size }
  )
}
