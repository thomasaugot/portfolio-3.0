# ERROR_LOADING.md — 404, Error Boundaries & Loading States

Every project ships all four boundaries below, branded to **that** project, translated into
**every** locale it supports. They are not a polish pass at the end — a missing `loading.tsx`
is a blank screen on a slow connection, and a missing `error.tsx` is Next's own unstyled
English error page in front of a client.

**Build them as part of the standard layout, without being asked**, the same way Navbar and
PageLoader are.

> The code below is the Frontón King implementation, which is where this pattern was proven.
> **Copy the STRUCTURE and the comments; never copy the branding.** Wave imagery, the word
> "Wipeout", the deep-navy ground and the italic condensed display face are that project's.
> Yours needs its own equivalents — see "Branding it" at the foot of this file.

---

## The four files — all of them, every project

| File | Catches | Renders own `<html>`? | Translated? |
|---|---|---|---|
| `app/not-found.tsx` | a path with **no locale at all** | ✅ yes | ❌ can't be — no locale resolved |
| `app/[locale]/not-found.tsx` | `notFound()` + unmatched routes under a locale | no | ✅ yes |
| `app/[locale]/error.tsx` | a throw in any localised page | no | ✅ yes |
| `app/global-error.tsx` | the **root layout itself** throwing | ✅ yes | ❌ can't be — providers may be dead |
| `app/[locale]/<page>/loading.tsx` | the server render of that page being in flight | no | ✅ yes (if it has copy) |

Two of them cannot be translated, and that is correct, not a shortcut. Reasons below.

---

## 1. `app/not-found.tsx` — the root 404

### 🚫 NEVER `redirect()` from this file

It is the obvious implementation and it is wrong. `redirect()` is implemented by **throwing**
a control error. React's dev profiler measures every server component it renders, and for one
that threw it emits a `performance.measure` with a negative end time:

```
Uncaught TypeError: Failed to execute 'measure' on 'Performance':
'RootNotFound' cannot have a negative time stamp.
```

Chrome probes `/.well-known/appspecific/com.chrome.devtools.json` on every page load with
DevTools open, so this fires **constantly** and buries the console errors that matter.

A component that RETURNS MARKUP does not throw, so the profiler has a real render to measure.
It also stops a 404 becoming a `307` to somewhere else — `404` is the honest status for a path
that does not exist.

```tsx
// app/not-found.tsx — Server Component, renders its OWN <html>/<body>
import { defaultLocale } from "@/config/i18n.config"

export default function RootNotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="bg-bg-deep">
        <main className="relative isolate grid min-h-screen place-items-center overflow-hidden px-6">
          {/* project's own hero image + scrim */}
          <div className="relative text-center">
            <p className="font-display text-[clamp(6rem,26vw,16rem)] font-black leading-[0.8] text-white/15">
              404
            </p>
            {/* Plain <a>, NOT TransitionLink: no providers exist at this level. */}
            <a href={`/${defaultLocale}`} className="...">Project Name</a>
          </div>
        </main>
      </body>
    </html>
  )
}
```

**No translations here, on purpose.** No locale has been resolved at this level, so no messages
are loaded. Anything unmatched *below* a locale is caught by the branded
`[locale]/not-found.tsx`, which does have them. Link with a plain `<a>` — `TransitionLink`
needs providers that do not exist here.

---

## 2. `app/[locale]/not-found.tsx` — the branded 404

Server Component. Nothing here needs the client.

```tsx
import { getTranslations } from "next-intl/server"
import { TransitionLink } from "@/components/ui/TransitionLink"

export default async function LocaleNotFound() {
  const t = await getTranslations("errors")
  return (
    <main id="main-content" className="relative isolate min-h-screen overflow-hidden bg-bg-deep">
      {/* background image + gradient scrim, aria-hidden, -z-20 */}
      {/* the oversized numeral, aria-hidden, select-none, -z-10 */}
      <div className="relative flex min-h-screen flex-col justify-end px-6 pb-24 lg:px-16 lg:pb-32">
        <div className="max-w-[42rem]">
          <p className="eyebrow text-secondary">{t("notFoundTitle")}</p>
          <h1 className="mt-4 font-display ...">{t("notFoundBody")}</h1>
          <TransitionLink href="/" className="keyboard-focus-ring ...">{t("home")}</TransitionLink>
        </div>
      </div>
    </main>
  )
}
```

