# ACCESSIBILITY.md — WCAG 2.1 AA (Non-negotiable)

---

## Document Structure

- Exactly one `<main>` per page.
- Exactly one `<h1>` per page. Heading levels never skip.
- Every landmark (`<nav>`, `<header>`, `<aside>`, `<section>`) gets `aria-label` or `aria-labelledby`.
- `<html lang="...">` always set. i18n builds: `lang={params.locale}`.

---

## keyboard-focus-ring — Mandatory on Every Interactive Element

**Why a custom class instead of the browser default:** the default focus ring fires on *mouse*
clicks too, which designers then remove with `outline: none` — and that silently strips keyboard
navigation for everyone. This class splits the two: invisible on pointer input, clearly visible
on keyboard input, driven by `[data-input-modality]` set by `InputModalityTracker`. It gives you
the clean pointer UX that motivates removing outlines, without the accessibility loss.


```css
/* styles/accessibility.css */
.keyboard-focus-ring:focus { outline: none; }
[data-input-modality="keyboard"] .keyboard-focus-ring:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

```tsx
// InputModalityTracker.tsx — "use client", zero-render, mounted once in Providers
useEffect(() => {
  const onKey     = () => document.documentElement.setAttribute("data-input-modality", "keyboard")
  const onPointer = () => document.documentElement.setAttribute("data-input-modality", "pointer")
  window.addEventListener("keydown", onKey)
  window.addEventListener("pointerdown", onPointer)
  return () => {
    window.removeEventListener("keydown", onKey)
    window.removeEventListener("pointerdown", onPointer)
  }
}, [])
```

**`className="keyboard-focus-ring"` is mandatory on every interactive element.**

---

## Forms — Full Accessible Contract

```tsx
<label htmlFor="contact-email">Email address</label>
<input
  id="contact-email" name="email" type="email"
  autoComplete="email" inputMode="email" required
  aria-invalid={!!error}
  aria-describedby={error ? "contact-email-error" : undefined}
  className="keyboard-focus-ring"
/>
{error && <p id="contact-email-error" role="alert">{error}</p>}
```

Rules:
- Every field has `<label>` with `htmlFor`
- `id` and `name` on all inputs
- `required` on required fields
- Error messages: `role="alert"` + `aria-describedby`
- Submit feedback via `announce()` from LiveRegion
- `inputMode` for email/tel/numeric fields
- `autoComplete` set appropriately

---

## Keyboard Navigation

- Tab order follows visual reading order.
- No positive `tabIndex`. Only `0` and `-1`.
- All interactive elements are real `<button>` or `<a>`. Never `<div onClick>`.

---

## Common ARIA Patterns

```tsx
// Icon-only button
<button type="button" aria-pressed={isActive} aria-label="Description" className="keyboard-focus-ring">
  <IconSun aria-hidden="true" />
</button>

// Nav active state
<a aria-current={isActive ? "page" : undefined}>Link</a>

// Toggle button
<button aria-expanded={isOpen} aria-controls="panel-id">Toggle</button>

// Hidden panel (inactive)
<div aria-hidden={!isActive} inert={!isActive ? "" : undefined}>...</div>

// Modal/dialog
<div role="dialog" aria-modal="true" aria-labelledby={titleId}>...</div>

// Decorative element
<div aria-hidden="true" className="pointer-events-none">...</div>
```

---

## Focus Management

When content changes without full navigation (tabs, panels, stages, modals):
- Focus moves to new content via `useStageFocus(activeKey)`
- Modal: traps focus while open, returns focus to trigger on close

```tsx
// useStageFocus.ts
export function useStageFocus(activeKey: string) {
  const containerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const timeout = setTimeout(() => {
      containerRef.current?.focus({ preventScroll: true })
    }, 300)
    return () => clearTimeout(timeout)
  }, [activeKey])
  return containerRef
}
```

---

## Touch Targets & Mobile

```css
/* styles/accessibility.css */

/* Kill the mobile WebKit blue tap-highlight rectangle on EVERY interactive element.
   Without this, tapping any button/link/[role="button"] flashes a bluish frame on iOS
   and Android Chrome. Keyboard focus is handled via outline below, so this is safe. */
html, * { -webkit-tap-highlight-color: transparent; }

@media (max-width: 767px) {
  button, [role="button"], a,
  input[type="checkbox"], input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }
}
body { overscroll-behavior: none; }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}
```

---

## Mobile Menu — Required Attributes

```
role="dialog" aria-modal="true" aria-label="Navigation" on the panel
aria-expanded + aria-controls on toggle button
When open: focus moves inside. Closes on Escape. Locks body scroll.
When closed: focus returns to toggle button.
```

---

## Checklist (run before marking any page done)

**Keyboard**
- [ ] Full flow completable with keyboard alone?
- [ ] Focus always visible in keyboard mode?
- [ ] Focus never appears during pointer/touch?
- [ ] Modal traps focus + returns on close?

**Semantics**
- [ ] One `<main>` per page?
- [ ] One `<h1>`? No skipped levels?
- [ ] Every landmark labelled?
- [ ] Decorative elements `aria-hidden="true"`?
- [ ] Skip link first in DOM?
- [ ] `<html lang="...">` set?

**Forms**
- [ ] Every field has `<label htmlFor>`?
- [ ] Errors linked via `aria-describedby`?
- [ ] Submit feedback via `announce()`?

**Motion**
- [ ] `prefers-reduced-motion` respected?
- [ ] App toggle works and persists?
