# CSS_TOKENS.md — Styling Rules

---

## Rule Summary — READ THIS FIRST

### `style={{}}` IS BANNED. COMPLETELY. ZERO EXCEPTIONS.

**Why this one is absolute:** GSAP animates via inline styles. Anything you hand-write in
`style={{}}` occupies the same slot GSAP needs, so the two silently fight — and the loser is
usually your layout, at a random frame. Two failures in this codebase came from exactly that
(see `05-ANIMATIONS.md` on `clearProps` wiping `next/image fill`, and the `/build-navbar` skill on
transforms breaking `position: fixed`). A Tailwind class lands in a stylesheet instead, where
GSAP's inline styles cleanly override it and cleanup restores it. This is a correctness rule
wearing a style rule's clothes.

**Known accepted deviation — display typography.** Hero/display text in this project hand-rolls
`font-display text-[clamp(...)] font-black [font-stretch:N%]` rather than using `.text-display`.
The semantic class cannot express the per-element `font-stretch` and optical sizing the brand
needs. Body copy still uses `.text-body` / `.text-body-sm` / `.text-label` and must continue to.
Do not "fix" the display type back to semantic classes; do not extend the deviation to body text.


Every visual property must be a **Tailwind utility class**.

### 🚫 An arbitrary value is a LAST RESORT — never when a token exists

Before writing any `[value]`, check `styles/theme.css` and `styles/base.css` for a token or
semantic class that already covers it. If one exists, using an arbitrary value instead is a
**violation**, not a shortcut: it forks the design system, and the next change to the token
silently misses your hardcoded copy.

```
❌ text-[1.25rem]        → ✅ text-subheading      (semantic class exists)
❌ text-[#c9a227]        → ✅ text-primary         (token exists)
❌ p-[1rem]              → ✅ p-4                  (in the scale)
❌ rounded-[8px]         → ✅ rounded-md           (token exists)
❌ z-[50]                → ✅ z-drawer             (named class exists)
❌ gap-[0.5rem]          → ✅ gap-2                (in the scale)

✅ pt-[clamp(6rem,14vh,8rem)]        no token for this — legitimate
✅ max-w-[52ch]                       no token for this — legitimate
✅ [grid-template-columns:1fr_240px]  no named utility exists — legitimate
```

The order is always: **semantic class → design token → Tailwind scale → arbitrary value.**
Only reach the last step when the first three genuinely have nothing.

Tailwind v4 with arbitrary properties (`[property:value]`) can express every CSS property —
there is no fallback file, no edge case, no exception.

```
✅ className="pt-[clamp(6rem,14vh,8rem)]"
✅ className="relative overflow-hidden h-screen text-paper"
✅ className="absolute inset-0 pointer-events-none z-[2]"
✅ className="[grid-template-columns:1fr_240px]"
✅ className="[background:linear-gradient(to_right,var(--color-primary),var(--color-secondary))]"
✅ className="invisible"   ← GSAP pre-animation hiding uses Tailwind, never inline style
❌ style={{ paddingTop: "clamp(6rem,14vh,8rem)" }}
❌ style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
❌ style={{ color: "var(--color-paper)" }}
❌ style={{ position: "relative" }}
❌ style={{ overflow: "hidden" }}
❌ style={{ objectFit: "cover" }}
❌ style={{ visibility: "hidden" }}
```

**`components.css` does not exist. There is no fallback CSS file. Tailwind or nothing.**

**Semantic token rule for JSX:** raw CSS variables are for CSS files, not component class strings.

```tsx
// ✅ JSX uses semantic Tailwind tokens or semantic text classes
className="text-primary font-sans bg-surface"
className="text-body text-ink"

// ❌ NEVER in JSX
className="text-(--color-primary)"
className="font-(--font-sans)"
className="bg-(--color-surface)"
```

Use `var(--color-*)` and `var(--font-*)` only inside `styles/theme.css`, `styles/base.css`, and other CSS files that define the design system.

If a pattern is repeated 3+ times, extract a React component — not a CSS class.

### ⚠️ A colour utility next to `.text-body` / `.text-body-sm` / `.text-caption` LOSES

