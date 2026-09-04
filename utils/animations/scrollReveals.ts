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

  // Visual cards: un-clip from the centre while the mockup zooms out 120% → 100%.
  // Reverses when scrolling back above the card so it replays on the way down.
  if (prefersReducedMotion()) return
  gsap.utils.toArray<HTMLElement>("[data-anim='work-visual']").forEach((card) => {
    const zoom = card.querySelector<HTMLElement>("[data-anim='work-zoom']")
    gsap.set(card, { clipPath: "inset(50% round 0px)" })
    if (zoom) gsap.set(zoom, { scale: 1.2 })
    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: "top 75%", toggleActions: "play none none reverse" },
      defaults: { ease: "power4.out", duration: 1.6 },
    })
    tl.to(card, { clipPath: "inset(0% round 0px)" })
    if (zoom) tl.to(zoom, { scale: 1 }, "<")
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
