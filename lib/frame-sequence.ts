/**
 * Plays a numbered image sequence on a canvas from a 0..1 position.
 *
 * The playhead eases toward its target every animation frame and always shows
 * one whole frame, the nearest one. No cross-fade: these frames are snapshots
 * taken far apart, and blending two of them reads as a double exposure.
 * Frames load coarse to fine (every 16th, then every 8th, ...) so the whole
 * range is usable early and sharpens as the rest arrives.
 */
export class FrameSequence {
  private images: (HTMLImageElement | null)[]
  private ready: boolean[]
  private ctx: CanvasRenderingContext2D
  private target = 0
  private current = 0
  private raf: number | null = null
  private lastDrawn = -1
  private dpr = Math.min(window.devicePixelRatio || 1, 2)
  private canvas: HTMLCanvasElement
  private urls: string[]
  private resizeObserver: ResizeObserver
  private started = false
  onFrame?: (index: number) => void

  private maxWidth: number

  /** maxWidth: the frames' own pixel width. A backing store wider than that adds no detail, only fill cost. */
  constructor(canvas: HTMLCanvasElement, urls: string[], maxWidth = Infinity) {
    this.canvas = canvas
    this.maxWidth = maxWidth
    this.urls = urls
    this.images = urls.map(() => null)
    this.ready = urls.map(() => false)
    this.ctx = canvas.getContext("2d", { alpha: false })!
    this.resizeObserver = new ResizeObserver(this.resize)
    this.resizeObserver.observe(canvas)
  }

  private order(): number[] {
    const n = this.urls.length
    const seen = new Set<number>()
    const out: number[] = []
    for (let step = 16; step >= 1; step /= 2) {
      for (let i = 0; i < n; i += step) {
        if (!seen.has(i)) {
          seen.add(i)
          out.push(i)
        }
      }
    }
    if (!seen.has(n - 1)) out.push(n - 1)
    return out
  }

  /** Starts downloading. Safe to call more than once. */
  load(concurrency = 6): void {
    if (this.started) return
    this.started = true
    const queue = this.order()
    let active = 0
    const next = () => {
      while (active < concurrency && queue.length) {
        const i = queue.shift()!
        active++
        const img = new Image()
        img.decoding = "async"
        img.src = this.urls[i]
        img
          .decode()
          .catch(() => undefined)
          .finally(() => {
            this.images[i] = img
            this.ready[i] = img.naturalWidth > 0
            if (Math.abs(i - this.current * (this.urls.length - 1)) < 17) {
              this.lastDrawn = -1
              this.draw()
            }
            active--
            next()
          })
      }
    }
    next()
  }

  seek(p: number): void {
    this.target = Math.min(1, Math.max(0, p))
    this.loop()
  }

  private resize = () => {
    const r = this.canvas.getBoundingClientRect()
    const scale = Math.min(this.dpr, this.maxWidth / Math.max(1, r.width))
    this.canvas.width = Math.max(1, Math.round(r.width * scale))
    this.canvas.height = Math.max(1, Math.round(r.height * scale))
    this.lastDrawn = -1
    this.draw()
  }

  private nearest(i: number): HTMLImageElement | null {
    for (let d = 0; d < this.urls.length; d++) {
      if (this.ready[i - d]) return this.images[i - d]
      if (this.ready[i + d]) return this.images[i + d]
    }
    return null
  }

  private cover(img: HTMLImageElement) {
    const cw = this.canvas.width
    const ch = this.canvas.height
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }

  private draw() {
    const i = Math.round(this.current * (this.urls.length - 1))
    if (i === this.lastDrawn) return
    const img = this.ready[i] ? this.images[i] : this.nearest(i)
    if (!img) return
    // only remember the frame once its own image is on screen, so it repaints when it arrives
    this.lastDrawn = this.ready[i] ? i : -1
    this.cover(img)
    this.onFrame?.(i)
  }

  private loop = () => {
    if (this.raf !== null) return
    const step = () => {
      this.raf = null
      const delta = this.target - this.current
      this.current += Math.abs(delta) < 0.00005 ? delta : delta * 0.16
      this.draw()
      if (this.current !== this.target) this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  dispose(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    this.resizeObserver.disconnect()
  }
}
