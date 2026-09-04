"use client"

import { gsap, ScrollTrigger } from "@/lib/gsap"
import { prefersReducedMotion } from "@/utils/animations/motionPrefs"

function hide(selector: string, props: gsap.TweenVars = {}) {
  // Guard against selectors with no matching elements — gsap.set warns otherwise.
  if (typeof document !== "undefined" && document.querySelector(selector) === null) return
  gsap.set(selector, { opacity: 0, ...props })
}

export function initSectionReveals() {
  hide("[data-anim='section-head']", { y: 32 })
  ScrollTrigger.batch("[data-anim='section-head']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }),
    start: "top 88%",
    once: true,
  })
}

export function initServiceCardsReveal() {
  hide("[data-anim='service-card']", { y: 24 })
  ScrollTrigger.batch("[data-anim='service-card']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.08 }),
    start: "top 88%",
    once: true,
  })
}

export function initProcessReveal() {
  hide("[data-anim='proc-row']", { x: -20 })
  ScrollTrigger.batch("[data-anim='proc-row']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    start: "top 90%",
    once: true,
  })
}

export function initStackReveal() {
  hide("[data-anim='stack-bucket']", { y: 20 })
  hide("[data-anim='metric-card']", { scale: 0.9 })
  hide("[data-anim='stack-bucket'] .flex-wrap > span", { y: 8 })
  ScrollTrigger.batch("[data-anim='stack-bucket']", {
    onEnter: (els) => {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 })
      // chips "boot" in one by one
      const chips = els.flatMap((el) => Array.from((el as HTMLElement).querySelectorAll(".flex-wrap > span")))
      gsap.to(chips, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.025, delay: 0.15 })
    },
    start: "top 88%",
    once: true,
  })
  ScrollTrigger.batch("[data-anim='metric-card']", {
    onEnter: (els) => {
      gsap.to(els, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)", stagger: 0.07 })
      // numbers count up from 0
      els.forEach((el, i) => {
        const num = (el as HTMLElement).querySelector<HTMLElement>("[data-anim='metric-num']")
        if (!num) return
        const target = parseFloat(num.dataset.value ?? "")
        if (!Number.isFinite(target) || prefersReducedMotion()) return
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target, duration: 1.4, ease: "power3.out", delay: 0.1 + i * 0.07,
          onUpdate: () => { num.textContent = String(Math.round(counter.v)) },
        })
      })
    },
    start: "top 88%",
    once: true,
  })
}

export function initWorkReveal() {
  hide("[data-anim='case-card']", { y: 40 })
  ScrollTrigger.batch("[data-anim='case-card']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15 }),
    start: "top 88%",
    once: true,
  })

  // Visual cards — "blueprint → production":
  // card un-clips, lime wireframe draws itself, status ticks build → deploy → live,
  // then the real mockup fades in over the wireframe. Reverses when scrolled back above.
  if (prefersReducedMotion()) return
  gsap.utils.toArray<HTMLElement>("[data-anim='work-visual']").forEach((card) => {
    const zoom   = card.querySelector<HTMLElement>("[data-anim='work-zoom']")
    const wire   = card.querySelector<HTMLElement>("[data-anim='work-wire']")
    const grid   = card.querySelector<HTMLElement>("[data-anim='work-grid']")
    const wires  = card.querySelectorAll<SVGElement>("[data-wire]")
    const status = (k: string) => card.querySelector<HTMLElement>(`[data-status='${k}']`)
    const build = status("build"), deploy = status("deploy"), live = status("live")

    gsap.set(card, { clipPath: "inset(50% round 0px)" })
    if (zoom) gsap.set(zoom, { opacity: 0, scale: 1.12 })
    if (wires.length) gsap.set(wires, { drawSVG: "0%" })
    if (wire) gsap.set(wire, { opacity: 1 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: "top 75%", toggleActions: "play none none reverse" },
    })
    tl.to(card, { clipPath: "inset(0% round 0px)", duration: 1, ease: "power4.out" })
    if (grid)  tl.to(grid, { opacity: 1, duration: 0.5 }, "-=0.7")
    if (build) tl.to(build, { opacity: 1, duration: 0.2 }, "<")
    if (wires.length) tl.to(wires, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut", stagger: 0.03 }, "-=0.4")
    if (build && deploy) tl.to(build, { opacity: 0, duration: 0.15 }, "-=0.5").to(deploy, { opacity: 1, duration: 0.15 }, "<")
    if (zoom)  tl.to(zoom, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, "-=0.1")
    if (wire)  tl.to(wire, { opacity: 0, duration: 0.6 }, "<+=0.25")
    if (grid)  tl.to(grid, { opacity: 0, duration: 0.6 }, "<")
    if (deploy && live) tl.to(deploy, { opacity: 0, duration: 0.15 }, "<").to(live, { opacity: 1, duration: 0.2 }, "<")
  })
}