### The composition rule — the numeral IS the artwork

Do **not** build a centred paragraph with a small "404" above it. That is the framework default
shape and it looks like an outage, not like your product.

Set the numeral **enormous and cropped by the viewport** (`text-[38vw]`), at very low opacity
(`text-white/[0.07]`), behind the content, with the message tucked into the negative space at
its foot. It is decorative, so `aria-hidden="true"`, `pointer-events-none` and `select-none` —
it is a graphic, not text anyone will copy.

### ⚠️ It is UNREACHABLE without a catch-all route

`app/[locale]/not-found.tsx` only renders when something inside a **matched** route calls
`notFound()`. A path like `/es/anything` never resolves the `[locale]` segment at all, so Next
falls back to its OWN root 404 — unstyled, English, black-on-white — and the branded file you
just built is never seen.

Add the catch-all that hands control to it:

```tsx
// app/[locale]/[...unmatched]/page.tsx
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

export default async function UnmatchedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  notFound()
}
```

Test it: `/es/does-not-exist` must show the branded page, not Next's.

---

## 3. `app/[locale]/error.tsx` — the route error boundary

`"use client"` — error boundaries are always client components.

**Match the 404's composition exactly.** The two pages are seen by the same person in the same
session; if they are shaped differently the app looks unfinished. Same ground, same crop, same
oversized word — swap the numeral for the project's own word for a bad outcome.

### Logging: the digest alone is not enough

```tsx
useEffect(() => {
  // Never the message — it can carry data (12-SECURITY).
  // But `digest` is `undefined` for a CLIENT-side error, which logs
  // "route error undefined" and says nothing about what broke.
  // The name and first stack frame are safe and are what actually locates it.
  const frame = error.stack?.split("\n")[1]?.trim().slice(0, 120)
  logger.error("route error", error.digest ?? error.name, frame ?? "")
}, [error])
```

Give it **both** exits: a `reset()` button (enough for a transient data failure) and a link
home. An error page with no way back into the app is a dead end.

---

## 4. `app/global-error.tsx` — last resort

Fires only when the **root layout itself** throws. It REPLACES that layout, so it must render
its own `<html>` and `<body>`.

**It cannot use next-intl, the theme provider, or any app component** — whatever failed may be
exactly what those depend on. So the copy is hardcoded English and the markup is minimal. That
is not laziness; this file has to work when nothing else does.

```tsx
"use client"
export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string }; reset: () => void
}) {
  useEffect(() => { logger.error("global error", error.digest) }, [error])
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-title">Something went wrong</h1>
        <p className="text-body max-w-[52ch]">The application failed to start. Please reload the page.</p>
        <button type="button" onClick={reset} className="text-body underline keyboard-focus-ring">
          Try again
        </button>
      </body>
    </html>
  )
}
```

---

## 5. `loading.tsx` — one per route segment

### Why every page needs one

If routes are `force-dynamic` and `TransitionLink` sets `prefetch={false}`, **every tap is a
cold round-trip**. Without a `loading.tsx` the exit animation fades `<main>` to opacity 0 and
nothing replaces it until the response lands — a blank screen for as long as the network takes,
with no sign anything is happening. The user re-taps, which starts the whole thing again.

That is the failure mode on a saturated mobile network at a live event. It is not hypothetical.

### `components/ui/Skeleton.tsx` — a shape, not a spinner

```tsx
/* Server component on purpose — a placeholder that needs JavaScript to appear
   arrives after the thing it was meant to cover. */
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <span aria-hidden="true" className={`skeleton block ${className}`} />
)
```

A spinner says "wait" and nothing else. A skeleton in the right shape tells you what is coming
and stops the layout jumping when it arrives.

### `styles/animations.css` — sweep, not pulse

```css
/* A travelling highlight rather than a fading block: a pulse reads as something
   blinking at you, whereas a sweep reads as content arriving. */
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface) 0%, var(--color-surface-2) 42%, var(--color-surface) 84%);
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
  border-radius: var(--radius-md);
}
/* The sweep is decorative; a still block still says "loading" through its shape. */
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
```

