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

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  )
}
