"use client"

interface MenuToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export function MenuToggle({ isOpen, onToggle }: MenuToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      className="keyboard-focus-ring touch-target"
      style={{
        background: "none",
        border: "1px solid var(--color-border-2)",
        color: "var(--color-text)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        width: "44px",
        height: "44px",
        padding: "10px",
      }}
    >
      <span
        style={{
          display: "block",
          width: "18px", height: "1px",
          background: "currentColor",
          transition: "transform 0.3s var(--ease-out), opacity 0.2s",
          transform: isOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
        }}
      />
      <span
        style={{
          display: "block",
          width: "18px", height: "1px",
          background: "currentColor",
          transition: "opacity 0.2s",
          opacity: isOpen ? 0 : 1,
        }}
      />
      <span
        style={{
          display: "block",
          width: "18px", height: "1px",
          background: "currentColor",
          transition: "transform 0.3s var(--ease-out)",
          transform: isOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
        }}
      />
    </button>
  )
}
