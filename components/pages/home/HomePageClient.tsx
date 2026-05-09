"use client"

import { usePageReady } from "@/hooks/usePageReady"
import { useGSAPAnimations } from "@/hooks/useGSAPAnimations"
import {
  initHeroReveal,
  initSectionReveals,
  initServiceCardsReveal,
  initProcessReveal,
  initStackReveal,
  initWorkReveal,
  initTestimonialsReveal,
  initFAQReveal,
  initAboutReveal,
} from "@/utils/animations/scrollReveals"
import { HomeHero } from "@/components/pages/home/HomeHero"
import { HomeClientMarquee } from "@/components/pages/home/HomeClientMarquee"
import { HomeServices } from "@/components/pages/home/HomeServices"
import { HomeProcess } from "@/components/pages/home/HomeProcess"
import { HomeStack } from "@/components/pages/home/HomeStack"
import { HomeWork } from "@/components/pages/home/HomeWork"
import { HomeTestimonials } from "@/components/pages/home/HomeTestimonials"
import { HomeAbout } from "@/components/pages/home/HomeAbout"
import { HomeFAQ } from "@/components/pages/home/HomeFAQ"
import { HomeContact } from "@/components/pages/home/HomeContact"
import { HomeSocials } from "@/components/pages/home/HomeSocials"

export function HomePageClient() {
  usePageReady()

  useGSAPAnimations(() => ({
    critical: [initHeroReveal],
    raf: [
      initSectionReveals,
      initServiceCardsReveal,
      initProcessReveal,
      initStackReveal,
      initWorkReveal,
      initTestimonialsReveal,
      initFAQReveal,
      initAboutReveal,
    ],
  }))

  return (
    <div>
      <HomeHero />
      <HomeClientMarquee />
      <HomeServices />
      <HomeProcess />
      <HomeStack />
      <HomeWork />
      <HomeTestimonials />
      <HomeAbout />
      <HomeFAQ />
      <HomeContact />
      <HomeSocials />
    </div>
  )
}
