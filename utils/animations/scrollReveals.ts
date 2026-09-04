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
  ScrollTrigger.batch("[data-anim='stack-bucket']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    start: "top 88%",
    once: true,
  })
  ScrollTrigger.batch("[data-anim='metric-card']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)", stagger: 0.07 }),
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
  ScrollTrigger.batch("[data-anim='testi-card']", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.1 }),
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
  gsap.fromTo(
    "[data-anim='hero-left-item']",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.75, stagger: 0.13, ease: "power2.out" }
  )
  gsap.fromTo(
    "[data-anim='hero-right']",
    { opacity: 0 },
    { opacity: 1, duration: 1.2, delay: 0.3, ease: "power1.out" }
  )
  gsap.fromTo(
    "[data-anim='hero-meta']",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay: 0.55, ease: "power2.out" }
  )
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
