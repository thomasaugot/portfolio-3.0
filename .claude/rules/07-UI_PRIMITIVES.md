# UI_PRIMITIVES.md — Custom UI Components

All UI primitives live in `components/ui/`. No native `<select>`, `<input type="checkbox">`,
`<input type="date">`, or bare `<button>` outside these primitives. Ever.

**Why:** the native versions cannot be styled consistently across browsers, and — more
importantly — each custom primitive here carries an accessibility contract (focus ring, ARIA
roles, keyboard handling, portal escape from `overflow:hidden`) that is easy to forget and
invisible when missing. Centralising them means the contract is written once and cannot be
half-implemented at a call site. `<select>` in particular cannot render its options outside a
clipping ancestor, which is why `Dropdown` portals them.

---

## Button.tsx

```ts
type ButtonVariant = "filled" | "outlined"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant   // default: "filled"
  size?: ButtonSize         // default: "md"
  loading?: boolean
  icon?: React.ReactNode
}
// Styling via CSS classes only. No hardcoded values. No inline styles.
// className="keyboard-focus-ring" always present.
```

## Input.tsx

```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string      // required — placeholder is NOT a label
  error?: string
  hint?: string
}
// <label htmlFor={id}>{label}</label>
// <input id={id} aria-invalid={!!error}
//   aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
//   className="keyboard-focus-ring" />
// {error && <p id={`${id}-error`} role="alert">{error}</p>}
// font-size: var(--text-base) — min 1rem — prevents iOS zoom
```

## Modal.tsx — React Portal

```ts
interface ModalProps {
  isOpen: boolean; onClose: () => void; title: string
  children: React.ReactNode; size?: "sm" | "md" | "lg" | "full"
}
// createPortal(content, document.body)
// z-modal (var(--z-modal))
// role="dialog" aria-modal="true" aria-labelledby={titleId}
// Locks body scroll. Closes on Escape + backdrop click.
// Traps focus. Returns focus to trigger on close.
// className="keyboard-focus-ring" on all interactive elements.
```

## Dropdown.tsx

```
// Custom select — never native <select>
// Options via createPortal — avoids overflow/clip
// z-dropdown (var(--z-dropdown))
// Keyboard: ArrowUp/Down navigate, Enter select, Escape close
// role="combobox" aria-expanded aria-activedescendant
// className="keyboard-focus-ring" on trigger
```

## Checkbox.tsx

```
// Custom — never native <input type="checkbox">
// role="checkbox" aria-checked. Space to toggle.
// tabIndex={0}. className="keyboard-focus-ring"
```

## CalendarPicker.tsx

```
// Custom — never native <input type="date">
// Calendar grid in Portal. z-picker (var(--z-picker)).
// Keyboard: ArrowKeys navigate, Enter select, Escape close
// Props: value, onChange, min?, max?, disabled?
// Value format: ISO 8601 (YYYY-MM-DD)
// role="dialog" aria-label="Date picker"
// className="keyboard-focus-ring" on all interactive cells
```

## Icons.tsx

```tsx
"use client"
import { FiMenu, FiX, FiArrowRight, FiCheck, FiAlertCircle } from "react-icons/fi"
import type { IconBaseProps } from "react-icons"
type IconProps = IconBaseProps
export const IconMenu  = (p: IconProps) => <FiMenu        aria-hidden="true" {...p} />
export const IconClose = (p: IconProps) => <FiX           aria-hidden="true" {...p} />
export const IconArrow = (p: IconProps) => <FiArrowRight  aria-hidden="true" {...p} />
export const IconCheck = (p: IconProps) => <FiCheck       aria-hidden="true" {...p} />
export const IconAlert = (p: IconProps) => <FiAlertCircle aria-hidden="true" {...p} />
// Add ALL project icons here. aria-hidden="true" always.
// Swapping icon library = one-file change.
```

## SkipLink.tsx

