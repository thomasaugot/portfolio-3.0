interface GTMEvent { event: string; [key: string]: unknown }

export const pushToDataLayer = (data: GTMEvent) => {
  if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
    ;(window.dataLayer as GTMEvent[]).push(data)
  }
}

export const trackCTAClick = (text: string, url: string) =>
  pushToDataLayer({ event: "cta_click", cta_text: text, cta_url: url })

export const trackScrollDepth = (percent: number) =>
  pushToDataLayer({ event: "scroll_depth", scroll_percent: percent.toString() })

export const trackProjectClick = (name: string, url: string) =>
  pushToDataLayer({ event: "project_click", project_name: name, project_url: url })

export const trackExternalLink = (label: string, url: string) =>
  pushToDataLayer({ event: "external_link", link_label: label, link_url: url })
