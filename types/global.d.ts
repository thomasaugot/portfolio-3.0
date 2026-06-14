// Google Tag Manager pushes events onto window.dataLayer.
// (Previously provided implicitly by @next/third-parties' GoogleTagManager type;
// declared here now that GTM is injected manually via ConsentGTM after consent.)
export {}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}
