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
  initAboutReveal,
} from "@/utils/animations/scrollReveals"
import { HomeHero } from "@/components/pages/home/HomeHero"
import { HomeClientMarquee } from "@/components/pages/home/HomeClientMarquee"
import { HomeServices } from "@/components/pages/home/HomeServices"
import { HomeDifference } from "@/components/pages/home/HomeDifference"
import { HomeProcess } from "@/components/pages/home/HomeProcess"
import { HomeStack } from "@/components/pages/home/HomeStack"
import { HomeWork } from "@/components/pages/home/HomeWork"
import { HomeTestimonials } from "@/components/pages/home/HomeTestimonials"
import { HomeAbout } from "@/components/pages/home/HomeAbout"
import { HomeContact } from "@/components/pages/home/HomeContact"
import { HomeSocials } from "@/components/pages/home/HomeSocials"
import { HomeBlogBanner } from "@/components/pages/home/HomeBlogBanner"

interface Post { slug: string; title: string; cover: string | null; readingMin: number }

export function HomePageClient({ latestPosts }: { latestPosts: Post[] }) {
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
      initAboutReveal,
    ],
  }))

  return (
    <div>
      <HomeHero />
      <HomeClientMarquee />
      <HomeServices />
      <HomeDifference />      
      <HomeProcess />
      <HomeStack />
      <HomeWork />
      <HomeTestimonials />
      <HomeAbout />
      <HomeContact />
      <HomeBlogBanner posts={latestPosts} />
      <HomeSocials />
    </div>
  )
}
