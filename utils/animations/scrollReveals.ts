"use client"

import { gsap, ScrollTrigger } from "@/lib/gsap"

// Set initial hidden state synchronously so there's no flash before the ScrollTrigger fires
function hide(selector: string, props: gsap.TweenVars = {}) {
  gsap.set(selector, { opacity: 0, ...props })
}

export function initSectionReveals() {
  hide(".section-head", { y: 32 })
  ScrollTrigger.batch(".section-head", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }),
    start: "top 88%",
    once: true,
  })
}

export function initServiceCardsReveal() {
  hide(".service-card", { y: 24 })
  ScrollTrigger.batch(".service-card", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.08 }),
    start: "top 88%",
    once: true,
  })
}

export function initProcessReveal() {
  hide(".proc-row", { x: -20 })
  ScrollTrigger.batch(".proc-row", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    start: "top 90%",
    once: true,
  })
}

export function initStackReveal() {
  hide(".stack-bucket", { y: 20 })
  hide(".metric-card", { scale: 0.9 })
  ScrollTrigger.batch(".stack-bucket", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
    start: "top 88%",
    once: true,
  })
  ScrollTrigger.batch(".metric-card", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)", stagger: 0.07 }),
    start: "top 88%",
    once: true,
  })
}

export function initWorkReveal() {
  hide(".case-card", { y: 40 })
  ScrollTrigger.batch(".case-card", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15 }),
    start: "top 88%",
    once: true,
  })
}

export function initTestimonialsReveal() {
  hide(".testi-card", { y: 24 })
  ScrollTrigger.batch(".testi-card", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.1 }),
    start: "top 88%",
    once: true,
  })
}

export function initFAQReveal() {
  hide(".faq-row", { y: 16 })
  ScrollTrigger.batch(".faq-row", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }),
    start: "top 90%",
    once: true,
  })
}

export function initHeroReveal() {
  gsap.fromTo(
    ".hero-left-item",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.75, stagger: 0.13, ease: "power2.out" }
  )
  gsap.fromTo(
    ".hero-right",
    { opacity: 0 },
    { opacity: 1, duration: 1.2, delay: 0.3, ease: "power1.out" }
  )
  gsap.fromTo(
    ".hero-meta",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay: 0.55, ease: "power2.out" }
  )
}

export function initAboutReveal() {
  hide(".trip-pin", { y: 12 })
  hide(".about-fact")
  ScrollTrigger.batch(".trip-pin", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 }),
    start: "top 90%",
    once: true,
  })
  ScrollTrigger.batch(".about-fact", {
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, duration: 0.5, stagger: 0.07 }),
    start: "top 90%",
    once: true,
  })
}
