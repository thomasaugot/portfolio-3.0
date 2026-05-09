"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { showToast } from "@/components/ui/Toaster"

export function HomeNewsletter() {
  const t = useTranslations()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    showToast("You're subscribed! Thanks.", "success")
    setEmail("")
  }

  return (
    <section className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="newsletter-card">
          <div className="newsletter-body">
            <h3 className="newsletter-title">
              {t("newsletter.title")}
              <span className="text-serif-italic newsletter-title-italic">
                {t("newsletter.title_italic")}
              </span>
            </h3>
            <p className="newsletter-desc">{t("newsletter.body")}</p>
          </div>

          <form onSubmit={handleSubmit} className="newsletter-form-wrap">
            <div className="flex items-stretch border border-border-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                aria-label="Email address"
                required
                className="flex-1 bg-transparent border-0 py-3.5 px-4 text-text font-mono text-[14px] focus:outline-none"
              />
              <button type="submit" className="bg-primary text-black border-0 py-3.5 px-[18px] font-mono text-[13px] font-medium cursor-pointer transition-colors hover:bg-text">
                {t("newsletter.btn")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
