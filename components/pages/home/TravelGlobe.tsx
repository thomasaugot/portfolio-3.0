"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import * as topojson from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"

const R = 1.4

const PINS = [
  { city: "Rennes",       country: "FR", lat:  48.11, lon:  -1.68 },
  { city: "Gold Coast",   country: "AU", lat: -28.02, lon: 153.40 },
  { city: "Dublin",       country: "IE", lat:  53.35, lon:  -6.26 },
  { city: "Barcelona",    country: "ES", lat:  41.39, lon:   2.17 },
  { city: "Munchen",      country: "DE", lat:  48.14, lon:  11.58 },
  { city: "Nantes",       country: "FR", lat:  47.22, lon:  -1.55 },
  { city: "Las Palmas",   country: "ES", lat:  28.13, lon: -15.43 },
  { city: "Mt Maunganui", country: "NZ", lat: -37.63, lon: 176.19 },
  { city: "Broome",       country: "AU", lat: -17.96, lon: 122.24 },
  { city: "Corralejo",    country: "ES", lat:  28.73, lon: -13.87 },
]

function lonLatToVec3(lon: number, lat: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * Math.PI / 180
  const theta = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  )
}

function greatCircleArc(lon1: number, lat1: number, lon2: number, lat2: number, segments = 48, r = R + 0.006): THREE.Vector3[] {
  const a = lonLatToVec3(lon1, lat1, 1).normalize()
  const b = lonLatToVec3(lon2, lat2, 1).normalize()
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    pts.push(new THREE.Vector3().lerpVectors(a, b, t).normalize().multiplyScalar(r))
  }
  return pts
}

const earthVertSrc = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vUv = uv;
    vNormal = modelNormal;
    vPosition = modelPosition.xyz;
  }
`

const earthFragSrc = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform sampler2D uDayTexture;
  uniform sampler2D uNightTexture;
  uniform sampler2D uSpecularCloudsTexture;
  uniform vec3 uSunDirection;
  uniform vec3 uAtmosphereDayColor;
  uniform vec3 uAtmosphereTwilightColor;

  void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    float sunOrientation = dot(uSunDirection, normal);

    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
    vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    vec2 specularCloudsColor = texture2D(uSpecularCloudsTexture, vUv).rg;
    float cloudsMix = smoothstep(0.2, 1.0, specularCloudsColor.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix);

    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    vec3 reflection = reflect(-uSunDirection, normal);
    float specular = -dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    specular *= specularCloudsColor.r;
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    gl_FragColor = vec4(color, 1.0);
  }
`

const atmVertSrc = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    vNormal = modelNormal;
    vPosition = modelPosition.xyz;
  }
`

const atmFragSrc = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform vec3 uSunDirection;
  uniform vec3 uAtmosphereDayColor;
  uniform vec3 uAtmosphereTwilightColor;

  void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    float sunOrientation = dot(uSunDirection, normal);

    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);

    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);
    float alpha = edgeAlpha * dayAlpha;

    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`

interface Props {
  onHover?: (pin: { city: string; country: string } | null) => void
}

