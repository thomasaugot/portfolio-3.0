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
  gallery: {
    desktop: string[]
    mobile: string[]
  }
}
