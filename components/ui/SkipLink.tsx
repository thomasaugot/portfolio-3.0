"use client"

interface SkipLinkProps { targetId: string }

export function SkipLink({ targetId }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus({ preventScroll: true })
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={[
        "fixed top-4 left-4 bg-primary text-black px-4 py-2",
        "font-mono text-[16px] font-medium no-underline",
        "translate-y-[-200%] transition-transform duration-normal ease-out focus:translate-y-0",
        "z-[calc(var(--z-loader)+10)] keyboard-focus-ring",
      ].join(" ")}
    >
      Skip to main content
    </a>
  )
}
