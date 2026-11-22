export interface Project {
  n: string
  slug: string
  client: string
  tag: string
  type: string
  year: string
  cover: string
  cover2?: string
  mobileCover?: string
  domain: string
  kind: "web" | "mobile"
  href?: string
  /** Optional second live URL (e.g. a companion app) */
  href2?: string
  domain2?: string
  gallery: {
    desktop: string[]
    mobile: string[]
  }
  /** Motion work: the case study plays this loop in the browser frame instead of the gallery */
  video?: {
    src: string
    poster: string
    /** what the loop shows, for screen readers */
    label: string
  }
}
