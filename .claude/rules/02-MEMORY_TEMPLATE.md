# MEMORY_TEMPLATE.md — Bootstrap Template for MEMORY.md

Create `MEMORY.md` at the project root with this structure, filled in from the brief:

```markdown
# [PROJECT_NAME] Memory

## Project
- Name: [PROJECT_NAME]
- Domain: [DOMAIN]
- Default locale: [DEFAULT_LOCALE]
- Locales: [LOCALES]
- i18n enabled: yes/no

## Routes (canonical slugs in default language)
- / — home
- [list every route]

## Design System
- Font(s): [FONT_NAME] — loaded via next/font/google, variable: --font-[name]
- Primary color: [HEX]
- Background: [HEX]
- [other key tokens]

## Components
- [ ] app/layout.tsx
- [ ] globals.css
- [ ] styles/theme.css
- [ ] styles/base.css
- [ ] styles/animations.css
- [ ] styles/accessibility.css
- [ ] components/layout/Providers.tsx
- [ ] components/layout/PageLoader.tsx
- [ ] components/layout/PageShell.tsx
- [ ] components/layout/Navbar.tsx
- [ ] components/layout/Footer.tsx
- [ ] contexts/AppReadyContext.tsx
- [ ] contexts/TransitionContext.tsx
- [ ] contexts/ScrollContext.tsx
- [ ] hooks/useAppReady.ts
- [ ] hooks/usePageReady.ts
- [ ] hooks/usePageTransition.ts
- [ ] lib/gsap.ts
- [ ] lib/lenis.ts
- [ ] utils/animations/page-transitions.ts
- [ ] components/ui/TransitionLink.tsx
- [ ] [add all project-specific components]

## Opt-in components (only if this project asked for them — delete the rest)
- [ ] components/ui/ScrollToTop.tsx      — /add-scroll-to-top
- [ ] utils/animations/parallax.ts       — /add-parallax

## Session Log
- [DATE] — Bootstrapped project
- [DATE] — [what was done]

## Deviations from spec
- [list any intentional brief-driven deviations here]

## Known issues / TODO
- [list unresolved issues]
```

---

## Rules for maintaining MEMORY.md

- Check off components as they are written and pass the checklist.
- Add an entry to Session Log at the start of every new session.
- Document every deviation from the spec in the Deviations section.
- When resuming, read MEMORY.md first to know what is done and what remains.