```tsx
"use client"
// First focusable element in DOM — before Navbar, before everything.
export function SkipLink({ targetId }: { targetId: string }) {
  // Smooth scroll + focus on click
  return (
    <a href={`#${targetId}`} onClick={handleClick}
       className="sr-only focus:not-sr-only fixed top-4 left-4 keyboard-focus-ring">
      Skip to content
    </a>
  )
}
// Usage in every layout:
// <SkipLink targetId="main-content" />
// <Navbar />
// <main id="main-content">...</main>
```

## LiveRegion.tsx

```tsx
"use client"
// Singleton. Mounted once in Providers.tsx.
export function LiveRegion() {
  return (
    <>
      <div role="status" aria-live="polite"    aria-atomic="true" className="sr-only" id="live-polite" />
      <div role="alert"  aria-live="assertive" aria-atomic="true" className="sr-only" id="live-assertive" />
    </>
  )
}
export function announce(message: string, politeness: "polite" | "assertive" = "polite") {
  const el = document.getElementById(politeness === "assertive" ? "live-assertive" : "live-polite")
  if (!el) return
  el.textContent = ""
  requestAnimationFrame(() => { el.textContent = message })
}
```

## Toaster.tsx

```
// React Portal to document.body. z-toast (var(--z-toast)). Fixed top-center.
// Mounted ONCE in Providers.tsx. Never in a page, modal, or form.
// Must never be trapped inside a transformed parent.
// Animates in from top with fade/slide.
// Each toast calls announce() from LiveRegion.
// showToast(message, type?: "success" | "error" | "warning" | "info")
// Every database write (create/update/delete/resolve/status change) triggers a toast.
// ❌ No local success banners. ❌ No page-specific toast systems.
```

### Three rules learned the hard way

**1. Duration scales with the type. Never one flat timeout.**
An error has to be READ before it can be acted on, and it often lands mid-navigation.
A success only confirms something the user already did.

```ts
const DURATION: Record<ToastType, number> = {
  success: 4000, info: 5000, warning: 7000, error: 9000,
}
setTimeout(() => dismiss(toast.id), DURATION[toast.type])
```

**2. The Toaster renders NOTHING until `loaderGone`.**
`PageLoader` covers the whole viewport, so a toast raised during boot or during a
redirect burns its entire lifetime unseen and the user never learns why something
failed. Gate the whole portal — each toast's dismiss timer starts when it MOUNTS,
so the message keeps its full time on screen once the loader lifts.

```tsx
const loaderGone = useLoaderGone()
if (!isHydrated || !loaderGone) return null
```

⚠️ This only works while `<PageLoader />` is mounted in `Providers.tsx`. If it is
not, `loaderGone` stays false forever and NO toast ever appears (see 05-ANIMATIONS.md).

**3. Dedupe identical toasts in the STORE, not at the call site.**
React StrictMode double-invokes effects in dev, and a navigation can re-run the code
that raised the toast, so the same message appeared twice. An id built from
`Date.now()` does not save you: two pushes in the same millisecond both land.

```ts
push: (message, type) =>
  set((state) => {
    if (state.toasts.some((t) => t.message === message && t.type === type)) return state
    return { toasts: [...state.toasts, { id: …, message, type }] }
  }),
```

**Icon sizing:** the toast icon needs `shrink-0` AND an explicit size. A long message
squashes a bare `<Icon />` flat.

```tsx
<Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
```

## PageLoader.tsx

Full pattern lives in the `/build-page-loader` skill.

```
// Full-screen overlay. Visible while appReady is false.
// Animates out (GSAP, opacity + scale) when appReady becomes true.
// Unmounts itself after exit animation completes.
// Placed in Providers.tsx as sibling of PageShell. Never inside a page.
// role="status" aria-label="Loading" while visible.
// Does not steal focus when it exits.
// Calls announce("Page ready", "polite") when exit completes.
// For INITIAL load only. Subsequent navigations are a content crossfade
// handled by enterPage/exitPage in PageShell — there is no overlay.
```
