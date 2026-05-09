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
    <section className="page-section">
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
            <div className="news-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                aria-label="Email address"
                required
              />
              <button type="submit">{t("newsletter.btn")}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