Those three classes set `color` themselves in `styles/base.css`, and `base.css`
is imported **unlayered**. Tailwind v4 puts utilities in `@layer utilities`, and
**unlayered CSS beats every layered rule regardless of specificity** — so a
colour utility on the same element is silently ignored.

```tsx
// ❌ all three render muted grey — text-body-sm wins, no error, no warning
<span className="text-body-sm text-ink">
<span className="text-body-sm text-white">
<span className="text-body-sm [color:var(--color-ink)]">

// ✅ split them: type on the outside, colour on the inside
<span className="text-body-sm">
  <span className="[color:var(--color-ink)]">28 días</span>
</span>
```

Found on the analytics range picker: navy-on-amber rendered as grey-on-amber
(1.9:1) and three separate "fixes" all lost to the same rule. **Verify the
computed colour in the browser** — this one is invisible in the source.

### Other rules

- ALL visual tokens live in `styles/theme.css` as CSS custom properties.
- No hardcoded hex, px, font names anywhere except `styles/theme.css`.
- All text styling uses semantic classes from `styles/base.css` only.
- Tailwind typography utilities (`text-xl`, `font-bold`, etc.) are BANNED in components.
- `sm:` prefix is BANNED everywhere.
- Arbitrary z-index (`z-[200]`) is BANNED — use named classes from `base.css`.
- **`--text-xs` / `text-kicker` / `text-caption` are BANNED as font sizes.** Minimum text size is `text-body`. No exceptions anywhere in any component.

---

## styles/theme.css — Required Structure

Two blocks must both be present:

```css
/* 1. Raw CSS custom properties */
:root {
  /* Typography */
  --font-sans:    var(--font-inter), system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", "Fira Code", monospace;
  --text-xs:      clamp(0.65rem,  1vw,   0.75rem);
  --text-sm:      clamp(0.75rem,  1.2vw, 0.875rem);
  --text-base:    clamp(0.9rem,   1.5vw, 1rem);
  --text-md:      clamp(1rem,     2vw,   1.125rem);
  --text-lg:      clamp(1.1rem,   2.5vw, 1.25rem);
  --text-xl:      clamp(1.2rem,   3vw,   1.5rem);
  --text-2xl:     clamp(1.4rem,   4vw,   2rem);
  --text-3xl:     clamp(1.8rem,   5vw,   2.5rem);
  --text-4xl:     clamp(2.2rem,   6vw,   3.5rem);
  --text-display: clamp(3rem,     8vw,   6rem);
  --font-weight-regular: 400; --font-weight-medium: 500;
  --font-weight-semibold: 600; --font-weight-bold: 700; --font-weight-black: 900;
  --leading-tight: 1.15; --leading-snug: 1.35; --leading-normal: 1.6; --leading-loose: 1.8;
  --tracking-tight: -0.03em; --tracking-normal: 0em; --tracking-wide: 0.05em; --tracking-widest: 0.15em;

  /* Colors — replace with project brand */
  --color-bg:           #0f0f0f;
  --color-surface:      #1a1a1a;
  --color-surface-2:    #222222;
  --color-border:       #2e2e2e;
  --color-text:         #e5e7eb;
  --color-text-muted:   #9ca3af;
  --color-text-subtle:  #6b7280;
  --color-primary:      #7c6af7;
  --color-primary-hover:#6d5ce6;
  --color-secondary:    #4ade80;
  --color-danger:       #f87171;
  --color-warning:      #fbbf24;
  --color-info:         #60a5fa;
  --color-success:      #4ade80;

  /* Spacing */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem; --space-24: 6rem;

  /* Radii */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.6);

  /* Easing */
  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:    cubic-bezier(0.7, 0, 0.84, 0);
  --ease-inout: cubic-bezier(0.87, 0, 0.13, 1);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 500ms;

  /* Z-index */
  --z-drawer-backdrop: 40; --z-drawer: 50; --z-dropdown: 60;
  --z-modal: 70; --z-picker: 75; --z-overlay: 80; --z-toast: 90;
}

/* 2. Tailwind v4 @theme block — REQUIRED */
@theme {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-border: var(--color-border);
  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-text-subtle: var(--color-text-subtle);
  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);
  --color-secondary: var(--color-secondary);
  --color-danger: var(--color-danger);
  --color-warning: var(--color-warning);
  --color-info: var(--color-info);
  --color-success: var(--color-success);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-sm: var(--radius-sm); --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg); --radius-xl: var(--radius-xl); --radius-full: var(--radius-full);
  --shadow-sm: var(--shadow-sm); --shadow-md: var(--shadow-md); --shadow-lg: var(--shadow-lg);
}
```

