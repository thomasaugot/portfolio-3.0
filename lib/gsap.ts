"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP)

export { gsap, ScrollTrigger, DrawSVGPlugin, useGSAP }
