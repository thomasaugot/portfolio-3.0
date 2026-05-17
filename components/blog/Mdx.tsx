import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import type { MDXComponents } from "mdx/types"

const components: MDXComponents = {
  h1: (props) => <h1 className="font-display text-[clamp(28px,3.4vw,42px)] font-semibold tracking-[-0.03em] leading-[1.05] mt-12 mb-5" {...props} />,
  h2: (props) => <h2 className="font-display text-[clamp(22px,2.6vw,32px)] font-semibold tracking-[-0.02em] leading-[1.1] mt-10 mb-4" {...props} />,
  h3: (props) => <h3 className="font-display text-[clamp(18px,2vw,24px)] font-semibold tracking-[-0.01em] leading-[1.2] mt-8 mb-3" {...props} />,
  p:  (props) => <p className="text-[16px] leading-[1.7] text-text-muted mb-5" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-5 space-y-2 text-[16px] text-text-muted leading-[1.7]" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-[16px] text-text-muted leading-[1.7]" {...props} />,
  li: (props) => <li className="marker:text-text-subtle" {...props} />,
  a:  (props) => <a className="text-primary underline underline-offset-4 decoration-1 hover:opacity-75" {...props} />,
  blockquote: (props) => <blockquote className="border-l-2 border-primary pl-5 my-6 text-text font-serif italic text-[18px]" {...props} />,
  hr: () => <hr className="my-10 border-border" />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className="my-8 border border-border w-full" />
  ),
  pre: (props) => <pre className="mdx-pre my-6 overflow-x-auto border border-border-2 bg-surface-2 text-[14px] font-mono p-5 leading-[1.6]" {...props} />,
  // Inline <code> only: <code> nested inside <pre> inherits no border (see CSS below).
  code: (props) => <code className="mdx-code font-mono text-[14px]" {...props} />,
}

const prettyCodeOptions = {
  theme: { dark: "github-dark", light: "github-light" },
  keepBackground: false,
}

// Escape any line that looks like a raw HTML/JSX tag OUTSIDE fenced code blocks.
// Posts imported from Medium often contain stray `<Link>`, `<script>`, `<urlset>`
// etc. that aren't inside code fences — MDX tries to parse them as JSX
// components, can't resolve them, and throws. Wrapping them in backticks
// neutralises the parse without changing how code blocks render.
// Bulletproof MDX content from Medium imports:
//  - Wrap stray <Tag>/</Tag> lines in backticks so MDX doesn't try to JSX-parse
//    components that don't exist (<Link>, <script>, <urlset>, …)
//  - Replace smart quotes / dashes / ellipsis with their plain equivalents on
//    non-code lines so they can't appear inside JSX attribute syntax and crash
//    the MDX parser (U+201C/D, U+2018/19, U+2013/14, U+2026)
//  - Preserves the contents of fenced code blocks untouched
// Wrap any `<tag …>` substring with backticks unless it's already inside
// inline-code backticks. Tracks backtick state char-by-char so we don't
// double-wrap things like `<link>` that the user already escaped.
function neutralizeRawTags(line: string): string {
  let out = ""
  let i = 0
  let inCode = false
  while (i < line.length) {
    const ch = line[i]
    if (ch === "`") {
      inCode = !inCode
      out += ch
      i++
      continue
    }
    if (!inCode && ch === "<") {
      // Match <tag …> or </tag>
      const rest = line.slice(i)
      const m = rest.match(/^<\/?[A-Za-z][^<>\n]*?>/)
      if (m) {
        out += "`" + m[0] + "`"
        i += m[0].length
        continue
      }
    }
    out += ch
    i++
  }
  return out
}

function sanitizeMdxSource(src: string): string {
  const lines = src.split("\n")
  let inFence = false
  let fenceMarker: string | null = null

  const SMART_REPLACEMENTS: [RegExp, string][] = [
    [/[“”„‟]/g, '"'],
    [/[‘’‚‛]/g, "'"],
    [/[–—]/g, "-"],
    [/…/g, "..."],
  ]

  return lines
    .map((line) => {
      const trimmed = line.trimStart()

      if (!inFence) {
        const m = trimmed.match(/^(`{3,}|~{3,})/)
        if (m) { inFence = true; fenceMarker = m[1][0].repeat(m[1].length); return line }
      } else if (fenceMarker && trimmed.startsWith(fenceMarker)) {
        inFence = false; fenceMarker = null; return line
      }
      if (inFence) return line

      let out = line
      for (const [re, rep] of SMART_REPLACEMENTS) out = out.replace(re, rep)

      // Unescape backticks that Medium escapes as \` — MDX otherwise treats
      // them as literal backslash + backtick, so inline-code wrappers like
      // `\`<link>\`` leak `<link>` into JSX parsing and crash.
      out = out.replace(/\\`/g, "`")

      // After unescaping, neutralize any remaining bare `<tag>` constructs
      // that aren't inside inline code. Walk the line and wrap raw tags in
      // backticks unless they're already inside a backtick pair.
      out = neutralizeRawTags(out)

      return out
    })
    .join("\n")
}

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={sanitizeMdxSource(source)}
      components={components}
      options={{
        mdxOptions: {
          rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  )
}