### Generic for public pages, specific for panels

```tsx
// app/[locale]/<page>/loading.tsx — most pages
import { PageSkeleton } from "@/components/layout/PageSkeleton"
export default function Loading() { return <PageSkeleton /> }
```

**Two routes legitimately have none**, and neither is an oversight:

- the `[...unmatched]` catch-all — it calls `notFound()` immediately and awaits nothing, so a
  skeleton would flash for a render that never happens
- a login/auth page that only mounts a client component with no server data to wait on

The rule is *every route that awaits something*, not every folder.

`PageSkeleton` is **deliberately generic**: a per-page skeleton that guesses the layout wrong
rearranges the screen when the real content arrives, which reads worse than an honest neutral
shape.

Reach for a bespoke skeleton only where the layout is **known and stable** — an admin panel
whose shape you control. When you do, it must match the panel's CURRENT shape: one here once
showed a grid of stat tiles for a panel that had since become a list of rows, so the screen
rearranged itself on load. A wrong skeleton is worse than a generic one.

Wrap the placeholder region in `aria-busy="true"`.

---

## Locale keys — `common.json` under `errors`

One block, spread at the root by `i18n/request.ts` (see 09-I18N.md), so every boundary reads
`useTranslations("errors")` / `getTranslations("errors")`.

```json
"errors": {
  "generic": "Something went wrong",
  "notFound": "Page not found",
  "offline": "Offline — showing saved data",
  "title": "Something went wrong",
  "body": "We couldn't load this page. Please try again.",
  "retry": "Try again",
  "home": "Go home",
  "notFoundTitle": "Page not found",
  "notFoundBody": "This page doesn't exist or has moved.",
  "eyebrow": "Wipeout"
}
```

**Every locale the project supports gets every key.** A missing key is not a fallback, it is a
visible `errors.retry` on the page.

`eyebrow` is the deliberate exception to translating: it is the project's brand word for a bad
outcome and stays identical in all languages, the way "Main Sponsor" does. Pick one that belongs
to the project's own world — a surf event can say *Wipeout*; a finance product cannot.

Verify before calling it done:

```bash
for l in es en fr de pt; do
  echo "-- $l"
  python3 -c "import json;print(sorted(json.load(open('locales/$l/common.json'))['errors']))"
done
```

All five lists must be identical.

---

## Branding it to a NEW project

Keep the structure, replace all six of these:

| Element | Frontón King | Yours |
|---|---|---|
| Ground | `bg-bg-deep`, deep navy | the project's darkest surface token |
| Backdrop | breaking wave photo | an image from the project's own library |
| Scrim | navy gradient, 0.82 → 0.55 → 0.96 | tuned so the headline clears contrast |
| Display face | italic condensed, `[font-stretch:70%]` | the project's display face |
| Error word | "Wipeout" | the project's own word for a bad outcome |
| Accent | `text-secondary` | the project's accent token |

The **shape** stays: oversized word cropped by the viewport, content bottom-left, two exits.

---

## Checklist

- [ ] All four boundary files exist?
- [ ] `app/[locale]/[...unmatched]/page.tsx` exists and calls `notFound()`? Without it the branded locale 404 is unreachable.
- [ ] `app/not-found.tsx` RENDERS, never `redirect()`?
- [ ] Root 404 and `global-error` render their own `<html lang>`?
- [ ] Root 404 uses a plain `<a>`, not `TransitionLink`?
- [ ] `global-error` free of next-intl and app components?
- [ ] `error.tsx` logs name + stack frame, never `error.message`?
- [ ] `error.tsx` offers BOTH `reset()` and a link home?
- [ ] 404 and error page share one composition?
- [ ] Oversized word `aria-hidden` + `pointer-events-none` + `select-none`?
- [ ] Every route that AWAITS something has a `loading.tsx`? (catch-all and pure-client routes are exempt)
- [ ] Skeleton region wrapped in `aria-busy="true"`?
- [ ] `.skeleton` animation disabled under `prefers-reduced-motion`?
- [ ] `errors` block complete and identical-keyed in EVERY locale?
- [ ] One `<h1>` and one `<main id="main-content">` per boundary page?