Replace all color values with the project's brand system before writing components.

---

## styles/base.css — Semantic Text Classes (required)

```css
/* Do NOT include box-sizing/margin/padding resets — Tailwind Preflight handles them */

html { scroll-behavior: smooth; }
::selection { background: var(--color-primary); color: #fff; }
button, [role="button"], [type="button"], [type="submit"], [type="reset"] { cursor: pointer; }
input, textarea, select { font-size: 1rem; } /* iOS zoom prevention */

/* Named z-index — no arbitrary values anywhere */
.z-drawer-backdrop { z-index: var(--z-drawer-backdrop); }
.z-drawer          { z-index: var(--z-drawer); }
.z-dropdown        { z-index: var(--z-dropdown); }
.z-modal           { z-index: var(--z-modal); }
.z-picker          { z-index: var(--z-picker); }
.z-overlay         { z-index: var(--z-overlay); }
.z-toast           { z-index: var(--z-toast); }

/* Semantic text — ONLY these classes for text styling in components */
.text-display    { font-size: var(--text-display); font-weight: var(--font-weight-black);   line-height: var(--leading-tight);  letter-spacing: var(--tracking-tight); }
.text-title      { font-size: var(--text-4xl);     font-weight: var(--font-weight-bold);    line-height: var(--leading-tight); }
.text-heading    { font-size: var(--text-2xl);     font-weight: var(--font-weight-bold);    line-height: var(--leading-snug); }
.text-subheading { font-size: var(--text-xl);      font-weight: var(--font-weight-semibold);line-height: var(--leading-snug); }
.text-body       { font-size: var(--text-base);    font-weight: var(--font-weight-regular); line-height: var(--leading-normal); color: var(--color-text); }
.text-body-sm    { font-size: var(--text-sm);      font-weight: var(--font-weight-regular); line-height: var(--leading-normal); color: var(--color-text-muted); }
.text-caption    { font-size: var(--text-xs);      font-weight: var(--font-weight-regular); line-height: var(--leading-normal); color: var(--color-text-subtle); }
.text-label      { font-size: var(--text-xs);      font-weight: var(--font-weight-semibold);letter-spacing: var(--tracking-widest); text-transform: uppercase; }
```

---

## Tailwind usage in components — quick reference

```
✅ bg-surface, text-primary, border-border, rounded-md, shadow-lg, font-sans
✅ className="text-heading" (semantic class from base.css)
❌ style={{ color: "var(--color-accent)" }}   → use className="text-accent"
❌ text-(--color-primary), font-(--font-sans) → use semantic tokens
❌ text-xl, font-bold, text-gray-500          → use semantic class
❌ sm:anything                                → banned prefix
❌ z-[200]                                    → use .z-modal etc.
❌ w-[340px]                                  → use CSS variable or standard scale
```

---

## next/font — required pattern

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
// <html className={inter.variable}>
```

Never `@import` Google Fonts in CSS.

---

## Installed 3D skills — two upstream examples violate this rule

`react-three-fiber` and `lightweight-3d-effects` (in `~/.claude/skills/`) each contain one
`style={{ }}` example — `<div style={{ height: '100vh' }}>` for a scroll/canvas wrapper.
Those are upstream vendored files, deliberately left unedited.

**This rule still wins.** Write `className="h-screen"` / `className="h-screen w-full"` instead.
`.claude/hooks/check-rules.sh` blocks it at write time regardless, so following the skill
verbatim will fail the hook — that is the hook working, not a false positive.
