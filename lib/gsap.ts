"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { TextPlugin } from "gsap/TextPlugin"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, TextPlugin, useGSAP)

export { gsap, ScrollTrigger, DrawSVGPlugin, useGSAP }