export function TravelGlobe({ onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    camera.position.set(0, 0, 4.2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const group = new THREE.Group()
    scene.add(group)

    const loader = new THREE.TextureLoader()

    const sunDirection = new THREE.Vector3(1.5, 1.2, 1.0).normalize()
    const atmDayColor = new THREE.Color("#0088ff")
    const atmTwilightColor = new THREE.Color("#ff4400")

    const earthMat = new THREE.ShaderMaterial({
      vertexShader: earthVertSrc,
      fragmentShader: earthFragSrc,
      uniforms: {
        uDayTexture:             { value: null },
        uNightTexture:           { value: null },
        uSpecularCloudsTexture:  { value: null },
        uSunDirection:           { value: sunDirection },
        uAtmosphereDayColor:     { value: atmDayColor },
        uAtmosphereTwilightColor:{ value: atmTwilightColor },
      },
    })

    const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), earthMat)
    group.add(earthMesh)

    const atmMat = new THREE.ShaderMaterial({
      vertexShader: atmVertSrc,
      fragmentShader: atmFragSrc,
      uniforms: {
        uSunDirection:           { value: sunDirection },
        uAtmosphereDayColor:     { value: atmDayColor },
        uAtmosphereTwilightColor:{ value: atmTwilightColor },
      },
      side: THREE.BackSide,
      transparent: true,
    })
    const atmMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), atmMat)
    atmMesh.scale.setScalar(1.04)
    group.add(atmMesh)

    loader.load("/assets/textures/earth/day.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      earthMat.uniforms.uDayTexture.value = tex
    })
    loader.load("/assets/textures/earth/night.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      earthMat.uniforms.uNightTexture.value = tex
    })
    loader.load("/assets/textures/earth/specularClouds.jpg", (tex) => {
      tex.anisotropy = 8
      earthMat.uniforms.uSpecularCloudsTexture.value = tex
    })

    // Lat/lon grid lines
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a2a14, transparent: true, opacity: 0.4 })
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = []
      for (let lon = 0; lon <= 361; lon += 3) pts.push(lonLatToVec3(lon - 180, lat, R + 0.002))
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }
    for (let lon = 0; lon < 360; lon += 60) {
      const pts: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 3) pts.push(lonLatToVec3(lon - 180, lat, R + 0.002))
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }

    // Country borders
    const borderMat = new THREE.LineBasicMaterial({ color: 0x8adc4a, transparent: true, opacity: 0.55 })
    const borderR = R + 0.004
    fetch("/data/countries-110m.json")
      .then((res) => res.json())
      .then((topo: Topology) => {
        const borders = topojson.mesh(topo, topo.objects["countries"] as GeometryCollection)
        for (const ring of borders.coordinates) {
          if (ring.length < 2) continue
          const pts = ring.map(([lon, lat]) => lonLatToVec3(lon, lat, borderR))
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), borderMat))
        }
      })
      .catch(() => {})

    // City-to-city arcs
    const arcMat = new THREE.LineBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: 0.28 })
    for (let i = 0; i < PINS.length - 1; i++) {
      const a = PINS[i], b = PINS[i + 1]
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(greatCircleArc(a.lon, a.lat, b.lon, b.lat)),
        arcMat
      ))
    }

    // City pins + pulse rings
    const pinGeo  = new THREE.SphereGeometry(0.026, 8, 8)
    const ringGeo = new THREE.RingGeometry(0.034, 0.05, 16)
    const pinMat  = new THREE.MeshBasicMaterial({ color: 0xd4ff3a })

    const pinObjs = PINS.map((p, i) => {
      const mesh = new THREE.Mesh(pinGeo, pinMat)
      mesh.position.copy(lonLatToVec3(p.lon, p.lat, R + 0.024))
      mesh.userData = { ...p, idx: i }
      group.add(mesh)

      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      )
      ring.position.copy(mesh.position)
      ring.lookAt(0, 0, 0)
      group.add(ring)

      return { mesh, ring }
    })

    // Hover via raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-10, -10)
    let hovered: typeof PINS[0] | null = null

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    }
    window.addEventListener("pointermove", onPointerMove)

    // Drag to rotate
    const drag = { vx: 0, vy: 0, dragging: false, lx: 0, ly: 0, manual: false }
    const onDown = (e: PointerEvent) => { drag.dragging = true; drag.lx = e.clientX; drag.ly = e.clientY }
    const onMove = (e: PointerEvent) => {
      if (!drag.dragging) return
      drag.vx = (e.clientY - drag.ly) * 0.006
      drag.vy = (e.clientX - drag.lx) * 0.006
      drag.lx = e.clientX; drag.ly = e.clientY
      drag.manual = true
    }
    const onUp = () => { drag.dragging = false }
    canvas.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    let rafId: number, elapsed = 0, last = performance.now()

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      elapsed += dt

      if (!drag.manual) {
        group.rotation.y += 0.06 * dt
      } else {
        group.rotation.y += drag.vy
        group.rotation.x += drag.vx
        drag.vx *= 0.92; drag.vy *= 0.92
        if (Math.abs(drag.vx) < 0.0005 && Math.abs(drag.vy) < 0.0005) drag.manual = false
      }

      pinObjs.forEach(({ ring }, i) => {
        const phase = (elapsed * 1.4 + i * 0.7) % 2.4
        if (phase < 1.6) {
          const k = phase / 1.6
          ring.scale.setScalar(1 + k * 2)
          ;(ring.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.5
        } else {
          ;(ring.material as THREE.MeshBasicMaterial).opacity = 0
        }
      })

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(pinObjs.map((p) => p.mesh))
      const hit = (hits[0]?.object?.userData as typeof PINS[0] | undefined) ?? null
      if ((hit?.city ?? null) !== (hovered?.city ?? null)) {
        hovered = hit
        onHover?.(hit ? { city: hit.city, country: hit.country } : null)
      }

      renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointermove", onPointerMove)
      renderer.dispose()
    }
  }, [onHover])

  return <canvas ref={canvasRef} className="globe-canvas" />
}
