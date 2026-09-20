# Design log

**Read this before designing anything. Append to it after every attempt.**

Its only job is to stop me repeating a composition that has already been rejected. Skills
tell me what good looks like in general; this tells me what has already failed *here*, in
Thomas's own words.

Format: one entry per attempt. Keep it short. The verdict matters more than the reasoning.

---

## 2026-08-29 — standalone HTML demo, attempt 1

- **Subject:** coffee roastery landing page (I invented the brief).
- **Composition:** centred-ish hero, split hero grid, SVG roast-curve as the signature,
  marquee strip, asymmetric 12-col origins grid, full-bleed cobalt section, two plan cards.
- **Palette:** bone `#f2efe8` + cobalt `#1f3ea8` + ember `#d4491f`.
- **Verdict:** REJECTED. *"wtf is this shit"*. Sections below the hero rendered blank because
  content was gated behind a scroll-reveal script.
- **Lesson:** never gate content visibility behind JS. And I invented the subject, so the
  brief was wrong before a line of CSS was written.

## 2026-08-29 — standalone HTML demo, attempt 2

- **Subject:** type foundry specimen page (again invented).
- **Composition:** four weight/width lines as the hero, glyph wall grid, weights table,
  full-bleed blue pull quote, two licence boxes. Zero JS.
- **Palette:** paper `#e9e5dc` + blue `#2b4cd4` + signal `#e2513c`.
- **Verdict:** REJECTED. *"pfffff its terrible"*.
- **Lesson:** fixing the JS bug did not fix the design. Two invented briefs in a row.

## 2026-08-29 — RoleGate, attempt 1

- **Change:** 50/50 split became 62/38, gradient wash angles opposed (155deg/205deg),
  vertical rotated eyebrow on the seam, hairline under each headline that grew on hover.
- **Verdict:** REJECTED. *"is this a redesign???"* — correctly called out as a tweak, not a
  redesign. Also broke the permanent accent-line ban with the hairline.
- **Lesson:** changing ratios and angles is not a redesign. Vertical rotated labels are an
  agency cliché I had already been told to avoid.

## 2026-08-29 — RoleGate, attempt 2

- **Change:** diagonal clip-path seam, panels overlapping by 7vw, parallel cut angles.
- **Verdict:** REJECTED. Still the same two-photo-panel structure underneath.

## 2026-08-29 — RoleGate, attempt 3

- **Change:** dropped picture panels for two full-width stacked bands, photo at 70% opacity
  lifting to 100% on hover, headline to 8rem at 68% stretch, directional colour wash.
- **Verdict:** REJECTED, and worse than the original. *"MY OLD VERSION WAS BETTER THAN THIS
  CRAP"*. Reverted to the committed version.
- **Lesson:** four attempts, no visual reference, all rejected. Stop designing blind. Use
  `art-direct-web-design` to produce art direction, have Thomas render it, then build from
  the image with `build-from-design-image`.

## 2026-08-29 — RoleGate, attempt 4 (first with the log + gates in place)

- **Device found:** the waiting window. 14 days, 6 run, called the evening before. The one
  thing only this event has, and the old gate ignored it entirely.
- **Composition:** the window is drawn as 14 full-height columns across the whole screen at
  16% opacity — today's column lit cyan, weekends brighter, lay days faint. The two role
  choices sit ON that ground rather than being the ground themselves.
- **Risk named before building:** it becomes a calendar/admin screen instead of an entrance.
- **Verdict:** _pending_.
- **Note:** first attempt where the subject drove the composition rather than a decoration
  being added to a generic layout. Doors kept as flex children so expandRoleGate still
  collapses them.

---

## 2026-09-03 — Gallery (photocall), attempts 1-3

- **1. Flat 4-col grid** with two full-width buttons stacked above it.
  REJECTED: *"those buttons full span are terrible"*. The chrome was the loudest
  thing on a page whose subject is photographs.
- **2. Bento** of mixed cell sizes. REJECTED: *"most images are vertical and are
  trying to fit in a horizontal frame, its fucked up"*. Every photo here is a
  phone portrait; a bento forces some into landscape cells and `object-cover`
  crops away the subject. **A bento is wrong for uniformly portrait content.**
- **3. Timeline of competition days**, date set large with photos scrolling
  sideways beside it. REJECTED: *"meh, its boring and not nice, its not a
  gallery"*. Chasing the event's "device" (the waiting window) produced a
  SCHEDULE with pictures attached, not a gallery.

- **Lesson:** the subject here really is the photographs. The composition must
  make them big and let them dominate; structure that competes with them —
  buttons, dates, cell patterns — is what keeps getting rejected.


## Compositions now burned on this project

Do not reach for these again without a specific reason:

- Two equal (or near-equal) halves side by side
- The same structure with only the ratio changed
- Vertical rotated labels along a seam
- Hairlines under headlines, or any free-floating decorative line
- Full-bleed stacked bands with type over a dimmed photograph
- A signature element that is a data-graph in a bordered box
- A bento grid for uniformly PORTRAIT content (crops the subject)
- Chrome (buttons, headers) given more visual weight than the content itself

---

## 2026-09-17 — Live page (/directo): heat card promoted, marcador demoted

- **Problem named by Thomas:** *"we cant improve the design of the marcador? event he
  page. its a bit strange no?"*
- **Diagnosis:** six panels stacked at the SAME visual weight (same `--gradient-panel`,
  same radius, same inset-highlight shadow): now/next, heat card, fantasy invite,
  scoreboard, photo prompt, challenges. Nothing told the eye which mattered. Worse, the
  loudest element on the page was the SurfScores iframe — a black, square-cornered,
  foreign-typeface document — while our own live heat was four bare names in a thin card.
  That is the burned composition already at the foot of this file: *chrome given more
  visual weight than the content itself*.
- **Move 1 — lycra colour becomes the STRUCTURE of the heat card.** Not a 10px dot beside
  a name (unreadable at arm's length, in sunlight, on a cliff — the actual reading
  condition). A full colour block per rider, the colour NAMED inside it so it works
  without colour vision, position and country alongside. The heat card is now the only
  panel on the page carrying display type.
- **Move 2 — the marcador is introduced as a CITED SOURCE, not a centrepiece.** Its
  `text-heading` headline dropped to a quiet `eyebrow` ("MARCADOR OFICIAL"), and the
  iframe sits in a padded frame with the page's own radius and seam, so the board's black
  ground no longer meets our navy at a hard line that read as a rendering fault. Height
  went from a flat 600px to `min(560px,68svh)` — the fixed value left a tall dead black
  block inside the frame on a phone.
- **Risk named before building:** promoting our own provisional field over the official
  board could imply OUR numbers are authoritative. Mitigated: the provisional notice stays
  on the card, and the board keeps the "Resultados por SurfScores.com" attribution.
- **Verdict:** _pending Thomas's review._
- **Note:** the iframe is cross-origin, so its interior can never be restyled. Framing it
  is the only lever available — worth remembering before anyone tries again.
