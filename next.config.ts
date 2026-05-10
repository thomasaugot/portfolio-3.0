import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: [
    "@google-analytics/data",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "google-gax",
  ],
}

export default withNextIntl(nextConfig)
