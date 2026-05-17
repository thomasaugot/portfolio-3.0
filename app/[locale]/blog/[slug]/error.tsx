"use client"

import { useEffect } from "react"
import { TransitionLink } from "@/components/ui/TransitionLink"

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Blog post render error:", error)
  }, [error])

  return (
    <section className="pt-[160px] pb-[clamp(80px,12vh,160px)] px-(--gutter)">
      <div className="max-w-[680px] mx-auto">
        <span className="font-mono text-[11px] text-text-subtle tracking-[0.14em] uppercase block mb-4">
          [ ERROR ]
        </span>
        <h1 className="font-display text-[clamp(28px,3.4vw,42px)] font-semibold tracking-[-0.02em] leading-[1.1] mb-4">
          Couldn&apos;t render this article.
        </h1>
        <p className="text-[16px] text-text-muted leading-[1.6] mb-8">
          Something in the post content broke during render. The rest of the site is fine.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center font-mono text-[13px] text-text tracking-[0.08em] uppercase py-3 px-4 border border-border bg-surface hover:border-primary hover:text-primary transition-colors cursor-pointer keyboard-focus-ring"
          >
            Try again
          </button>
          <TransitionLink
            href="/blog"
            className="inline-flex items-center font-mono text-[13px] text-text tracking-[0.08em] uppercase no-underline py-3 px-4 border border-border bg-surface hover:border-primary hover:text-primary transition-colors keyboard-focus-ring"
          >
            ← Back to blog
          </TransitionLink>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <pre className="mt-8 p-4 bg-surface-2 border border-border text-[12px] font-mono text-text-muted overflow-x-auto whitespace-pre-wrap break-all">
            {error.message}
            {error.digest && `\n\ndigest: ${error.digest}`}
          </pre>
        )}
      </div>
    </section>
  )
}
