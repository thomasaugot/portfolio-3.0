"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const COUNT = 5000

// Lesson-40 morphing vertex shader with inlined simplex noise
const vertSrc = `
  uniform vec2 uResolution;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec2 uMouse;

  attribute vec3 aPositionTarget;
  attribute float aSize;

  varying vec3 vColor;

  vec4 sn_permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
  vec4 sn_tis(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise3(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+2.0*C.xxx;
    vec3 x3=x0-1.0+3.0*C.xxx;
    i=mod(i,289.0);
    vec4 p=sn_permute(sn_permute(sn_permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=1.0/7.0;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=sn_tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    float noiseOrigin=snoise3(position*0.2);
    float noiseTarget=snoise3(aPositionTarget*0.2);
    float noise=mix(noiseOrigin,noiseTarget,uProgress);
    noise=smoothstep(-1.0,1.0,noise);

    float duration=0.4;
    float delay=(1.0-duration)*noise;
    float progress=smoothstep(delay,delay+duration,uProgress);
    vec3 pos=mix(position,aPositionTarget,progress);

    // Alive drift so it never looks static
    pos.x+=sin(uTime*0.38+pos.y*2.0)*0.028;
    pos.y+=cos(uTime*0.30+pos.x*2.0)*0.028;
    pos.z+=sin(uTime*0.26+pos.x*2.4)*0.016;

    // Mouse repulsion
    vec2 toM=pos.xy-uMouse*3.5;
    float md=length(toM);
    pos.xy+=normalize(toM+0.001)*smoothstep(1.6,0.0,md)*0.6;

    vec4 mv=modelViewMatrix*vec4(pos,1.0);
    gl_Position=projectionMatrix*mv;
    gl_PointSize=aSize*0.26*uResolution.y*(1.0/-mv.z);

    vColor=mix(uColorA,uColorB,noise);
  }
`

// Lesson-40 glow-dot fragment — 0.05/d-0.1 creates the corona
const fragSrc = `
  varying vec3 vColor;
  void main(){
    float d=length(gl_PointCoord-0.5);
    float alpha=0.05/d-0.1;
    gl_FragColor=vec4(vColor,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// ─── Shape generators ──────────────────────────────────────────────────────

function makeCodeShape(text: string, count: number): Float32Array {
  const W = 600, H = 220
  const cv = document.createElement("canvas")
  cv.width = W; cv.height = H
  const ctx = cv.getContext("2d")!
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = "#fff"
  ctx.font = "bold 160px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, W / 2, H / 2)

  const data = ctx.getImageData(0, 0, W, H).data
  const lit: number[] = []
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4] > 100) lit.push(x, y)

  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    if (lit.length < 2) { out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0; continue }
    const r = Math.floor(Math.random() * (lit.length / 2)) * 2
    out[i * 3]     =  (lit[r]     / W - 0.5) * 5.6
    out[i * 3 + 1] = -(lit[r + 1] / H - 0.5) * 2.1
    out[i * 3 + 2] =  (Math.random() - 0.5) * 0.12
  }
  return out
}

function makeGlobeShape(count: number): Float32Array {
  // Lat/lon wireframe — particles along grid lines so it reads as a globe
  const R = 1.9
  const pts: number[] = []

  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = (90 - lat) * Math.PI / 180
    for (let t = 0; t < 1; t += 0.0025) {
      const theta = t * 2 * Math.PI
      pts.push(
        -R * Math.sin(phi) * Math.cos(theta),
         R * Math.cos(phi),
         R * Math.sin(phi) * Math.sin(theta),
      )
    }
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = lon * Math.PI / 180
    for (let t = 0; t < 1; t += 0.003) {
      const phi = t * Math.PI
      pts.push(
        -R * Math.sin(phi) * Math.cos(theta),
         R * Math.cos(phi),
         R * Math.sin(phi) * Math.sin(theta),
      )
    }
  }

  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * (pts.length / 3)) * 3
    out[i * 3]     = pts[idx]
    out[i * 3 + 1] = pts[idx + 1]
    out[i * 3 + 2] = pts[idx + 2]
  }
  return out
}

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 8)

    // Three shapes that tell who Thomas is:
    //  </> → what he writes (web dev, JSX, HTML)
    //  { } → how he writes it (JavaScript / TypeScript)
    //  globe → where he's done it (6 countries across 3 continents)
    const shapes: Float32Array[] = [
      makeCodeShape("</>", COUNT),
      makeCodeShape("{ }", COUNT),
      makeGlobeShape(COUNT),
    ]

    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) sizes[i] = Math.random()

    const posAttr = new THREE.BufferAttribute(shapes[0].slice(), 3)
    const tgtAttr = new THREE.BufferAttribute(shapes[1].slice(), 3)
    posAttr.usage = THREE.DynamicDrawUsage
    tgtAttr.usage = THREE.DynamicDrawUsage

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position",        posAttr)
    geo.setAttribute("aPositionTarget", tgtAttr)
    geo.setAttribute("aSize",           new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader:   vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uProgress:   { value: 0 },
        uTime:       { value: 0 },
        uColorA:     { value: new THREE.Color("#3a6e00") },
        uColorB:     { value: new THREE.Color("#d4ff3a") },
        uMouse:      { value: new THREE.Vector2(0, 0) },
      },
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      transparent: true,
    })

    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    scene.add(points)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const dpr = renderer.getPixelRatio()
      mat.uniforms.uResolution.value.set(w * dpr, h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const mouse = { x: 0, y: 0 }
    const targetMouse = new THREE.Vector2()
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
    }
    window.addEventListener("mousemove", onMouseMove)

    let shapeIdx    = 0
    let morphing    = false
    let morphProg   = 0
    let nextMorphIn = 3.5

    const MORPH_DUR   = 2.5
    const MORPH_PAUSE = 3.5

    let rafId: number
    let last = performance.now()
    let elapsed = 0

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      elapsed += dt

      // Very subtle slow rotation so the globe reads as 3D
      points.rotation.y += 0.008 * dt

      if (!morphing) {
        nextMorphIn -= dt
        if (nextMorphIn <= 0) {
          morphing = true
          morphProg = 0
          mat.uniforms.uProgress.value = 0
          const nextIdx = (shapeIdx + 1) % shapes.length
          posAttr.array = shapes[shapeIdx]
          posAttr.needsUpdate = true
          tgtAttr.array = shapes[nextIdx]
          tgtAttr.needsUpdate = true
          shapeIdx = nextIdx
        }
      }

      if (morphing) {
        morphProg += dt / MORPH_DUR
        if (morphProg >= 1) { morphProg = 1; morphing = false; nextMorphIn = MORPH_PAUSE }
        mat.uniforms.uProgress.value = morphProg
      }

      mat.uniforms.uTime.value = elapsed
      targetMouse.set(mouse.x, mouse.y)
      mat.uniforms.uMouse.value.lerp(targetMouse, 0.06)

      renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener("mousemove", onMouseMove)
      geo.dispose(); mat.dispose(); renderer.dispose()
    }
  }, [])

  return (
    <div className="absolute inset-[-15%_-40%] z-0 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} aria-hidden="true" className="hero-backdrop-canvas block w-full h-full pointer-events-auto contrast-105 opacity-[0.95] cursor-grab active:cursor-grabbing" />
    </div>
  )
}
