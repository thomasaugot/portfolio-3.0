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
      className="skip-link keyboard-focus-ring"
    >
      Skip to main content
    </a>
  )
}