export function initTestimonialsReveal() {
  hide("[data-anim='testi-card']", { y: 24 })
  if (document.querySelector("[data-anim='quote-mark']")) {
    gsap.set("[data-anim='quote-mark']", { scale: 0, rotate: -25, transformOrigin: "left bottom" })
  }
  ScrollTrigger.batch("[data-anim='testi-card']", {
    onEnter: (els) => {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.1 })
      const marks = els.flatMap((el) => Array.from((el as HTMLElement).querySelectorAll("[data-anim='quote-mark']")))
      gsap.to(marks, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2.2)", stagger: 0.1, delay: 0.3 })
    },
    start: "top 88%",
    once: true,
  })
}

export function initFAQReveal() {
  hide("[data-anim='faq-row']", { y: 16 })
  ScrollTrigger.batch("[data-anim='faq-row']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }),
    start: "top 90%",
    once: true,
  })
}

export function initHeroReveal() {
  const section = document.querySelector<HTMLElement>("[data-anim='hero']")
  const scan    = section?.querySelector<HTMLElement>("[data-anim='hero-scan']")
  const grid    = section?.querySelector<HTMLElement>("[data-anim='hero-grid']")
  const glow    = section?.querySelector<HTMLElement>("[data-anim='hero-glow']")
  const items   = gsap.utils
    .toArray<HTMLElement>("[data-anim='hero-left-item'], [data-anim='hero-right'], [data-anim='hero-meta']")
    .filter((el) => el.offsetHeight > 0)

  // Fallback: plain fade-up (reduced motion, or markup without the scan line)
  if (!section || !scan || prefersReducedMotion()) {
    gsap.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" })
    return
  }

  // ── Boot: a lime scan line sweeps down the hero and "prints" each element as it passes ──
  const sRect = section.getBoundingClientRect()
  const DUR = 1.5
  gsap.set(items, { clipPath: "inset(0 0 100% 0)", y: 16 })
  const tl = gsap.timeline()
  tl.set(scan, { opacity: 1, top: 0 })
    .to(scan, { top: "100%", duration: DUR, ease: "power1.inOut" }, 0)
    .to(scan, { opacity: 0, duration: 0.35 }, DUR - 0.15)
  if (grid) tl.to(grid, { opacity: 1, duration: 1.4, ease: "power1.out" }, 0.3)
  if (glow) tl.to(glow, { opacity: 0.5, duration: 1.2 }, 0.6)
  items.forEach((el) => {
    const r = el.getBoundingClientRect()
    const at  = ((r.top - sRect.top) / sRect.height) * DUR * 0.92
    const dur = Math.max(0.4, (r.height / sRect.height) * DUR + 0.3)
    tl.to(el, { clipPath: "inset(0 0 0% 0)", y: 0, duration: dur, ease: "power2.out", clearProps: "clipPath" }, at)
  })

  // ── Exit: subtle parallax as the hero scrolls away ──
  const left  = section.querySelector<HTMLElement>("[data-anim='hero-left']")
  const right = section.querySelector<HTMLElement>("[data-anim='hero-right']")
  const st = { trigger: section, start: "top top", end: "bottom top", scrub: true }
  if (left)  gsap.to(left,  { y: -70, ease: "none", scrollTrigger: st })
  if (right) gsap.to(right, { y: -30, scale: 0.96, opacity: 0.35, ease: "none", scrollTrigger: st })
  if (grid)  gsap.to(grid,  { opacity: 0.25, ease: "none", scrollTrigger: st })
}

