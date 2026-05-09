"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    camera.position.set(0, 0, 6)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Group container
    const group = new THREE.Group()
    scene.add(group)

    // Wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(1.6, 2)
    const wireMat = new THREE.LineBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: 0.55 })
    const edges = new THREE.EdgesGeometry(geo)
    const lines = new THREE.LineSegments(edges, wireMat)
    group.add(lines)

    // Inner dot points
    const dotGeo = new THREE.IcosahedronGeometry(1.6, 3)
    const dotMat = new THREE.PointsMaterial({ color: 0xf4f1e8, size: 0.035, transparent: true, opacity: 0.45 })
    const dots = new THREE.Points(dotGeo, dotMat)
    group.add(dots)

    // Outer faint halo sphere
    const haloEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 1))
    const haloMat = new THREE.LineBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: 0.12 })
    const halo = new THREE.LineSegments(haloEdges, haloMat)
    group.add(halo)

    // Drift particles
    const partCount = 80
    const positions = new Float32Array(partCount * 3)
    for (let i = 0; i < partCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const driftMat = new THREE.PointsMaterial({ color: 0xf4f1e8, size: 0.02, transparent: true, opacity: 0.45 })
    const drift = new THREE.Points(pGeo, driftMat)
    scene.add(drift)

    // Drag interaction
    const drag = { vx: 0, vy: 0, dragging: false, lx: 0, ly: 0 }
    const onDown = (e: PointerEvent) => { drag.dragging = true; drag.lx = e.clientX; drag.ly = e.clientY }
    const onMove = (e: PointerEvent) => {
      if (!drag.dragging) return
      drag.vx = (e.clientY - drag.ly) * 0.005
      drag.vy = (e.clientX - drag.lx) * 0.005
      drag.lx = e.clientX; drag.ly = e.clientY
    }
    const onUp = () => { drag.dragging = false }
    canvas.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    // Render loop
    let rafId: number
    let last = performance.now()
    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000); last = now

      group.rotation.y += 0.06 * dt + drag.vy
      group.rotation.x += 0.024 * dt + drag.vx
      drag.vx *= 0.94; drag.vy *= 0.94
      halo.rotation.y -= 0.02 * dt
      halo.rotation.x += 0.015 * dt
      drift.rotation.y += 0.01 * dt

      renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      geo.dispose(); edges.dispose(); wireMat.dispose()
      dotGeo.dispose(); dotMat.dispose()
      haloEdges.dispose(); haloMat.dispose()
      pGeo.dispose(); driftMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div className="hero-backdrop-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-backdrop-canvas" />
    </div>
  )
}