export function initAboutReveal() {
  hide("[data-anim='trip-pin']", { y: 12 })
  hide("[data-anim='about-fact']")
  ScrollTrigger.batch("[data-anim='trip-pin']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 }),
    start: "top 90%",
    once: true,
  })
  ScrollTrigger.batch("[data-anim='about-fact']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, duration: 0.5, stagger: 0.07 }),
    start: "top 90%",
    once: true,
  })
}

/* ── Site-wide "blueprint" language ─────────────────────────────── */

/** Top border of each section draws in left → right with a lime head. */
export function initSectionRules() {
  const sections = gsap.utils.toArray<HTMLElement>(".section-rule")
  if (!sections.length || prefersReducedMotion()) return
  sections.forEach((el) => {
    gsap.set(el, { "--rule": 0, "--rule-head": 1 })
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%", once: true } })
      .to(el, { "--rule": 1, duration: 1.4, ease: "power3.inOut" })
      .to(el, { "--rule-head": 0, duration: 0.4 }, "-=0.2")
  })
}

/** Section meta labels ("[ 05 / WORK ]") type themselves in with a caret. */
export function initSectionMeta() {
  const metas = gsap.utils.toArray<HTMLElement>("[data-anim='section-meta']")
  if (!metas.length || prefersReducedMotion()) return
  metas.forEach((el) => {
    // Remember the original text across StrictMode / context reverts.
    const full = el.dataset.text ?? (el.dataset.text = el.textContent ?? "")
    el.textContent = ""
    el.classList.add("typing")
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } })
      .to(el, { text: { value: full }, duration: Math.min(1.2, 0.045 * full.length + 0.2), ease: "none" })
      .call(() => el.classList.remove("typing"), [], "+=0.9")
  })
}

/** Lime outline draws around cards, then fades to the normal border. */
export function initWireOutlines() {
  const wires = gsap.utils.toArray<SVGRectElement>("[data-anim='wire-outline'] [data-wire]")
  if (!wires.length || prefersReducedMotion()) return
  // Size each rect to its card in px so DrawSVG measures the real perimeter.
  wires.forEach((rect) => {
    const svg = rect.ownerSVGElement
    if (!svg) return
    rect.setAttribute("width", String(Math.max(0, svg.clientWidth - 2)))
    rect.setAttribute("height", String(Math.max(0, svg.clientHeight - 2)))
  })
  gsap.set(wires, { drawSVG: "0%" })
  ScrollTrigger.batch("[data-anim='wire-outline']", {
    onEnter: (els) => {
      els.forEach((svg, i) => {
        const rect = (svg as SVGElement).querySelector("[data-wire]")
        if (!rect) return
        gsap.timeline({ delay: i * 0.08 })
          .to(rect, { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" })
          .to(svg, { opacity: 0, duration: 0.6, ease: "power1.out" }, "+=0.15")
      })
    },
    start: "top 85%",
    once: true,
  })
}

/** Process: lime rail grows down the list on scroll; step numbers light up as it passes. */
export function initProcessRail() {
  const list = document.querySelector<HTMLElement>("[data-anim='proc-list']")
  const rail = list?.querySelector<HTMLElement>("[data-anim='proc-rail']")
  if (!list || !rail || prefersReducedMotion()) return
  gsap.fromTo(rail, { scaleY: 0 }, {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: list, start: "top 65%", end: "bottom 65%", scrub: 0.4 },
  })
  list.querySelectorAll<HTMLElement>("[data-anim='proc-row']").forEach((row) => {
    const num = row.querySelector<HTMLElement>("[data-anim='proc-num']")
    if (!num) return
    ScrollTrigger.create({
      trigger: row, start: "top 65%",
      onEnter: () => num.classList.add("is-lit"),
      onLeaveBack: () => num.classList.remove("is-lit"),
    })
  })
}

/** Difference cards fade up with a stagger (outline draw handled by initWireOutlines). */
export function initDifferenceReveal() {
  hide("[data-anim='diff-card']", { y: 24 })
  ScrollTrigger.batch("[data-anim='diff-card']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.1 }),
    start: "top 88%",
    once: true,
  })
}
